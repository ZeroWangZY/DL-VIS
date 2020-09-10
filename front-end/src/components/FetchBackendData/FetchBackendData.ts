import { useEffect } from "react";
import { useGlobalConfigurations } from "../../store/global-configuration";
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { GlobalStatesModificationType } from "../../store/global-states.type";
import { fetchMetadata } from '../../api/modelLevel';

let timer = null;

const fetchBackendData = () => {
  const { currentMSGraphName } = useGlobalStates();

  useEffect(() => {
    if (!currentMSGraphName) return;

    if (timer !== null)
      clearInterval(timer);

    timer = setInterval(function fetch() {
      fetchMetadata({ graph_name: currentMSGraphName }).then((data) => {
        const maxStep = data.data.data.max_step;
        const isTraining = data.data.data.is_training;

        modifyGlobalStates(
          GlobalStatesModificationType.SET_IS_TRAINING,
          isTraining
        );
        modifyGlobalStates(
          GlobalStatesModificationType.SET_MAX_STEP,
          maxStep
        );
      })
      console.log("每隔10秒向后端请求一次数据")
      return fetch;
    }(), 10000);

  }, [currentMSGraphName]);
}

export default fetchBackendData;