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
DataLoader is an adapter for all other loaders.

This module can identify what loader should be used to load data.
"""

from .ms_data_loader import MSDataLoader


class DataLoader:
    """
    The adapter of all kinds of loaders.

    Args:
        summary_dir (str): A directory path.
    """

    def __init__(self, summary_dir):
        self._summary_dir = summary_dir
        self._loader = None

    def set_summary_dir(self, summary_dir):
        """Set summary path."""
        self._summary_dir = summary_dir

    def load(self):
        """Load the data when loader is exist."""
        if self._loader is None:
            ms_dataloader = MSDataLoader(self._summary_dir)
            loaders = [ms_dataloader]
            for loader in loaders:
                if loader.filter_valid_files():
                    self._loader = loader
                    break

            if self._loader is None:
                err_message = "No valid files can be loaded, summary_dir: {}.".format(
                    self._summary_dir
                )
                print(err_message)
                raise Exception(err_message)

        self._loader.load()

    def get_events_data(self):
        """
        Get events data from log file.

        Returns:
            Optional[EventsData], None or events data.
        """
        return self._loader.get_events_data()

    def has_valid_files(self):
        """
        Check the directory for valid files.

        Returns:
            bool, if the directory has valid files, return True.
        """
        ms_dataloader = MSDataLoader(self._summary_dir)
        return bool(ms_dataloader.filter_valid_files())
