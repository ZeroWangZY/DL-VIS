#!/bin/bash
# Copyright 2020 Huawei Technologies Co., Ltd.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e

SCRIPT_BASEDIR=$(realpath "$(dirname "$0")")

PROJECT_DIR=$(realpath "$SCRIPT_BASEDIR/../../")
CRC32_SCRIPT_PATH="$PROJECT_DIR/build/scripts/crc32.sh"
CRC32_OUTPUT_DIR="$PROJECT_DIR/mindinsight/datavisual/utils/"
UT_PATH="$PROJECT_DIR/tests/ut"
IS_BUILD_CRC=""

build_crc32() {
    echo "Start to check crc32."
    if [ -d "$CRC32_OUTPUT_DIR" ]; then
        cd "$CRC32_OUTPUT_DIR" || exit
        result=$(find . -maxdepth 1 -name "crc32*.so")
        if [ -z "$result" ]; then
            echo "Start to build crc32."
            IS_BUILD_CRC="true"
            bash "$CRC32_SCRIPT_PATH"
        fi
    fi

}

clean_crc32() {
    echo "Start to clean crc32."
    if [ -n "$IS_BUILD_CRC" ]; then
        rm -f "$CRC32_OUTPUT_DIR"/crc32*.so
    fi
}

before_run_test() {
    echo "Before run tests."
    export PYTHONPATH=$PROJECT_DIR:$PYTHONPATH
    build_crc32
}

after_run_test() {
    echo "After run tests."
    clean_crc32

    echo "End to run test."
}

run_test() {
    echo "Start to run test."
    cd "$PROJECT_DIR" || exit

    pytest "$UT_PATH"

    echo "Test all use cases success."
}

before_run_test
run_test
after_run_test
