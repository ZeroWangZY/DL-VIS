import React from "react";
import "./index.less";

export default () => {
  return (
    <table id="legend-group">
      <tr>
        <td className="icon">
          <img src={process.env.PUBLIC_URL + "/assets/aggreg.svg"} />
        </td>
        <td className="caption">聚合节点</td>
      </tr>
      <tr>
        <td className="icon">
          <img src={process.env.PUBLIC_URL + "/assets/cnn.svg"} />
        </td>
        <td className="caption">卷积神经网络层</td>
      </tr>
      <tr>
        <td className="icon">
          <img src={process.env.PUBLIC_URL + "/assets/fc.svg"} />
        </td>
        <td className="caption">全连接神经网络层</td>
      </tr>
      <tr>
        <td className="icon">
          <img src={process.env.PUBLIC_URL + "/assets/rnn.svg"} />
        </td>
        <td className="caption">循环神经网络层</td>
      </tr>
      <tr>
        <td className="icon">
          <img src={process.env.PUBLIC_URL + "/assets/operator.svg"} />
        </td>
        <td className="caption">计算节点</td>
      </tr>
      <tr>
        <td className="icon">
          <img src={process.env.PUBLIC_URL + "/assets/const.svg"} />
        </td>
        <td className="caption">常量节点</td>
      </tr>
      <tr>
        <td className="icon">
          <img src={process.env.PUBLIC_URL + "/assets/param.svg"} />
        </td>
        <td className="caption">变量节点</td>
      </tr>
    </table>
  );
};
