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
"""momentum"""
from mindspore.ops import functional as F, composite as C, operations as P
from mindspore.common.parameter import Parameter
from mindspore.common.tensor import Tensor
import mindspore.common.dtype as mstype
from mindspore._checkparam import check_bool
from mindspore.nn.optim.optimizer import Optimizer

momentum_opt = C.MultitypeFuncGraph("momentum_opt")


@momentum_opt.register("Function", "Tensor", "Tensor", "Tensor", "Tensor", "Tensor")
def _tensor_run_opt_ext(opt, momentum, learning_rate, gradient, weight, moment):
    """Apply momentum optimizer to the weight parameter using Tensor."""
    success = True
    success = F.depend(success, opt(weight, moment, learning_rate, gradient, momentum))
    return success


class MyMomentum(Optimizer):
    def __init__(self, params, learning_rate, momentum, weight_decay=0.0, loss_scale=1.0, use_nesterov=False):
        super(MyMomentum, self).__init__(learning_rate, params, weight_decay, loss_scale)
        if isinstance(momentum, float) and momentum < 0.0:
            raise ValueError("momentum should be at least 0.0, but got momentum {}".format(momentum))
        self.momentum = Parameter(Tensor(momentum, mstype.float32), name="momentum")
        self.params = self.parameters
        self.use_nesterov = check_bool(use_nesterov)
        self.moments = self.params.clone(prefix="moments", init='zeros')
        self.hyper_map = C.HyperMap()
        self.opt = P.ApplyMomentum(use_nesterov=self.use_nesterov)
        self.scalar_summary = P.ScalarSummary()
        self.weight_names = [param.name for param in self.parameters]

    def construct(self, gradients):
        params = self.params
        moments = self.moments
        gradients = self.decay_weight(gradients)
        gradients = self.scale_grad(gradients)
        lr = self.get_lr()
        # self.scalar_summary("lr", lr)
        # self.histogram_summary(self.weight_names[0], self.paramters[0])

        if self.is_group_lr:
            success = self.hyper_map(F.partial(momentum_opt, self.opt, self.momentum), lr, gradients, params, moments)
        else:
            success = self.hyper_map(F.partial(momentum_opt, self.opt, self.momentum, lr), gradients, params, moments)
        return success
