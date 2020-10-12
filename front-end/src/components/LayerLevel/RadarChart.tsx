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
  // const [showLoading, setShowLoading] = useState<boolean>(false);
  const [radarChartData, setRadarChartData] = useState(null);
  const handleClose = () => {
    setIsShowing(false);
  };

  useEffect(() => {
    if (!isValid) return;
    // setShowLoading(true);
    let typeParam;
    if (type === ShowActivationOrGradient.ACTIVATION) {
      typeParam = "activation";
    }
    if (type === ShowActivationOrGradient.GRADIENT) {
      typeParam = "gradient";
    }

    // setShowLoading(false);

    // TODO : 从后端获取数据
    let data = [[{ "axis": "1", "value": "-0.548031903" }, { "axis": "2", "value": "-0.896649484" }, { "axis": "3", "value": "-0.356236876" }, { "axis": "4", "value": "-1.008064166" }, { "axis": "5", "value": "-0.411085185" }, { "axis": "6", "value": "1.100431156" }, { "axis": "7", "value": "2.332216989" }, { "axis": "8", "value": "2.026206993" }, { "axis": "9", "value": "2.043527924" }, { "axis": "10", "value": "1.123121204" }, { "axis": "11", "value": "1.270365935" }, { "axis": "12", "value": "1.19689492" }, { "axis": "13", "value": "0.805270707" }, { "axis": "14", "value": "0.914838873" }, { "axis": "15", "value": "0.786169323" }, { "axis": "16", "value": "0.435367368" }, { "axis": "17", "value": "0.362874459" }, { "axis": "18", "value": "0.419571943" }, { "axis": "19", "value": "0.704926947" }, { "axis": "20", "value": "0.792448278" }, { "axis": "21", "value": "0.787234352" }, { "axis": "22", "value": "0.86212336" }, { "axis": "23", "value": "1.245255068" }, { "axis": "24", "value": "1.287635596" }, { "axis": "25", "value": "1.374057612" }, { "axis": "26", "value": "1.345264713" }, { "axis": "27", "value": "1.219943024" }, { "axis": "28", "value": "-0.212439616" }, { "axis": "29", "value": "-0.727812153" }, { "axis": "30", "value": "-0.889366801" }, { "axis": "31", "value": "-0.426380879" }, { "axis": "32", "value": "-0.767188766" }], [{ "axis": "1", "value": "-0.828123606" }, { "axis": "2", "value": "-0.738511406" }, { "axis": "3", "value": "-0.601031573" }, { "axis": "4", "value": "-0.492137514" }, { "axis": "5", "value": "-0.293348484" }, { "axis": "6", "value": "0.868038937" }, { "axis": "7", "value": "1.742973704" }, { "axis": "8", "value": "1.67996531" }, { "axis": "9", "value": "1.500344214" }, { "axis": "10", "value": "1.233718266" }, { "axis": "11", "value": "1.240178301" }, { "axis": "12", "value": "1.423296571" }, { "axis": "13", "value": "1.123343914" }, { "axis": "14", "value": "1.165757607" }, { "axis": "15", "value": "1.072487869" }, { "axis": "16", "value": "0.960550018" }, { "axis": "17", "value": "1.234359212" }, { "axis": "18", "value": "0.853662523" }, { "axis": "19", "value": "0.730194668" }, { "axis": "20", "value": "0.648337811" }, { "axis": "21", "value": "0.513567369" }, { "axis": "22", "value": "0.850724828" }, { "axis": "23", "value": "0.731686187" }, { "axis": "24", "value": "0.954120169" }, { "axis": "25", "value": "1.119114316" }, { "axis": "26", "value": "0.907681642" }, { "axis": "27", "value": "0.85367726" }, { "axis": "28", "value": "-0.200611034" }, { "axis": "29", "value": "-0.790169638" }, { "axis": "30", "value": "-0.612740965" }, { "axis": "31", "value": "-0.657954238" }, { "axis": "32", "value": "-0.521011916" }], [{ "axis": "1", "value": "-0.552783169" }, { "axis": "2", "value": "-0.821765843" }, { "axis": "3", "value": "-0.493134679" }, { "axis": "4", "value": "-0.823405107" }, { "axis": "5", "value": "-0.455053754" }, { "axis": "6", "value": "1.092557977" }, { "axis": "7", "value": "2.170388386" }, { "axis": "8", "value": "2.125207677" }, { "axis": "9", "value": "1.866511162" }, { "axis": "10", "value": "1.340563689" }, { "axis": "11", "value": "1.335612042" }, { "axis": "12", "value": "1.303092879" }, { "axis": "13", "value": "1.275475572" }, { "axis": "14", "value": "1.036988792" }, { "axis": "15", "value": "0.91395375" }, { "axis": "16", "value": "0.595843702" }, { "axis": "17", "value": "0.685943557" }, { "axis": "18", "value": "0.581538131" }, { "axis": "19", "value": "0.830247741" }, { "axis": "20", "value": "0.638214717" }, { "axis": "21", "value": "0.694818262" }, { "axis": "22", "value": "0.680209317" }, { "axis": "23", "value": "0.710522049" }, { "axis": "24", "value": "1.127110077" }, { "axis": "25", "value": "1.32916616" }, { "axis": "26", "value": "0.91627524" }, { "axis": "27", "value": "0.967890742" }, { "axis": "28", "value": "-0.233561266" }, { "axis": "29", "value": "-0.753751862" }, { "axis": "30", "value": "-0.753670315" }, { "axis": "31", "value": "-0.556489008" }, { "axis": "32", "value": "-0.674570404" }], [{ "axis": "1", "value": "-0.202678971" }, { "axis": "2", "value": "-0.316063494" }, { "axis": "3", "value": "-0.29131817" }, { "axis": "4", "value": "-0.351499735" }, { "axis": "5", "value": "0.000266685" }, { "axis": "6", "value": "0.248264535" }, { "axis": "7", "value": "0.386295452" }, { "axis": "8", "value": "0.475804399" }, { "axis": "9", "value": "0.469510885" }, { "axis": "10", "value": "0.601397818" }, { "axis": "11", "value": "0.504553399" }, { "axis": "12", "value": "0.69698022" }, { "axis": "13", "value": "0.313437667" }, { "axis": "14", "value": "0.490878322" }, { "axis": "15", "value": "0.784406249" }, { "axis": "16", "value": "1.321793509" }, { "axis": "17", "value": "1.873449158" }, { "axis": "18", "value": "1.545138993" }, { "axis": "19", "value": "0.570195845" }, { "axis": "20", "value": "0.381516923" }, { "axis": "21", "value": "0.337052231" }, { "axis": "22", "value": "0.47600871" }, { "axis": "23", "value": "0.446737918" }, { "axis": "24", "value": "0.46131909" }, { "axis": "25", "value": "0.513845072" }, { "axis": "26", "value": "0.673077387" }, { "axis": "27", "value": "0.59991795" }, { "axis": "28", "value": "-0.311520905" }, { "axis": "29", "value": "-0.179729967" }, { "axis": "30", "value": "-0.214218653" }, { "axis": "31", "value": "-0.389204351" }, { "axis": "32", "value": "-0.111134629" }], [{ "axis": "1", "value": "-0.269561036" }, { "axis": "2", "value": "-0.420933878" }, { "axis": "3", "value": "-0.270285315" }, { "axis": "4", "value": "-0.394041062" }, { "axis": "5", "value": "-0.084820347" }, { "axis": "6", "value": "0.321048093" }, { "axis": "7", "value": "0.449379619" }, { "axis": "8", "value": "0.583583857" }, { "axis": "9", "value": "0.473680189" }, { "axis": "10", "value": "0.520634741" }, { "axis": "11", "value": "0.418276478" }, { "axis": "12", "value": "0.584726964" }, { "axis": "13", "value": "0.236338742" }, { "axis": "14", "value": "0.427061862" }, { "axis": "15", "value": "0.693207961" }, { "axis": "16", "value": "1.314197386" }, { "axis": "17", "value": "1.723845325" }, { "axis": "18", "value": "1.546870635" }, { "axis": "19", "value": "0.727599943" }, { "axis": "20", "value": "0.665997861" }, { "axis": "21", "value": "0.675720448" }, { "axis": "22", "value": "0.488428522" }, { "axis": "23", "value": "0.404709528" }, { "axis": "24", "value": "0.652372253" }, { "axis": "25", "value": "0.701166057" }, { "axis": "26", "value": "0.627226131" }, { "axis": "27", "value": "0.497872952" }, { "axis": "28", "value": "-0.401287957" }, { "axis": "29", "value": "-0.319421065" }, { "axis": "30", "value": "-0.254464018" }, { "axis": "31", "value": "-0.273933551" }, { "axis": "32", "value": "-0.178594209" }], [{ "axis": "1", "value": "-0.266353957" }, { "axis": "2", "value": "-0.423994526" }, { "axis": "3", "value": "-0.309733856" }, { "axis": "4", "value": "-0.472141883" }, { "axis": "5", "value": "-0.075286817" }, { "axis": "6", "value": "0.334011104" }, { "axis": "7", "value": "0.608458381" }, { "axis": "8", "value": "0.73572968" }, { "axis": "9", "value": "0.597534541" }, { "axis": "10", "value": "0.662503158" }, { "axis": "11", "value": "0.475227906" }, { "axis": "12", "value": "0.604677453" }, { "axis": "13", "value": "0.308366966" }, { "axis": "14", "value": "0.399981907" }, { "axis": "15", "value": "0.734665797" }, { "axis": "16", "value": "1.32220728" }, { "axis": "17", "value": "1.701559791" }, { "axis": "18", "value": "1.393151595" }, { "axis": "19", "value": "0.733065275" }, { "axis": "20", "value": "0.583892037" }, { "axis": "21", "value": "0.46133004" }, { "axis": "22", "value": "0.340564865" }, { "axis": "23", "value": "0.367007976" }, { "axis": "24", "value": "0.525593429" }, { "axis": "25", "value": "0.522109036" }, { "axis": "26", "value": "0.491211815" }, { "axis": "27", "value": "0.39540153" }, { "axis": "28", "value": "-0.361289581" }, { "axis": "29", "value": "-0.233102341" }, { "axis": "30", "value": "-0.18307237" }, { "axis": "31", "value": "-0.330161002" }, { "axis": "32", "value": "-0.232199821" }], [{ "axis": "1", "value": "-0.646522384" }, { "axis": "2", "value": "-0.584270792" }, { "axis": "3", "value": "-0.417644911" }, { "axis": "4", "value": "-0.682133034" }, { "axis": "5", "value": "-0.243867176" }, { "axis": "6", "value": "0.508024426" }, { "axis": "7", "value": "1.362262144" }, { "axis": "8", "value": "1.460257912" }, { "axis": "9", "value": "1.18152235" }, { "axis": "10", "value": "0.945757664" }, { "axis": "11", "value": "0.498005556" }, { "axis": "12", "value": "0.313005884" }, { "axis": "13", "value": "0.112825535" }, { "axis": "14", "value": "0.398486774" }, { "axis": "15", "value": "0.875961997" }, { "axis": "16", "value": "1.324694616" }, { "axis": "17", "value": "1.772153993" }, { "axis": "18", "value": "1.257292459" }, { "axis": "19", "value": "0.646578574" }, { "axis": "20", "value": "0.614481936" }, { "axis": "21", "value": "0.719974608" }, { "axis": "22", "value": "1.102057842" }, { "axis": "23", "value": "1.516281979" }, { "axis": "24", "value": "1.304145914" }, { "axis": "25", "value": "1.244113149" }, { "axis": "26", "value": "0.738035646" }, { "axis": "27", "value": "0.567835823" }, { "axis": "28", "value": "-0.284149917" }, { "axis": "29", "value": "-0.566000122" }, { "axis": "30", "value": "-0.641734815" }, { "axis": "31", "value": "-0.587244259" }, { "axis": "32", "value": "-0.279016708" }], [{ "axis": "1", "value": "-0.702767112" }, { "axis": "2", "value": "-0.608287506" }, { "axis": "3", "value": "-0.484887148" }, { "axis": "4", "value": "-0.734196718" }, { "axis": "5", "value": "-0.293084514" }, { "axis": "6", "value": "0.61315313" }, { "axis": "7", "value": "1.126509146" }, { "axis": "8", "value": "1.215758867" }, { "axis": "9", "value": "1.076600255" }, { "axis": "10", "value": "0.64470597" }, { "axis": "11", "value": "0.42589589" }, { "axis": "12", "value": "0.309444851" }, { "axis": "13", "value": "0.058828976" }, { "axis": "14", "value": "0.74224289" }, { "axis": "15", "value": "0.763759285" }, { "axis": "16", "value": "1.242881559" }, { "axis": "17", "value": "1.524243327" }, { "axis": "18", "value": "1.265783048" }, { "axis": "19", "value": "0.829450608" }, { "axis": "20", "value": "0.940801421" }, { "axis": "21", "value": "0.984712254" }, { "axis": "22", "value": "1.715011358" }, { "axis": "23", "value": "2.276329398" }, { "axis": "24", "value": "1.601466308" }, { "axis": "25", "value": "1.378215693" }, { "axis": "26", "value": "1.119047525" }, { "axis": "27", "value": "0.729471621" }, { "axis": "28", "value": "-0.435246987" }, { "axis": "29", "value": "-0.5659236" }, { "axis": "30", "value": "-0.659564725" }, { "axis": "31", "value": "-0.495564901" }, { "axis": "32", "value": "-0.562290636" }], [{ "axis": "1", "value": "-0.926860015" }, { "axis": "2", "value": "-0.759527891" }, { "axis": "3", "value": "-0.566314332" }, { "axis": "4", "value": "-0.838340639" }, { "axis": "5", "value": "-0.405904746" }, { "axis": "6", "value": "0.855006533" }, { "axis": "7", "value": "1.68753993" }, { "axis": "8", "value": "1.589552224" }, { "axis": "9", "value": "1.328101373" }, { "axis": "10", "value": "0.980463681" }, { "axis": "11", "value": "0.60754185" }, { "axis": "12", "value": "0.373562828" }, { "axis": "13", "value": "0.171693699" }, { "axis": "14", "value": "0.775420116" }, { "axis": "15", "value": "0.650038891" }, { "axis": "16", "value": "0.859463661" }, { "axis": "17", "value": "1.015540031" }, { "axis": "18", "value": "0.789763483" }, { "axis": "19", "value": "0.888692803" }, { "axis": "20", "value": "0.984899773" }, { "axis": "21", "value": "1.122161132" }, { "axis": "22", "value": "1.753683969" }, { "axis": "23", "value": "2.109629819" }, { "axis": "24", "value": "1.475493472" }, { "axis": "25", "value": "1.465657448" }, { "axis": "26", "value": "1.562064025" }, { "axis": "27", "value": "1.125694562" }, { "axis": "28", "value": "-0.456117054" }, { "axis": "29", "value": "-0.538713202" }, { "axis": "30", "value": "-0.664646265" }, { "axis": "31", "value": "-0.761081395" }, { "axis": "32", "value": "-0.639593061" }], [{ "axis": "1", "value": "-0.560093125" }, { "axis": "2", "value": "-0.554661144" }, { "axis": "3", "value": "-0.38086777" }, { "axis": "4", "value": "-0.714294708" }, { "axis": "5", "value": "-0.577355426" }, { "axis": "6", "value": "0.507547559" }, { "axis": "7", "value": "1.422373533" }, { "axis": "8", "value": "1.416589547" }, { "axis": "9", "value": "1.302299994" }, { "axis": "10", "value": "0.730291346" }, { "axis": "11", "value": "0.344827942" }, { "axis": "12", "value": "0.169511306" }, { "axis": "13", "value": "0.170543441" }, { "axis": "14", "value": "0.730498026" }, { "axis": "15", "value": "0.587154755" }, { "axis": "16", "value": "0.876741366" }, { "axis": "17", "value": "0.965832619" }, { "axis": "18", "value": "0.891417846" }, { "axis": "19", "value": "1.436563346" }, { "axis": "20", "value": "2.108046046" }, { "axis": "21", "value": "1.789185597" }, { "axis": "22", "value": "1.632503683" }, { "axis": "23", "value": "1.36383176" }, { "axis": "24", "value": "1.293516958" }, { "axis": "25", "value": "1.04741297" }, { "axis": "26", "value": "0.492773415" }, { "axis": "27", "value": "0.295243999" }, { "axis": "28", "value": "-0.441798061" }, { "axis": "29", "value": "-0.498246084" }, { "axis": "30", "value": "-0.454044" }, { "axis": "31", "value": "-0.465086243" }, { "axis": "32", "value": "-0.514257743" }], [{ "axis": "1", "value": "-0.617033608" }, { "axis": "2", "value": "-0.727861944" }, { "axis": "3", "value": "-0.482574578" }, { "axis": "4", "value": "-0.749486132" }, { "axis": "5", "value": "-0.541202853" }, { "axis": "6", "value": "0.549994392" }, { "axis": "7", "value": "1.454658799" }, { "axis": "8", "value": "1.465171572" }, { "axis": "9", "value": "1.290273143" }, { "axis": "10", "value": "1.007448205" }, { "axis": "11", "value": "0.882460395" }, { "axis": "12", "value": "0.952494807" }, { "axis": "13", "value": "0.803293648" }, { "axis": "14", "value": "1.058412941" }, { "axis": "15", "value": "0.815912864" }, { "axis": "16", "value": "0.89610735" }, { "axis": "17", "value": "1.02818058" }, { "axis": "18", "value": "0.72367063" }, { "axis": "19", "value": "1.664918978" }, { "axis": "20", "value": "2.078172518" }, { "axis": "21", "value": "1.731380107" }, { "axis": "22", "value": "1.746047338" }, { "axis": "23", "value": "1.244427612" }, { "axis": "24", "value": "1.34857385" }, { "axis": "25", "value": "0.727237447" }, { "axis": "26", "value": "0.512163864" }, { "axis": "27", "value": "0.561327384" }, { "axis": "28", "value": "-0.377217653" }, { "axis": "29", "value": "-0.579111814" }, { "axis": "30", "value": "-0.513555788" }, { "axis": "31", "value": "-0.722855918" }, { "axis": "32", "value": "-0.711568184" }], [{ "axis": "1", "value": "-0.587159128" }, { "axis": "2", "value": "-0.64570111" }, { "axis": "3", "value": "-0.589780591" }, { "axis": "4", "value": "-0.578254113" }, { "axis": "5", "value": "-0.502765324" }, { "axis": "6", "value": "0.434308774" }, { "axis": "7", "value": "1.105608326" }, { "axis": "8", "value": "1.103284894" }, { "axis": "9", "value": "1.09202849" }, { "axis": "10", "value": "0.674516111" }, { "axis": "11", "value": "0.577034577" }, { "axis": "12", "value": "0.622633207" }, { "axis": "13", "value": "0.469337995" }, { "axis": "14", "value": "0.919572236" }, { "axis": "15", "value": "0.533037501" }, { "axis": "16", "value": "0.664797609" }, { "axis": "17", "value": "0.796327781" }, { "axis": "18", "value": "0.908004367" }, { "axis": "19", "value": "1.569499526" }, { "axis": "20", "value": "2.051881585" }, { "axis": "21", "value": "1.903122084" }, { "axis": "22", "value": "1.661741871" }, { "axis": "23", "value": "1.204048134" }, { "axis": "24", "value": "1.515216757" }, { "axis": "25", "value": "1.247491744" }, { "axis": "26", "value": "0.788472054" }, { "axis": "27", "value": "0.816654346" }, { "axis": "28", "value": "-0.35503837" }, { "axis": "29", "value": "-0.568369089" }, { "axis": "30", "value": "-0.46390222" }, { "axis": "31", "value": "-0.576769754" }, { "axis": "32", "value": "-0.501911529" }]];

    setRadarChartData(data);

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
          {/* {showLoading && <CircularProgress />} */}
          {/* <div className="radarChart"></div> */}
          <RadarChartDrawer data={radarChartData} />
        </div>
      </Popover>
    </div>
  );
};

export default RadarChart;
