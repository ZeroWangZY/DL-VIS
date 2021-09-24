import React from "react";
import "./index.less";

export default () => {
  return (
    <table id="legend-group">
      <tbody>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/aggreg_notExpanded.svg"} />
          </td>
          <td className="caption">MetaNode (collapsed)</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/aggreg_expanded.svg"} />
          </td>
          <td className="caption">MetaNode (expanded)</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/cnn.svg"} />
          </td>
          <td className="caption">CNNLayer</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/fc.svg"} />
          </td>
          <td className="caption">FCLayer</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/rnn.svg"} />
          </td>
          <td className="caption">RNNLayer</td>
        </tr>
        <tr>
          <td colSpan={2}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150.56 57.73" style={{transform: "translate(9.5px,6px)"}}><g id="图层_2" data-name="图层 2"><g id="图层_1-2" data-name="图层 1"><polyline style={{fill:"none", stroke:"gray", strokeMiterlimit:10, strokeDasharray:2}} points="23.81 24.46 23.81 29.21 34.26 29.21"/><ellipse style={{fill: "#fff", stroke:"#040000"}} cx="16.44" cy="17.72" rx="15.94" ry="5.31"/><circle style={{fill: "#fff", stroke:"#040000"}} cx="23.4" cy="22.46" r="2.66"/><text style={{fontSize:"11.18px", fontFamily:"ArialMT, Arial"}} transform="translate(37.51 9.6)">OperationNode</text><text style={{fontSize:"11.18px", fontFamily:"ArialMT, Arial"}}><tspan x="37.51" y="54.1">ConstantNode</tspan></text><circle style={{fill: "#fff", stroke:"#040000"}} cx="8.81" cy="22.46" r="2.66"/><polyline style={{fill:"none", stroke:"gray", strokeMiterlimit:10, strokeDasharray:2}} points="17.04 11.82 17.04 5.8 34.26 5.8"/><polyline style={{fill:"none", stroke:"gray", strokeMiterlimit:10, strokeDasharray:2}} points="8.85 26.64 8.9 49.6 33.95 49.6"/><text style={{fontSize:"11.18px", fontFamily:"ArialMT, Arial"}} transform="translate(37.51 32.6)">ParameterNode </text></g></g></svg>
          </td>
        </tr>
        {/* <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/operator.svg"} />
          </td>
          <td className="caption">OperationNode</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/const_1.svg"} />
          </td>
          <td className="caption">ConstantNode</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/param_1.svg"} />
          </td>
          <td className="caption">ParameterNode</td>
        </tr> */}
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/piled-node.svg"} />
          </td>
          <td className="caption">PiledNode</td>
        </tr>
        <tr>
          <td className="icon edge">
            <img src={process.env.PUBLIC_URL + "/assets/normal-edge.svg"} />
          </td>
          <td className="caption">NormalEdge</td>
        </tr>
        <tr>
          <td className="icon edge">
            <img src={process.env.PUBLIC_URL + "/assets/hidden-edge.svg"} />
          </td>
          <td className="caption">HiddenEdge</td>
        </tr>
        <tr>
          <td className="icon edge">
            <img src={process.env.PUBLIC_URL + "/assets/module-edge.svg"} />
          </td>
          <td className="caption">ModuleEdge</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/port.svg"} />
          </td>
          <td className="caption">Port</td>
        </tr>
      </tbody>
    </table>
  );
};
