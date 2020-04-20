import React, { Component } from 'react';
import LineGroup from './LineGroup';
import { LineChartProps } from './props';
export default class LineChart extends Component<LineChartProps, {}> {
  static defaultProps: LineChartProps = {
    margin: { left: 30, right: 10, top: 10, bottom: 20 }
  };
  private ref: React.RefObject<HTMLDivElement>;
  constructor(props) {
    super(props);
    this.state = {
      // isTooltipVisible: false,
      // tooltipContent: null,
      // position: {},
    };
    this.ref = React.createRef()
  }
  render() {
    const props = this.props;
    const { margin } = this.props;
    const outerWidth = props.width;
    const outerHeight = props.height;
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;
    return (
      <div ref={this.ref}>
        <svg
          width={outerWidth}
          height={outerHeight}
          className="line-chart"
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            <LineGroup
              {...props}
              width={width}
              height={height}
              color={"green"}
            />
          </g>
        </svg>
      </div>
    );
  }
}