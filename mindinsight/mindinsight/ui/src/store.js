/**
 * Copyright 2019 Huawei Technologies Co., Ltd.All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // cancel request token
    cancelTokenArr: [],
    // reload flag
    isReload: false,
    // Scheduled reload flag
    isTimeReload: localStorage.isTimeReload === 'false' ? false : true,
    // reload time
    timeReloadValue: localStorage.timeReloadValue
      ? localStorage.timeReloadValue
      : 3,
    // multiSelevtGroup component count
    multiSelectedGroupCount: 0,
    tableId: 0,
  },
  mutations: {
    // set cancelTokenArr
    pushToken: (state, src) => {
      state.cancelTokenArr.push(src.cancelToken);
    },
    // clear cancelTokenArr
    clearToken: (state) => {
      state.cancelTokenArr.forEach((item) => {
        item('routeJump');
      });
      state.cancelTokenArr = [];
    },
    // set isReload
    setIsReload: (state, val) => {
      state.isReload = val;
    },
    setSummaryDirList: (state, val) => {
      state.summaryDirList = val;
    },
    setSelectedBarList: (state, val) => {
      state.selectedBarList = val;
    },
    // hide list of model traceback
    setHidenDirChecked: (state, val) => {
      state.hidenDirChecked = val;
    },
    customizedColumnOptions: (state, val) => {
      state.customizedColumnOptions = val;
    },
    // set isTimeReload
    setIsTimeReload: (state, val) => {
      state.isTimeReload = val;
    },
    setTimeReloadValue: (state, val) => {
      state.timeReloadValue = val;
    },
    multiSelectedGroupComponentNum(state) {
      state.multiSelectedGroupCount++;
    },
    increaseTableId(state) {
      state.tableId++;
    },
  },
  actions: {},
});
