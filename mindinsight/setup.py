# Copyright 2019 Huawei Technologies Co., Ltd.All Rights Reserved.
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
# ==============================================================================
"""Setup."""

import sys
import os
import shutil
import stat
import platform
import shlex
import subprocess
import types
from importlib import import_module
from setuptools import setup
from setuptools.command.egg_info import egg_info
from setuptools.command.build_py import build_py
from setuptools.command.install import install


def get_version():
    """Get version."""
    machinery = import_module('importlib.machinery')
    version_path = os.path.join(os.path.dirname(__file__), 'mindinsight', '_version.py')
    module_name = '__mindinsightversion__'
    version_module = types.ModuleType(module_name)
    loader = machinery.SourceFileLoader(module_name, version_path)
    loader.exec_module(version_module)
    return version_module.VERSION


def get_os():
    """Get OS."""
    os_system = platform.system().lower()
    return os_system


def get_description():
    """Get description."""
    os_info = get_os()
    cpu_info = platform.machine()

    cmd = "git log --format='[sha1]:%h, [branch]:%d' -1"
    process = subprocess.Popen(
        shlex.split(cmd),
        shell=False,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    stdout, _ = process.communicate()
    if not process.returncode:
        git_version = stdout.decode()
        return 'mindinsight platform: %s, cpu: %s, git version: %s' % (os_info, cpu_info, git_version)

    return 'mindinsight platform: %s, cpu: %s' % (os_info, cpu_info)


def get_install_requires():
    """Get install requirements."""
    with open('requirements.txt') as file:
        return file.read().splitlines()


def update_permissions(path):
    """
    Update permissions.

    Args:
        path (str): Target directory path.
    """
    for dirpath, dirnames, filenames in os.walk(path):
        for dirname in dirnames:
            dir_fullpath = os.path.join(dirpath, dirname)
            os.chmod(dir_fullpath, stat.S_IREAD | stat.S_IWRITE | stat.S_IEXEC | stat.S_IRGRP | stat.S_IXGRP)
        for filename in filenames:
            file_fullpath = os.path.join(dirpath, filename)
            os.chmod(file_fullpath, stat.S_IREAD)


def run_script(script):
    """
    Run script.

    Args:
        script (str): Target script file path.
    """
    cmd = '/bin/bash {}'.format(script)
    process = subprocess.Popen(
        shlex.split(cmd),
        shell=False
    )

    rc = process.wait()
    if rc:
        sys.exit(1)


class EggInfo(egg_info):
    """Egg info."""

    def run(self):
        self.build_dependencies()

        egg_info_dir = os.path.join(os.path.dirname(__file__), 'mindinsight.egg-info')
        shutil.rmtree(egg_info_dir, ignore_errors=True)

        super().run()

        update_permissions(egg_info_dir)

    def build_dependencies(self):
        build_dir = os.path.join(os.path.dirname(__file__), 'build')

        sys.stdout.write('building crc32 ...\n')
        crc32_script = os.path.join(build_dir, 'scripts', 'crc32.sh')
        run_script(crc32_script)

        sys.stdout.write('building ui ...\n')
        ui_script = os.path.join(build_dir, 'scripts', 'ui.sh')
        run_script(ui_script)


class BuildPy(build_py):
    """Build py files."""

    def run(self):
        mindinsight_lib_dir = os.path.join(os.path.dirname(__file__), 'build', 'lib', 'mindinsight')
        shutil.rmtree(mindinsight_lib_dir, ignore_errors=True)

        super().run()

        update_permissions(mindinsight_lib_dir)


class Install(install):
    """Install."""

    def run(self):
        super().run()

        if sys.argv[-1] == 'install':
            pip = import_module('pip')
            mindinsight_dir = os.path.join(os.path.dirname(pip.__path__[0]), 'mindinsight')
            update_permissions(mindinsight_dir)


if __name__ == '__main__':
    version_info = sys.version_info
    if (version_info.major, version_info.minor) < (3, 7):
        sys.stderr.write('Python version should be at least 3.7\r\n')
        sys.exit(1)

    setup(
        name='mindinsight',
        version=get_version(),
        author='The MindSpore Authors',
        author_email='contact@mindspore.cn',
        url='https://www.mindspore.cn',
        download_url='https://gitee.com/mindspore/mindinsight/tags',
        project_urls={
            'Sources': 'https://gitee.com/mindspore/mindinsight',
            'Issue Tracker': 'https://gitee.com/mindspore/mindinsight/issues',
        },
        description=get_description(),
        packages=['mindinsight'],
        platforms=[get_os()],
        include_package_data=True,
        cmdclass={
            'egg_info': EggInfo,
            'build_py': BuildPy,
            'install': Install,
        },
        entry_points={
            'console_scripts': [
                'mindinsight=mindinsight.utils.command:main',
                'mindconverter=mindinsight.mindconverter.cli:cli_entry',
            ],
        },
        python_requires='>=3.7',
        install_requires=get_install_requires(),
        classifiers=[
            'Development Status :: 4 - Beta',
            'Environment :: Console',
            'Environment :: Web Environment',
            'Intended Audience :: Science/Research',
            'Intended Audience :: Developers',
            'License :: OSI Approved :: Apache Software License',
            'Programming Language :: Python :: 3 :: Only',
            'Programming Language :: Python :: 3.7',
            'Programming Language :: Python :: 3.8',
            'Topic :: Scientific/Engineering',
            'Topic :: Scientific/Engineering :: Artificial Intelligence',
            'Topic :: Software Development',
            'Topic :: Software Development :: Libraries',
            'Topic :: Software Development :: Libraries :: Python Modules',
        ],
        license='Apache 2.0',
        keywords='mindinsight',
    )
