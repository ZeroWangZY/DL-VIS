import React, { Component } from 'react';
import * as d3 from 'd3';
import { ToolProps} from './props';

export default class Tooltip extends Component<ToolProps,{}> {
  constructor(props) {
    super(props);

  }
  render () {
    const { position } = this.props
    return (
        <div className={'tooltip'} style={{
          left:position.x,
          top:position.y
        }}>

        </div>
    );
  }
}
