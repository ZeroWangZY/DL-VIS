import { useEffect } from "react";
import { useGlobalConfigurations } from "../../store/global-configuration";
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { GlobalStatesModificationType } from "../../store/global-states.type";
import { fetchSnapshot, fetchMetadata } from '../../api/modelLevel';

let updateGlobalStatesTunc = null;

const fetchBackendData = () => {
  const { currentMSGraphName, is_training, max_step } = useGlobalStates();

  useEffect(() => {
    if (!currentMSGraphName) return;

    setInterval(function fetch() {
      fetchMetadata({ graph_name: currentMSGraphName }).then((data) => {
        const max_step = data.data.data.max_step;
        const is_training = data.data.data.is_training;

        modifyGlobalStates(
          GlobalStatesModificationType.SET_IS_TRAINING,
          is_training
        );
        modifyGlobalStates(
          GlobalStatesModificationType.SET_MAX_SETP,
          max_step
        );
      })
      console.log("此处每隔10秒调用一次")
      return fetch;
    }(), 10000);

  }, [currentMSGraphName]);
}

export default fetchBackendData;