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
          <td className="caption">Group Node (grouped)</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/aggreg_expanded.svg"} />
          </td>
          <td className="caption">Group Node (ungrouped)</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/cnn.svg"} />
          </td>
          <td className="caption">CNN Node</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/fc.svg"} />
          </td>
          <td className="caption">FC Node</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/rnn.svg"} />
          </td>
          <td className="caption">RNN Node</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/operator.svg"} />
          </td>
          <td className="caption">Operation Node</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/const_1.svg"} />
          </td>
          <td className="caption">Constant Node</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/param_1.svg"} />
          </td>
          <td className="caption">Parameter Node</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/piled-node.svg"} />
          </td>
          <td className="caption">Piled Node</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/normal-edge.svg"} />
          </td>
          <td className="caption">Normal Edge</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/hidden-edge.svg"} />
          </td>
          <td className="caption">Hidden Edge</td>
        </tr>
        <tr>
          <td className="icon">
            <img src={process.env.PUBLIC_URL + "/assets/module-edge.svg"} />
          </td>
          <td className="caption">Module Edge</td>
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
