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
"""Validate the parameters."""
import os
import re
from marshmallow import ValidationError

from mindinsight.lineagemgr.common.exceptions.error_code import LineageErrors, LineageErrorMsg
from mindinsight.lineagemgr.common.exceptions.exceptions import LineageParamTypeError, \
    LineageParamValueError, LineageDirNotExistError
from mindinsight.lineagemgr.common.log import logger as log
from mindinsight.lineagemgr.common.validator.validate_path import safe_normalize_path
from mindinsight.lineagemgr.querier.query_model import FIELD_MAPPING
from mindinsight.utils.exceptions import MindInsightException, ParamValueError


# Named string regular expression
_name_re = r"^\w+[0-9a-zA-Z\_\.]*$"

TRAIN_RUN_CONTEXT_ERROR_MAPPING = {
    'optimizer': LineageErrors.PARAM_OPTIMIZER_ERROR,
    'loss_fn': LineageErrors.PARAM_LOSS_FN_ERROR,
    'net_outputs': LineageErrors.PARAM_NET_OUTPUTS_ERROR,
    'train_network': LineageErrors.PARAM_TRAIN_NETWORK_ERROR,
    'train_dataset': LineageErrors.PARAM_DATASET_ERROR,
    'epoch_num': LineageErrors.PARAM_EPOCH_NUM_ERROR,
    'batch_num': LineageErrors.PARAM_BATCH_NUM_ERROR,
    'parallel_mode': LineageErrors.PARAM_TRAIN_PARALLEL_ERROR,
    'device_number': LineageErrors.PARAM_DEVICE_NUMBER_ERROR,
    'list_callback': LineageErrors.PARAM_CALLBACK_LIST_ERROR,
    'train_dataset_size': LineageErrors.PARAM_DATASET_SIZE_ERROR,
}

SEARCH_MODEL_ERROR_MAPPING = {
    'summary_dir': LineageErrors.LINEAGE_PARAM_SUMMARY_DIR_ERROR,
    'loss_function': LineageErrors.LINEAGE_PARAM_LOSS_FUNCTION_ERROR,
    'train_dataset_path': LineageErrors.LINEAGE_PARAM_TRAIN_DATASET_PATH_ERROR,
    'train_dataset_count': LineageErrors.LINEAGE_PARAM_TRAIN_DATASET_COUNT_ERROR,
    'test_dataset_path': LineageErrors.LINEAGE_PARAM_TEST_DATASET_PATH_ERROR,
    'test_dataset_count': LineageErrors.LINEAGE_PARAM_TEST_DATASET_COUNT_ERROR,
    'network': LineageErrors.LINEAGE_PARAM_NETWORK_ERROR,
    'optimizer': LineageErrors.LINEAGE_PARAM_OPTIMIZER_ERROR,
    'learning_rate': LineageErrors.LINEAGE_PARAM_LEARNING_RATE_ERROR,
    'epoch': LineageErrors.LINEAGE_PARAM_EPOCH_ERROR,
    'batch_size': LineageErrors.LINEAGE_PARAM_BATCH_SIZE_ERROR,
    'device_num': LineageErrors.LINEAGE_PARAM_DEVICE_NUM_ERROR,
    'limit': LineageErrors.PARAM_VALUE_ERROR,
    'offset': LineageErrors.PARAM_VALUE_ERROR,
    'loss': LineageErrors.LINEAGE_PARAM_LOSS_ERROR,
    'model_size': LineageErrors.LINEAGE_PARAM_MODEL_SIZE_ERROR,
    'sorted_name': LineageErrors.LINEAGE_PARAM_SORTED_NAME_ERROR,
    'sorted_type': LineageErrors.LINEAGE_PARAM_SORTED_TYPE_ERROR,
    'dataset_mark': LineageErrors.LINEAGE_PARAM_DATASET_MARK_ERROR,
    'lineage_type': LineageErrors.LINEAGE_PARAM_LINEAGE_TYPE_ERROR
}


TRAIN_RUN_CONTEXT_ERROR_MSG_MAPPING = {
    'optimizer': LineageErrorMsg.PARAM_OPTIMIZER_ERROR.value,
    'loss_fn': LineageErrorMsg.PARAM_LOSS_FN_ERROR.value,
    'net_outputs': LineageErrorMsg.PARAM_NET_OUTPUTS_ERROR.value,
    'train_network': LineageErrorMsg.PARAM_TRAIN_NETWORK_ERROR.value,
    'epoch_num': LineageErrorMsg.PARAM_EPOCH_NUM_ERROR.value,
    'batch_num': LineageErrorMsg.PARAM_BATCH_NUM_ERROR.value,
    'parallel_mode': LineageErrorMsg.PARAM_TRAIN_PARALLEL_ERROR.value,
    'device_number': LineageErrorMsg.PARAM_DEVICE_NUMBER_ERROR.value,
    'list_callback': LineageErrorMsg.PARAM_CALLBACK_LIST_ERROR.value
}

SEARCH_MODEL_ERROR_MSG_MAPPING = {
    'summary_dir': LineageErrorMsg.LINEAGE_PARAM_SUMMARY_DIR_ERROR.value,
    'loss_function': LineageErrorMsg.LINEAGE_LOSS_FUNCTION_ERROR.value,
    'train_dataset_path': LineageErrorMsg.LINEAGE_TRAIN_DATASET_PATH_ERROR.value,
    'train_dataset_count': LineageErrorMsg.LINEAGE_TRAIN_DATASET_COUNT_ERROR.value,
    'test_dataset_path': LineageErrorMsg.LINEAGE_TEST_DATASET_PATH_ERROR.value,
    'test_dataset_count': LineageErrorMsg.LINEAGE_TEST_DATASET_COUNT_ERROR.value,
    'network': LineageErrorMsg.LINEAGE_NETWORK_ERROR.value,
    'optimizer': LineageErrorMsg.LINEAGE_OPTIMIZER_ERROR.value,
    'learning_rate': LineageErrorMsg.LINEAGE_LEARNING_RATE_ERROR.value,
    'epoch': LineageErrorMsg.PARAM_EPOCH_NUM_ERROR.value,
    'batch_size': LineageErrorMsg.PARAM_BATCH_SIZE_ERROR.value,
    'device_num': LineageErrorMsg.PARAM_DEVICE_NUM_ERROR.value,
    'limit': LineageErrorMsg.PARAM_LIMIT_ERROR.value,
    'offset': LineageErrorMsg.PARAM_OFFSET_ERROR.value,
    'loss': LineageErrorMsg.LINEAGE_LOSS_ERROR.value,
    'model_size': LineageErrorMsg.LINEAGE_MODEL_SIZE_ERROR.value,
    'sorted_name': LineageErrorMsg.LINEAGE_PARAM_SORTED_NAME_ERROR.value,
    'sorted_type': LineageErrorMsg.LINEAGE_PARAM_SORTED_TYPE_ERROR.value,
    'dataset_mark': LineageErrorMsg.LINEAGE_PARAM_DATASET_MARK_ERROR.value,
    'lineage_type': LineageErrorMsg.LINEAGE_PARAM_LINEAGE_TYPE_ERROR.value
}


EVAL_RUN_CONTEXT_ERROR_MAPPING = {
    'valid_dataset': LineageErrors.PARAM_DATASET_ERROR,
    'metrics': LineageErrors.PARAM_EVAL_METRICS_ERROR
}

EVAL_RUN_CONTEXT_ERROR_MSG_MAPPING = {
    'metrics': LineageErrorMsg.PARAM_EVAL_METRICS_ERROR.value,
}


def validate_int_params(int_param, param_name):
    """
    Verify the parameter which type is integer valid or not.

    Args:
        int_param (int): parameter that is integer,
            including epoch, dataset_batch_size, step_num
        param_name (str): the name of parameter,
            including epoch, dataset_batch_size, step_num

    Raises:
        MindInsightException: If the parameters are invalid.
    """
    if not isinstance(int_param, int) or int_param <= 0 or int_param > pow(2, 63) - 1:
        if param_name == 'step_num':
            log.error('Invalid step_num. The step number should be a positive integer.')
            raise MindInsightException(error=LineageErrors.PARAM_STEP_NUM_ERROR,
                                       message=LineageErrorMsg.PARAM_STEP_NUM_ERROR.value)

        if param_name == 'dataset_batch_size':
            log.error('Invalid dataset_batch_size. '
                      'The batch size should be a positive integer.')
            raise MindInsightException(error=LineageErrors.PARAM_BATCH_SIZE_ERROR,
                                       message=LineageErrorMsg.PARAM_BATCH_SIZE_ERROR.value)


def validate_file_path(file_path, allow_empty=False):
    """
    Verify that the file_path is valid.

    Args:
        file_path (str): Input file path.
        allow_empty (bool): Whether file_path can be empty.

    Raises:
        MindInsightException: If the parameters are invalid.
    """
    try:
        if allow_empty and not file_path:
            return file_path
        return safe_normalize_path(file_path, raise_key='dataset_path', safe_prefixes=None)
    except ValidationError as error:
        log.error(str(error))
        raise MindInsightException(error=LineageErrors.PARAM_FILE_PATH_ERROR,
                                   message=str(error))


def validate_eval_run_context(schema, data):
    """
    Validate mindspore evaluation job run_context data according to schema.

    Args:
        schema (Schema): data schema.
        data (dict): data to check schema.

    Raises:
        MindInsightException: If the parameters are invalid.
    """
    errors = schema().validate(data)
    for error_key, error_msg in errors.items():
        if error_key in EVAL_RUN_CONTEXT_ERROR_MAPPING.keys():
            error_code = EVAL_RUN_CONTEXT_ERROR_MAPPING.get(error_key)
            if EVAL_RUN_CONTEXT_ERROR_MSG_MAPPING.get(error_key):
                error_msg = EVAL_RUN_CONTEXT_ERROR_MSG_MAPPING.get(error_key)
            log.error(error_msg)
            raise MindInsightException(error=error_code, message=error_msg)


def validate_search_model_condition(schema, data):
    """
    Validate search model condition.

    Args:
        schema (Schema): Data schema.
        data (dict): Data to check schema.

    Raises:
        MindInsightException: If the parameters are invalid.
    """
    error = schema().validate(data)
    for (error_key, error_msgs) in error.items():
        if error_key in SEARCH_MODEL_ERROR_MAPPING.keys():
            error_code = SEARCH_MODEL_ERROR_MAPPING.get(error_key)
            error_msg = SEARCH_MODEL_ERROR_MSG_MAPPING.get(error_key)
            for err_msg in error_msgs:
                if 'operation' in err_msg.lower():
                    error_msg = f'The parameter {error_key} is invalid. {err_msg}'
                    break
            log.error(error_msg)
            raise MindInsightException(error=error_code, message=error_msg)


def validate_raise_exception(raise_exception):
    """
    Validate raise_exception.

    Args:
        raise_exception (bool): decide raise exception or not,
            if True, raise exception; else, catch exception and continue.

    Raises:
        MindInsightException: If the parameters are invalid.
    """
    if not isinstance(raise_exception, bool):
        log.error("Invalid raise_exception. It should be True or False.")
        raise MindInsightException(
            error=LineageErrors.PARAM_RAISE_EXCEPTION_ERROR,
            message=LineageErrorMsg.PARAM_RAISE_EXCEPTION_ERROR.value
        )


def validate_filter_key(keys):
    """
    Verify the keys of filtering is valid or not.

    Args:
        keys (list): The keys to get the relative lineage info.

    Raises:
        LineageParamTypeError: If keys is not list.
        LineageParamValueError: If the value of keys is invalid.
    """
    filter_keys = [
        'metric', 'hyper_parameters', 'algorithm',
        'train_dataset', 'model', 'valid_dataset',
        'dataset_graph'
    ]

    if not isinstance(keys, list):
        log.error("Keys must be list.")
        raise LineageParamTypeError("Keys must be list.")

    for element in keys:
        if not isinstance(element, str):
            log.error("Element of keys must be str.")
            raise LineageParamTypeError("Element of keys must be str.")

    if not set(keys).issubset(filter_keys):
        err_msg = "Keys must be in {}.".format(filter_keys)
        log.error(err_msg)
        raise LineageParamValueError(err_msg)


def validate_condition(search_condition):
    """
    Verify the param in search_condition is valid or not.

    Args:
        search_condition (dict): The search condition.

    Raises:
        LineageParamTypeError: If the type of the param in search_condition is invalid.
        LineageParamValueError: If the value of the param in search_condition is invalid.
    """
    if not isinstance(search_condition, dict):
        log.error("Invalid search_condition type, it should be dict.")
        raise LineageParamTypeError("Invalid search_condition type, "
                                    "it should be dict.")

    if "limit" in search_condition:
        if isinstance(search_condition.get("limit"), bool) \
                or not isinstance(search_condition.get("limit"), int):
            log.error("The limit must be int.")
            raise LineageParamTypeError("The limit must be int.")

    if "offset" in search_condition:
        if isinstance(search_condition.get("offset"), bool) \
                or not isinstance(search_condition.get("offset"), int):
            log.error("The offset must be int.")
            raise LineageParamTypeError("The offset must be int.")

    if "sorted_name" in search_condition:
        sorted_name = search_condition.get("sorted_name")
        err_msg = "The sorted_name must be in {} or start with " \
                  "`metric/` or `user_defined/`.".format(list(FIELD_MAPPING.keys()))
        if not isinstance(sorted_name, str):
            log.error(err_msg)
            raise LineageParamValueError(err_msg)
        if not (sorted_name in FIELD_MAPPING
                or (sorted_name.startswith('metric/') and len(sorted_name) > len('metric/'))
                or (sorted_name.startswith('user_defined/') and len(sorted_name) > len('user_defined/'))
                or sorted_name in ['tag']):
            log.error(err_msg)
            raise LineageParamValueError(err_msg)

    sorted_type_param = ['ascending', 'descending', None]
    if "sorted_type" in search_condition:
        if "sorted_name" not in search_condition:
            log.error("The sorted_name have to exist when sorted_type exists.")
            raise LineageParamValueError("The sorted_name have to exist when sorted_type exists.")

        if search_condition.get("sorted_type") not in sorted_type_param:
            err_msg = "The sorted_type must be ascending or descending."
            log.error(err_msg)
            raise LineageParamValueError(err_msg)


def validate_path(summary_path):
    """
    Verify the summary path is valid or not.

    Args:
        summary_path (str): The summary path which is a dir.

    Raises:
        LineageParamValueError: If the input param value is invalid.
        LineageDirNotExistError: If the summary path is invalid.
    """
    try:
        summary_path = safe_normalize_path(
            summary_path, "summary_path", None, check_absolute_path=True
        )
    except ValidationError:
        log.error("The summary path is invalid.")
        raise LineageParamValueError("The summary path is invalid.")
    if not os.path.isdir(summary_path):
        log.error("The summary path does not exist or is not a dir.")
        raise LineageDirNotExistError("The summary path does not exist or is not a dir.")

    return summary_path


def validate_user_defined_info(user_defined_info):
    """
    Validate user defined info， delete the item if its key is in lineage.

    Args:
        user_defined_info (dict): The user defined info.

    Raises:
        LineageParamTypeError: If the type of parameters is invalid.
        LineageParamValueError: If user defined keys have been defined in lineage.

    """
    if not isinstance(user_defined_info, dict):
        log.error("Invalid user defined info. It should be a dict.")
        raise LineageParamTypeError("Invalid user defined info. It should be dict.")
    for key, value in user_defined_info.items():
        if not isinstance(key, str):
            error_msg = "Dict key type {} is not supported in user defined info." \
                        "Only str is permitted now.".format(type(key))
            log.error(error_msg)
            raise LineageParamTypeError(error_msg)
        if not isinstance(value, (int, str, float)):
            error_msg = "Dict value type {} is not supported in user defined info." \
                        "Only str, int and float are permitted now.".format(type(value))
            log.error(error_msg)
            raise LineageParamTypeError(error_msg)

    field_map = set(FIELD_MAPPING.keys())
    user_defined_keys = set(user_defined_info.keys())
    insertion = list(field_map & user_defined_keys)

    if insertion:
        for key in insertion:
            user_defined_info.pop(key)
        raise LineageParamValueError("There are some keys have defined in lineage. "
                                     "Duplicated key(s): %s. " % insertion)


def validate_train_id(relative_path):
    """
    Check if train_id is valid.

    Args:
        relative_path (str): Train ID of a summary directory, e.g. './log1'.

    Returns:
        bool, if train id is valid, return True.

    """
    if not relative_path.startswith('./'):
        log.warning("The relative_path does not start with './'.")
        raise ParamValueError(
            "Summary dir should be relative path starting with './'."
        )
    if len(relative_path.split("/")) > 2:
        log.warning("The relative_path contains multiple '/'.")
        raise ParamValueError(
            "Summary dir should be relative path starting with './'."
        )


def validate_range(name, value, min_value, max_value):
    """
    Check if value is in [min_value, max_value].

    Args:
        name (str): Value name.
        value (Union[int, float]): Value to be check.
        min_value (Union[int, float]): Min value.
        max_value (Union[int, float]): Max value.

    Raises:
        LineageParamValueError, if value type is invalid or value is out of [min_value, max_value].

    """
    if not isinstance(value, (int, float)):
        raise LineageParamValueError("Value should be int or float.")

    if value < min_value or value > max_value:
        raise LineageParamValueError("The %s should in [%d, %d]." % (name, min_value, max_value))


def validate_added_info(added_info: dict):
    """
    Check if added_info is valid.

    Args:
        added_info (dict): The added info.

    Raises:
        bool, if added_info is valid, return True.

    """
    added_info_keys = ["tag", "remark"]
    if not set(added_info.keys()).issubset(added_info_keys):
        err_msg = "Keys of added_info must be in {}.".format(added_info_keys)
        raise LineageParamValueError(err_msg)

    for key, value in added_info.items():
        if key == "tag":
            if not isinstance(value, int):
                raise LineageParamValueError("'tag' must be int.")
            # tag should be in [0, 10].
            validate_range("tag", value, min_value=0, max_value=10)
        elif key == "remark":
            if not isinstance(value, str):
                raise LineageParamValueError("'remark' must be str.")
            # length of remark should be in [0, 128].
            validate_range("length of remark", len(value), min_value=0, max_value=128)


def validate_str_by_regular(target, reg=None, flag=re.ASCII):
    """
    Validate string by given regular.

    Args:
        target: target string.
        reg: pattern.
        flag: pattern mode.

    Raises:
        LineageParamValueError, if string not match given pattern.

    Returns:
        bool, if target matches pattern, return True.

    """
    if reg is None:
        reg = _name_re
    if re.match(reg, target, flag) is None:
        raise LineageParamValueError("'{}' is illegal, it should be match "
                                     "regular'{}' by flags'{}'".format(target, reg, flag))
    return True
