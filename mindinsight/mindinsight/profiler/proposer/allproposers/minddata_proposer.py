# Copyright 2020 Huawei Technologies Co., Ltd
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ============================================================================
"""The minddata proposer."""
from collections import OrderedDict

from mindinsight.profiler.analyser.analyser_factory import AnalyserFactory
from mindinsight.profiler.analyser.minddata_analyser import MinddataAnalyser
from mindinsight.profiler.proposer.allproposers.base_proposer import Proposer


class MinddataProposer(Proposer):
    """The Minddata proposer."""

    def __init__(self, profiling_dir, device_id):
        super().__init__(profiling_dir, device_id)
        self.__proposer_type = "minddata"
        self.__proposal_dict = OrderedDict()

    def analyze(self, options=None):
        """
        Get the proposal from proposer.

        Args:
            options (dict): The options for proposer analysis.

        Returns:
            dict, the proposal from proposer instance，the dictionary key is a language internationalization
            label, and the value is used to format the value in the language internationalization string.

        Examples:
            >>> proposer_type = 'minddata'
            >>> proposer = ProposerFactory.instance().get_proposer(proposer_type, self.profiling_dir, self.device_id)
            >>> result = proposer.analyze(options)
        """
        self.minddata_outer_bounds_analyze()
        return self.__proposal_dict

    def minddata_outer_bounds_analyze(self):
        """Get the proposals of minddata outer bounds."""
        minddata_dict = OrderedDict()
        minddata_analyser = AnalyserFactory.instance().get_analyser(
            'minddata', self.profiling_path, self.device_id)
        get_next_queue_info, _ = minddata_analyser.analyse_get_next_info(info_type="queue")
        device_queue_info, _ = minddata_analyser.analyse_device_queue_info(info_type="queue")

        result = MinddataAnalyser.analyse_queue_summary(get_next_queue_info, device_queue_info)
        if "get_next_queue_info" in result:
            get_next_queue_info_summary = result.get("get_next_queue_info").get("summary", {})
            empty_batch = get_next_queue_info_summary.get("empty_batch_count")
            total_batch = get_next_queue_info_summary.get("total_batch")

            minddata_dict["minddata_get_next_queue"] = [empty_batch, total_batch]
            self.__proposal_dict.update(minddata_dict)
        if "device_queue_info" in result:
            get_next_queue_info_summary = result.get("device_queue_info").get("summary", {})
            full_batch = get_next_queue_info_summary.get("full_batch_count", 0)
            empty_batch = get_next_queue_info_summary.get("empty_batch_count", 0)
            total_batch = get_next_queue_info_summary.get("total_batch", 0)

            minddata_dict["minddata_device_queue"] = [empty_batch, total_batch, full_batch, total_batch]
            self.__proposal_dict.update(minddata_dict)

        warning_op = list()
        for key, value in result.items():
            if isinstance(value, dict):
                status = value.get("status")
                if status == "warning":
                    warning_op.append(key)

        if warning_op:
            minddata_dict["minddata_warning_op"] = [",".join(warning_op)]
            self.__proposal_dict.update(minddata_dict)
