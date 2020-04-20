import React, { Component } from 'react';
import * as d3 from 'd3';
import { AxisProps} from './props';

export default class Axis extends Component<AxisProps,{}> {
  private ref: SVGSVGElement;
  constructor(props) {
    super(props);
    this.getAxisOrient = this.getAxisOrient.bind(this)
}
  componentDidUpdate () {
    this.renderAxis();
  }
  componentDidMount () {
    this.renderAxis();
  }
  getAxisOrient (orientation) {
    // const dire : any =
    let s =this.props.scale
    switch (orientation) {
      case 'left':
        return d3.axisLeft(s);
      case 'top':
        return d3.axisTop(s);
      case 'right':
        return d3.axisRight(s);
      case 'bottom':
        return d3.axisBottom(s);
    }
  }
  renderAxis () {
    let s =this.props.scale
    const axis = this.getAxisOrient(this.props.orient)
      .ticks(this.props.tickNumber)
      .tickFormat(function (d) {
        return s.tickFormat(4,d3.format("d"))(d)
      })
    d3.select(this.ref)
      .transition()
      .duration(500)
      .call(axis);
  }

  render () {
    return (
      <g
        ref={(ref: SVGSVGElement) => this.ref = ref}
        className={this.props.orient}
        transform={this.props.transform}
      >
       {/* <line x1={0} y1={this.props.height} x2={0} y2={-5} stroke='rgb(136, 158, 174)' strokeWidth='1'>
        </line> */}
        {/* <text className="axis-text" x={0} y={-15} textAnchor="end">
          {this.props.text}
        </text> */}
      </g>
    );
  }
}
