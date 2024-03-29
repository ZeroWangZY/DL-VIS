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
"""
Profiler util.

This module provides the utils.
"""
import os

from mindinsight.datavisual.utils.tools import to_int

# one sys count takes 10 ns, 1 ms has 100000 system count
PER_MS_SYSCNT = 100000


def analyse_device_list_from_profiler_dir(profiler_dir):
    """
    Analyse device list from profiler dir.

    Args:
        profiler_dir (str): The profiler data dir.

    Returns:
        list, the device_id list.
    """
    device_id_list = set()
    for _, _, filenames in os.walk(profiler_dir):
        for filename in filenames:
            profiler_file_prefix = ["output_op_compute_time", "output_data_preprocess_aicpu"]
            items = filename.split("_")
            device_num = items[-1].split(".")[0] if items[-1].split(".") else ""
            if device_num.isdigit() and '_'.join(items[:-1]) in profiler_file_prefix:
                device_id_list.add(device_num)

    return list(device_id_list)


def query_latest_trace_time_file(profiler_dir, device_id=0):
    """
    Query the latest trace time file.

    Args:
        profiler_dir (str): The profiler directory.
        device_id (int): The id of device.

    Returns:
        str, the latest trace time file path.
    """
    files = os.listdir(profiler_dir)
    target_file = f'step_trace_raw_{device_id}_detail_time.csv'
    try:
        latest_file = max(
            filter(
                lambda file: file == target_file,
                files
            ),
            key=lambda file: os.stat(os.path.join(profiler_dir, file)).st_mtime
        )
    except ValueError:
        return None
    return os.path.join(profiler_dir, latest_file)


def query_step_trace_file(profiler_dir):
    """
    Query for all step trace file.

    Args:
        profiler_dir (str): The directory that contains all step trace files.

    Returns:
        str, the file path of step trace time.
    """
    files = os.listdir(profiler_dir)
    training_trace_file = list(
        filter(
            lambda file: file.startswith('training_trace') and not file.endswith('.done'),
            files
        )
    )
    if training_trace_file:
        return os.path.join(profiler_dir, training_trace_file[0])
    return None


def get_summary_for_step_trace(average_info, header):
    """The property of summary info."""
    if not average_info or not header:
        return {}
    total_time = get_field_value(average_info, 'total', header)
    iteration_interval = get_field_value(average_info, 'iteration_interval',
                                         header)
    fp_and_bp = get_field_value(average_info, 'fp_and_bp', header)
    tail = get_field_value(average_info, 'tail', header)
    summary = {
        'total_time': total_time,
        'iteration_interval': iteration_interval,
        'iteration_interval_percent': calculate_percent(iteration_interval, total_time),
        'fp_and_bp': fp_and_bp,
        'fp_and_bp_percent': calculate_percent(fp_and_bp, total_time),
        'tail': tail,
        'tail_percent': calculate_percent(tail, total_time)
    }
    return summary


def calculate_percent(partial, total):
    """Calculate percent value."""
    if total:
        percent = round(partial / total * 100, 2)
    else:
        percent = 0
    return f'{percent}%'


def to_millisecond(sys_count, limit=4):
    """Translate system count to millisecond."""
    return round(sys_count / PER_MS_SYSCNT, limit)


def get_field_value(row_info, field_name, header, time_type='realtime'):
    """
    Extract basic info through row_info.

    Args:
        row_info (list): The list of data info in one row.
        field_name (str): The name in header.
        header (list[str]): The list of field names.
        time_type (str): The type of value, `realtime` or `systime`. Default: `realtime`.

    Returns:
        dict, step trace info in dict format.
    """
    field_index = header.index(field_name)
    value = row_info[field_index]
    value = to_int(value, field_name)
    if time_type == 'realtime':
        value = to_millisecond(value)

    return value

def get_options(options):
    if options is None:
        options = {}
    return options
