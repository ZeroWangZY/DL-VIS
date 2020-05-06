import React, { Component } from 'react';
import { LineChartProps, LineGroupState } from './props';
import { computeXYScales } from './computed'
import * as d3 from 'd3';
import Axis from './Axis'
import  SmartMotion from './SmartMotion';
export default class LineGroup extends Component<LineChartProps, LineGroupState> {
  static defaultProps: LineChartProps = {
    showAxis: false,
    showLegend: false,
    isInteractive: false
  };
  ref: SVGSVGElement
  constructor(props) {
    super(props);
    this.state = {
      renderData: {},
      tooltipData: [],
      lineX: null,
      toolPosition: {
        x: null,
        y: null
      },
      legendData: []
    }
    this.hideTooltip = this.hideTooltip.bind(this)
    this.computed = this.computed.bind(this)
  }
  UNSAFE_componentWillMount() {
    this.computed(this.props)
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
   this.computed(nextProps)
  }
  // componentDidUpdate(){
  //   // console.log('test')
  // }
  componentDidMount() {
    const { renderData } = this.state;
    const self = this
     d3.select(this.ref).select('rect').on("mousemove", function () {
      let mouseX = d3.mouse((this as any) as SVGSVGElement)[0]
      let x = renderData.xScale.invert(mouseX)
      const bisect = d3.bisector((d: any) => d.data.x).left;
      //拿第一组数据查询
      let _index = bisect(renderData.series[0].data, x, 1)
      let index = x - renderData.series[0].data[_index - 1].x > renderData.series[0].data[_index].x - x ? _index : _index - 1
      let tooltipData = renderData.series.map((line: any) => {
        return {
          id: line.id,
          data: line.data[index],
          color: line.color
        }
      })
      self.setState({
        tooltipData,
        lineX: renderData.series[0].data[index].data.x,
        toolPosition: {
          x: d3.event.pageX,
          y: d3.event.pageY
        }
      })
    });
  }
  computed(props) {
    const { width, height, data } = props;
    const renderData = computeXYScales(data, width, height)
    let legendData = renderData.series.map((line: any) => {
      return {
        id: line.id,
        color: line.color
      }
    })
    this.setState({
      renderData,
      legendData
    })
  }
  hideTooltip() {
    this.setState({
      tooltipData: [],
      lineX: null,
      toolPosition: {
        x: null,
        y: null
      }
    })
  }

  onSubmit(iteration) {
    if (this.props.onSubmit) {
      this.props.onSubmit(iteration)
    }
  }

  render() {
    // console.log('test')
    const { width, height, transform, showAxis, showLegend, onSubmit, isInteractive } = this.props;
    const { renderData, tooltipData, lineX, toolPosition, legendData } = this.state;
    const lineGenerator = d3.line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveMonotoneX)
    const springConfig = {
        stiffness: 90,
        damping: 15,
      };
    const linePart = (<g>
      {renderData.series.map(({ id, color, data },i) => (
        <SmartMotion
        key={i}
        style={spring => ({
          d: spring(lineGenerator(data.map(d => d.position)), springConfig),
          stroke: spring(color, springConfig),
        })}
      >
      {style => (
        <path
          key={i}
          d={style.d}
          fill="none"
          strokeWidth={1}
          stroke={style.stroke}
        />)}
         </SmartMotion>
      ))}
    </g>)
    const axis = (showAxis ? <g className={'axis'}>
      <Axis orient={'left'} scale={renderData.yScale} tickNumber={3} />
      <Axis orient={'bottom'} scale={renderData.xScale} transform={`translate(0,${height})`} />
    </g> : "")
    return (
      <g transform={transform} className={'line-chart'} ref={(ref: SVGSVGElement) => this.ref = ref}>
        {lineX && <line x1={renderData.xScale(lineX)} x2={renderData.xScale(lineX)} y1={height} y2={15} style={{
          stroke: 'grey',
          strokeWidth: 1,
          strokeDasharray: '3,3'
        }} />}
        {linePart}
        {axis}
        {isInteractive&&<rect
          className={'tipbox'}
          width={width}
          height={height}
          fill='none'
          opacity="0"
          // onMouseMove={this.showTooltip}
          onClick={() => onSubmit&&onSubmit(lineX)}
          onMouseLeave={this.hideTooltip} />}
        {tooltipData.map((tooltip, i) =>
          <g transform={`translate(${tooltip.data.position[0]},${tooltip.data.position[1]})`} key={i}>
            <circle r={4} stroke={tooltip.color} fill={'#F1F3F3'} strokeWidth={2}></circle>
            <text dx={'.51em'} dy={'.51em'} fill={'rgb(106, 124, 137)'}>{parseInt(tooltip.data.data.y)}</text>
          </g>
        )}
        {showLegend && legendData.map((legend, i) =>
          <g transform={`translate(${i*95 + 20},0)`} key={i}>
            <line x1={0} x2={5} stroke={legend.color} />
            <circle cx={9} r={4} stroke={legend.color} fill={'#F1F3F3'}></circle>
            <line x1={13} x2={18} stroke={legend.color} />
            <text dx={'1.51em'} dy={'.31em'} fill={'rgb(106, 124, 137)'}>{legend.id}</text>
          </g>
        )}
      </g>
    );
  }
}