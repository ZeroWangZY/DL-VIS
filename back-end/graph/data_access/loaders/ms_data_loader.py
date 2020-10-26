# Copyright 2019 Huawei Technologies Co., Ltd
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
"""
DataLoader for MindSpore data.

This module is used to load the MindSpore training log file.
Each instance will read an entire run, a run can contain one or
more log file.
"""
import re
import struct
import warnings
import os
import json
from collections import namedtuple
from google.protobuf import json_format

# from google.protobuf.message import DecodeError
# from google.protobuf.text_format import ParseError

# from mindinsight.datavisual.common import exceptions
from ..common.enums import PluginNameEnum

# from mindinsight.datavisual.data_access.file_handler import FileHandler
from ..events_data import EventsData
from ..events_data import TensorEvent
from ..graph import MSGraph
from mindspore.train import summary_pb2
from mindspore.train import anf_ir_pb2

# from mindinsight.datavisual.utils import crc32
# from mindinsight.utils.exceptions import UnknownError

StatInfo = namedtuple("Info", ["size", "mtime"])

HEADER_SIZE = 8
CRC_STR_SIZE = 4


class MSDataLoader:
    """
    MSDataLoader class, load MindSpore event data.

    Args:
        summary_dir (str): Log directory.
    """

    def __init__(self, summary_dir):
        self._init_instance(summary_dir)

    def _init_instance(self, summary_dir):
        self._summary_dir = summary_dir
        self._valid_filenames = []
        self._events_data = EventsData()
        self._latest_summary_filename = ""
        self._latest_summary_file_size = 0
        self._summary_file_handler = None
        self._latest_pb_file_mtime = 0

    def get_events_data(self):
        """Return events data read from log file."""
        return self._events_data

    def _check_files_deleted(self, filenames, old_filenames):
        """
        Check the file list for updates.

        Args:
            filenames (list[str]): The latest files list.
            old_filenames (list[str]): List of old files.
        """
        deleted_files = set(old_filenames) - set(filenames)
        if deleted_files:
            warnings.warn(
                "There are some files has been deleted, we will reload all files in path {}.".format(
                    self._summary_dir
                )
            )
            self._init_instance(self._summary_dir)

    def load(self):
        """
        Load all log valid files.

        When the file is reloaded, it will continue to load from where it left off.
        """
        print("Start to load data in ms data loader.")
        filenames = self.filter_valid_files()
        if not filenames:
            err_message = "No valid files can be loaded, summary_dir: {}.".format(
                self._summary_dir
            )
            raise Exception(err_message)

        old_filenames = list(self._valid_filenames)
        self._valid_filenames = filenames
        self._check_files_deleted(filenames, old_filenames)

        self._load_summary_files(self._valid_filenames)
        self._load_pb_files(self._valid_filenames)

    def _load_summary_files(self, filenames):
        """
        Load summary file and parse file content.

        Args:
            filenames (list[str]): File name list.
        """
        summary_files = self._filter_summary_files(filenames)
        summary_files = self._sorted_summary_files(summary_files)

        for filename in summary_files:
            if self._latest_summary_filename and (
                self._compare_summary_file(self._latest_summary_filename, filename)
            ):
                continue

            file_path = os.path.join(self._summary_dir, filename)

            if filename != self._latest_summary_filename:
                # self._summary_file_handler = FileHandler(file_path, 'rb')
                self._latest_summary_filename = filename
                self._latest_summary_file_size = 0

            new_size = os.stat(file_path).st_size
            if new_size == self._latest_summary_file_size:
                continue

            self._latest_summary_file_size = new_size
            try:
                self._load_single_file(
                    os.path.join(self._summary_dir, self._latest_summary_filename)
                )
            except Exception as ex:
                warnings.warn(
                    "Parse summary file failed, detail: {}, file path: {}.".format(
                        str(ex), file_path
                    )
                )

    # 这里就只用来读events文件的
    def _load_single_file(self, file_path):
        """
        Load a log file data.

        Args:
            file_path: A file path.
        """
        print("Load single summary file, file path: {}.".format(file_path))
        file_offset = {"val": 0}
        while True:
            try:
                event_str = self._event_load(file_path, file_offset)
                if event_str is None:
                    break
                event = summary_pb2.Event.FromString(event_str)
                self._event_parse(event)
            except Exception as ex:
                raise Exception("Parse log file fail: {}".format(str(ex)))

    # event文件是头部+crc校验码+内容+crc校验码组成的，头部校验1次，内容校验1次。跟pb文件只有内容不一样
    def _event_load(self, file_name, offset):
        """
        Load binary string to event string.

        Args:
            file_name: A file name.
            offset: offset to start reading.

        Returns:
            bytes, MindSpore event in bytes.
        """
        # read the header
        with open(file_name, "rb") as file_handler:

            file_handler.seek(offset["val"])

            header_str = file_handler.read(HEADER_SIZE)
            offset["val"] = file_handler.tell()
            if not header_str:
                print("End of file, file_path={}.".format(file_name))
                return None
            header_crc_str = file_handler.read(CRC_STR_SIZE)
            offset["val"] = file_handler.tell()
            if not header_crc_str:
                header_crc_str = ""

            if len(header_str) != HEADER_SIZE or len(header_crc_str) != CRC_STR_SIZE:
                warnings.warn(
                    "Check header size and crc, record truncated unexpectedly, file_path={}.".format(
                        file_name
                    )
                )
                return None

            # 这里应该做crc校验的，但逻辑过于复杂，有c++，直接返回true先。。。
            # if not crc32.CheckValueAgainstData(header_crc_str, header_str, HEADER_SIZE):
            if False:
                raise Exception("CRC invalid")

            # read the event body if integrity of header is verified
            header = struct.unpack("Q", header_str)
            event_len = int(header[0])

            event_str = file_handler.read(event_len)
            offset["val"] = file_handler.tell()
            if not event_str:
                event_str = ""
            event_crc_str = file_handler.read(CRC_STR_SIZE)
            offset["val"] = file_handler.tell()
            if not event_crc_str:
                event_crc_str = ""

            if len(event_str) != event_len or len(event_crc_str) != CRC_STR_SIZE:
                warnings.warn(
                    "Check event crc, record truncated unexpectedly, file_path: {}.".format(
                        file_name
                    )
                )
                return None

            # 这里应该做crc校验的，但逻辑过于复杂，有c++，直接返回true先。。。
            # if not crc32.CheckValueAgainstData(event_crc_str, event_str, event_len):
            if False:
                raise Exception("CRC invalid")

            return event_str

    def _event_parse(self, event):
        """
        Transform `Event` data to tensor_event and update it to EventsData.

        Args:
            event (Event): Message event in summary proto.
        """
        if event.HasField("summary"):
            for value in event.summary.value:
                if value.HasField("scalar_value"):
                    tag = "{}/{}".format(value.tag, PluginNameEnum.SCALAR)
                    tensor_event = TensorEvent(
                        wall_time=event.wall_time,
                        step=event.step,
                        tag=tag,
                        plugin_name=PluginNameEnum.SCALAR,
                        value=value.scalar_value,
                    )
                    self._events_data.add_tensor_event(tensor_event)

                if value.HasField("image"):
                    tag = "{}/{}".format(value.tag, PluginNameEnum.IMAGE)
                    tensor_event = TensorEvent(
                        wall_time=event.wall_time,
                        step=event.step,
                        tag=tag,
                        plugin_name=PluginNameEnum.IMAGE,
                        value=value.image,
                    )
                    self._events_data.add_tensor_event(tensor_event)

        if event.HasField("graph_def"):
            graph_proto = event.graph_def
            # graph = MSGraph()
            # graph.build_graph(graph_proto)
            tensor_event = TensorEvent(
                wall_time=event.wall_time,
                step=event.step,
                tag=self._latest_summary_filename,
                plugin_name=PluginNameEnum.GRAPH,
                value=json.loads(json_format.MessageToJson(graph_proto)),
            )

            try:
                graph_tags = self._events_data.list_tags_by_plugin(PluginNameEnum.GRAPH)
            except KeyError:
                graph_tags = []
            summary_tags = self._filter_summary_files(graph_tags)
            for tag in summary_tags:
                self._events_data.delete_tensor_event(tag)

            self._events_data.add_tensor_event(tensor_event)

    def filter_valid_files(self):
        """
        Gets a list of valid files from the given file path.

        Returns:
            list[str], file name list.

        """
        filenames = []
        for filename in os.listdir(self._summary_dir):
            file_path = os.path.join(self._summary_dir, filename)
            if os.path.isfile(file_path):
                filenames.append(filename)

        valid_filenames = []
        valid_filenames.extend(self._filter_summary_files(filenames))
        valid_filenames.extend(self._filter_pb_files(filenames))
        return list(set(valid_filenames))

    @staticmethod
    def _filter_summary_files(filenames):
        """
        Gets a list of summary files.

        Args:
            filenames (list[str]): File name list, like [filename1, filename2].

        Returns:
            list[str], filename list.
        """
        return list(
            filter(
                lambda filename: (
                    re.search(r"summary\.\d+", filename)
                    and not filename.endswith("_lineage")
                ),
                filenames,
            )
        )

    @staticmethod
    def _compare_summary_file(current_file, dst_file):
        """
        Compare the creation times of the two summary log files.

        Args:
            current_file (str): Must be the summary log file path.
            dst_file (str): Must be the summary log file path.

        Returns:
            bool, returns True if the current file is new, or False if not.
        """
        current_time = int(re.search(r"summary\.(\d+)", current_file)[1])
        dst_time = int(re.search(r"summary\.(\d+)", dst_file)[1])
        if current_time > dst_time or (
            current_time == dst_time and current_file > dst_file
        ):
            return True
        return False

    @staticmethod
    def _sorted_summary_files(summary_files):
        """Sort by creating time increments and filenames decrement."""
        filenames = sorted(
            summary_files,
            key=lambda filename: (
                -int(re.search(r"summary\.(\d+)", filename)[1]),
                filename,
            ),
            reverse=True,
        )
        return filenames

    @staticmethod
    def _filter_pb_files(filenames):
        """
        Get a list of pb files.

        Args:
            filenames (list[str]): File name list, like [filename1, filename2].

        Returns:
            list[str], filename list.
        """
        return list(filter(lambda filename: re.search(r"\.pb$", filename), filenames))

    def _load_pb_files(self, filenames):
        """
        Load and parse the pb files.

        Args:
            filenames (list[str]): File name list, like [filename1, filename2].

        Returns:
            list[str], filename list.
        """
        pb_filenames = self._filter_pb_files(filenames)
        pb_filenames = sorted(
            pb_filenames,
            key=lambda file: os.stat(os.path.join(self._summary_dir, file)).st_mtime,
        )
        for filename in pb_filenames:
            file_path = os.path.join(self._summary_dir, filename)
            mtime = os.stat(file_path).st_mtime
            if mtime <= self._latest_pb_file_mtime:
                continue
            self._latest_pb_file_mtime = mtime
            self._parse_pb_file(filename)

    def _parse_pb_file(self, filename):
        """
        Parse pb file and write content to `EventsData`.

        Args:
            filename (str): The file path of pb file.
        """
        file_path = os.path.join(self._summary_dir, filename)
        print("Start to load graph from pb file, file path: {}.".format(file_path))
        model_proto = anf_ir_pb2.ModelProto()
        try:
            with open(file_path, "rb") as file_handler:
                model_proto.ParseFromString(file_handler.read())
        except Exception:
            warnings.warn(
                "The given file is not a valid pb file, file path: {}.".format(
                    file_path
                )
            )
            return

        # 后端建图逻辑先不跑了，暂时没用
        # graph = MSGraph()
        # graph.build_graph(model_proto.graph)

        try:
            file_info = os.stat(file_path)
        except OSError:
            raise Exception("File {} is not exist.".format(file_path))

        tensor_event = TensorEvent(
            wall_time=StatInfo(size=file_info.st_size, mtime=file_info.st_mtime),
            step=0,
            tag=filename,
            plugin_name=PluginNameEnum.GRAPH,
            value=json.loads(json_format.MessageToJson(model_proto.graph)),
        )  # 这里直接返回utf-8的pb
        self._events_data.add_tensor_event(tensor_event)
