# 配置mindspore 0.5环境的脚本

conda create -n ms python=3.7.5 -y
conda activate ms

pip install --trusted-host https://repo.huaweicloud.com -i https://repo.huaweicloud.com/repository/pypi/simple https://ms-release.obs.cn-north-4.myhuaweicloud.com/0.5.0-beta/MindSpore/gpu/ubuntu_x86/cuda-10.1/mindspore_gpu-0.5.0-cp37-cp37m-linux_x86_64.whl
wget -O openmpi.tar.gz https://download.open-mpi.org/release/open-mpi/v3.1/openmpi-3.1.5.tar.gz
tar -xzvf openmpi.tar.gz
cd openmpi-3.1.5/
./configure --prefix=$HOME/App/Openmpi
make all
make install # 非root环境下需加sudo
echo "export PATH=\$PATH:\$HOME/App/Openmpi/bin" >> $HOME/.bashrc
echo "export LD_LIBRARY_PATH=\$LD_LIBRARY_PATH:\$HOME/App/Openmpi/lib" >> $HOME/.bashrc
source $HOME/.bashrc
conda activate ms
touch /root/python
echo '#!/bin/bash -l' >> /root/python
echo "/root/miniconda3/envs/ms/bin/python \"\$@\"" >> /root/python
chmod 777 /root/python