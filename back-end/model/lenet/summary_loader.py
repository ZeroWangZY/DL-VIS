from mindinsight.datavisual.common.enums import PluginNameEnum
from ms.data_loader import DataLoader

dl = DataLoader("./summary/lenet-07231423")
dl.load()
e = dl.get_events_data()