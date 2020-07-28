from mindspore.train.callback import Callback, RunContext, ModelCheckpoint, SummaryStep
from mindspore.ops.primitive import Primitive

monitored_operations = {'Conv2D', 'BiasAdd',
                        'ReLU', 'MatMul',
                        'MaxPool', 'Reshape'}

class DataSaverCallback(Callback):


    def __init__(self):
        super(DataSaverCallback, self).__init__()
        self.operation_counter = 1
        self.current_step = 1

    def begin(self, run_context):
        # overwrite Primitive.__call__
        call_method = getattr(Primitive, '__call__')
        def new_call_method(self_, *args):
            output = call_method(self_, *args)
            if self_.name in monitored_operations:
                data = output.asnumpy()
                print("step: %d %s%d:    min: %f  max: %f    mean: %f" %
                      (self.current_step, self_.name, self.operation_counter, data.min(), data.max(), data.mean()))
                self.operation_counter += 1
            return output
        setattr(Primitive, '__call__', new_call_method)

    def step_begin(self, run_context):
        self.operation_counter = 1
        self.current_step += 1

    def end(self, run_context):
        print("train end")