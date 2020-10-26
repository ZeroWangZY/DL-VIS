import React, { useEffect, useState } from "react";
import { ShowActivationOrGradient } from "../../store/global-states.type";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import Popover from "@material-ui/core/Popover";
import CircularProgress from "@material-ui/core/CircularProgress";
import { TensorMetadata } from "./TensorHeatmap";
import RadarChartDrawer, { RadarData } from "./RadarChartDrawer"
import { fetchNodeTensor } from "../../api/layerlevel";

export interface RadarChartProps {
  tensorMetadata: TensorMetadata;
  isShowing: boolean;
  anchorPosition: { top: number, left: number };
  setIsShowing: (boolean) => void;
}

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const RadarChart: React.FC<RadarChartProps> = (
  props: RadarChartProps
) => {
  const classes = useStyles();
  const { tensorMetadata, isShowing, setIsShowing, anchorPosition } = props;
  const { type, step, dataIndex, nodeId } = tensorMetadata;
  const isValid = type !== null && step != null && dataIndex !== null;
  const show = isValid && isShowing;
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [radarChartData, setRadarChartData] = useState(null);
  const handleClose = () => {
    setIsShowing(false);
  };

  useEffect(() => {
    if (!isValid) return;
    let typeParam;
    if (type === ShowActivationOrGradient.ACTIVATION) {
      typeParam = "activation";
    }
    if (type === ShowActivationOrGradient.GRADIENT) {
      typeParam = "gradient";
    }

    // TODO : 从后端获取数据
    setShowLoading(true);
    fetchNodeTensor({
      graph_name: "resnet",
      node_id: nodeId,
      step: step,
      data_index: dataIndex,
      type: typeParam,
      mode: "radial",
      dim: 1,
      scale: false
    }).then((res) => {
      if (res.data.message === "success") {
        let rawData = res.data.data;
        console.log(rawData);
        setShowLoading(false);
        setRadarChartData(rawData);
      } else {
        console.log("获取layer数据失败：" + res.data.message);
      }
    })

    // TODO : 从后端获取数据
    let rawData = {
      "message": "success",
      "data": [{
        "value": [0.4248597303863488, 0.47211036883663005, 0.3538183789078682, 0.52641927905012,
          0.37076376917524334, 0.31075667935283463, 0.6491141134968533, 0.0
        ],
        "label": 5,
        "index": 8805
      }, {
        "value": [0.4485482728093877, 0.28789972820374665, 0.2676209899836509, 0.790728325755139,
          0.188945206722241, 0.2732555966377785, 0.7615116497122288, 0.38280633992364255
        ],
        "label": 1,
        "index": 37303
      }, {
        "value": [0.07944767224086692, 1.0, 0.6739786095649126, 0.0, 0.5982579072747125, 0.5775965375475588,
          0.4891990872627569, 0.5331675399676246
        ],
        "label": 2,
        "index": 55537
      }, {
        "value": [0.39477012089656294, 0.4646062918509006, 0.1718486309257139, 0.7180151932957061,
          0.16713649565669467, 0.4247001953165208, 0.7153539370309849, 0.11395653254255218
        ],
        "label": 4,
        "index": 52577
      }, {
        "value": [0.3697536305848538, 0.4646351843177927, 0.2464354815247371, 0.6555430254884869,
          0.35764386423895217, 0.4504730426519199, 0.6819614648210237, 0.24814140951891536
        ],
        "label": 8,
        "index": 50054
      }, {
        "value": [0.0, 0.3361397994531346, 0.6522171091664816, 0.5371482555066316, 0.5001953561759734,
          0.3597627434080407, 0.9079790896512351, 0.5112859798163515
        ],
        "label": 5,
        "index": 4135
      }, {
        "value": [0.6859218753773876, 0.5100763127657263, 0.18974152854105916, 0.6712549088993932,
          0.22554171585549537, 0.4086020813140371, 0.7563556294394586, 0.12699154935662102
        ],
        "label": 8,
        "index": 16716
      }, {
        "value": [0.7137155365494208, 0.273732627396829, 0.4006997497335123, 1.0, 0.05251818785201478,
          0.29435708385697984, 0.7374451248952584, 0.3894609196339235
        ],
        "label": 0,
        "index": 7727
      }, {
        "value": [0.6770328106909561, 0.40929187128511335, 0.8778748197121631, 0.5183632477209206,
          0.34377961368425974, 0.3512470451222849, 0.9286411806978906, 0.736041574088399
        ],
        "label": 5,
        "index": 32468
      }, {
        "value": [1.0, 0.0, 0.6694552832334139, 0.7316938687564762, 0.011562616078548183, 0.0,
          0.9310739434468054, 0.11686717860498112
        ],
        "label": 2,
        "index": 49870
      }, {
        "value": [0.42203290822474243, 0.4551593295196075, 0.3141805708084176, 0.6783651994879484,
          0.4100903456756622, 0.29761273370746494, 0.7935764390499905, 0.16009179759608033
        ],
        "label": 6,
        "index": 29457
      }, {
        "value": [0.5177256879548442, 0.3379127810861512, 0.26429992121613216, 0.824122749397387,
          0.24791728300972965, 0.19865514616376223, 0.8025381460843549, 0.20753347256428453
        ],
        "label": 1,
        "index": 30949
      }, {
        "value": [0.3913556278046729, 0.06571932060265732, 0.42340323289475007, 0.8643837322185826,
          0.2389792500228553, 0.1740308838013869, 1.0, 0.3050233277020973
        ],
        "label": 4,
        "index": 42702
      }, {
        "value": [0.5640465630344799, 0.4487353808905502, 0.3803546009666444, 0.5147646639230199,
          0.44155287532306536, 0.3083981962460663, 0.8187528998774797, 0.5799161328595063
        ],
        "label": 8,
        "index": 24878
      }, {
        "value": [0.41099182558683756, 0.622962143800748, 0.6437923461267119, 0.31498349455450647,
          0.4912040124119421, 0.6133424232313711, 0.5585870519810832, 0.5948380330275618
        ],
        "label": 9,
        "index": 51689
      }, {
        "value": [0.15551295017708042, 0.6267853977023672, 0.22196695126750984, 0.49243845923898205,
          0.5389790552348273, 0.4340973299349732, 0.7775463751563654, 0.5633299725340626
        ],
        "label": 2,
        "index": 13759
      }, {
        "value": [0.35673684081554863, 0.7774472293886597, 0.8205723065651447, 0.24305732496302712,
          0.6858622115399412, 0.5411047191157407, 0.6905616088928456, 1.0
        ],
        "label": 3,
        "index": 6151
      }, {
        "value": [0.5494438835228492, 0.4906877579250056, 0.3846629011420186, 0.5479644676006419,
          0.3628044004828638, 0.37675591090640237, 0.7238529822770305, 0.37678942496012424
        ],
        "label": 6,
        "index": 31972
      }, {
        "value": [0.5606915899440151, 0.41364560313972243, 0.3302997794466431, 0.5702563502925255,
          0.28531385341011084, 0.30692109342559637, 0.8100404165177602, 0.3750222964292022
        ],
        "label": 7,
        "index": 1857
      }, {
        "value": [0.3196401260972808, 0.3531659707259266, 0.2245018348467695, 0.9241498589623446,
          0.37059933371499804, 0.20558029540897352, 0.9278877743086601, 0.28806252006127064
        ],
        "label": 6,
        "index": 58544
      }, {
        "value": [0.27077784585120573, 0.336482425284449, 0.1209643516335106, 0.825077390642107,
          0.3777963619842237, 0.13010394547660062, 0.9603183662574756, 0.18575240394454365
        ],
        "label": 6,
        "index": 54772
      }, {
        "value": [0.23272990376066852, 0.32337559922515613, 0.2768107322000561, 0.7770441153745881,
          0.4524980250563804, 0.1588596764199268, 0.9561778676133911, 0.22654667427366937
        ],
        "label": 0,
        "index": 25546
      }, {
        "value": [0.4800789307182836, 0.43852936062638626, 0.7143708037154923, 0.5014644980017612,
          0.8624177281502848, 0.5629380276677579, 0.40405437705666797, 0.4785493587540699
        ],
        "label": 3,
        "index": 28361
      }, {
        "value": [0.28072394746625173, 0.3862783000966773, 0.0, 0.9272254724953793, 0.47311080460654525,
          0.1228222956058968, 0.8838512155230501, 0.24707135938446625
        ],
        "label": 2,
        "index": 39809
      }, {
        "value": [0.3225302751145036, 0.2468779318524348, 0.34625272132930496, 0.8206541305871224,
          0.3555239533035555, 0.06144744541707415, 0.9495982793349944, 0.19458297408039035
        ],
        "label": 2,
        "index": 49956
      }, {
        "value": [0.7157754659222825, 0.44149428976084576, 0.5506668433620305, 0.4443441741360892,
          0.2847281732217427, 0.5031158887002619, 0.5456850354806412, 0.3896735964559833
        ],
        "label": 0,
        "index": 50276
      }, {
        "value": [0.607743771794064, 0.39721480498735134, 0.027054594004674953, 0.7213107207433724,
          0.4718491338383049, 0.25749860034950084, 0.8765139015621116, 0.9891486004130209
        ],
        "label": 2,
        "index": 138
      }, {
        "value": [0.8395952645876579, 0.3288114982569202, 1.0, 0.3108850840760099, 1.0, 1.0, 0.0,
          0.8679973786143153
        ],
        "label": 1,
        "index": 45602
      }, {
        "value": [0.42950219052454913, 0.610540885007455, 0.5732056851939301, 0.28988909742413876,
          0.5729109066481659, 0.6344233398991621, 0.4625630107834118, 0.24385660273073995
        ],
        "label": 1,
        "index": 29188
      }, {
        "value": [0.4007066214967425, 0.4702762679239971, 0.2786329699370442, 0.6075125372573709,
          0.350248323488371, 0.37623121683518945, 0.7484733371525603, 0.4762855918011798
        ],
        "label": 1,
        "index": 17454
      }, {
        "value": [0.14969457820798926, 0.41137299573950764, 0.3907980157232299, 0.566863858447408,
          0.26868342229274544, 0.35071328746165986, 0.6788842976990396, 0.19892372362138708
        ],
        "label": 7,
        "index": 47286
      }, {
        "value": [0.5115275319825697, 0.22632725024463257, 0.4019226471165841, 0.7081059878862529, 0.0,
          0.3145525595140436, 0.8123705778142889, 0.3067289388133969
        ],
        "label": 0,
        "index": 52548
      }]
    };

    // setRadarChartData(rawData.data);

  }, [type, step, dataIndex]);

  return (
    <div>
      <Popover
        open={show}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <div className={classes.paper}>
          <h2 id="transition-modal-title">
            data type:{" "}
            {type === ShowActivationOrGradient.ACTIVATION && "activation"}{" "}
            {type === ShowActivationOrGradient.GRADIENT && "gradient"}; step:{" "}
            {step} ; data index: {dataIndex}
          </h2>
          {showLoading ?
            <CircularProgress /> :
            <RadarChartDrawer rawData={radarChartData} />
          }
        </div>
      </Popover>
    </div>
  );
};

export default RadarChart;
