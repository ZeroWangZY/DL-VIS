import sqlite3

class DataHelper():
    def __init__(self, db_file):
        self.conn = sqlite3.connect(db_file)
        self.c = self.conn.cursor()

    def get_layer_scalars(self, start_step, end_step):
        cursor = self.c.execute("select * from LAYER_SCALARS where step >= %d and step < %d" % (start_step, end_step))
        res = []
        for row in cursor:
            res.append({
                "step": row[1],
                "batch": row[2],
                "maxOutlier": row[3],
                "max": row[4],
                "Q3": row[5],
                "median": row[6],
                "mean": row[7],
                "Q1": row[8],
                "min": row[9],
                "minOutlier":row[10]
            })
        return res

    def get_model_scalars(self, start_step, end_step):
        cursor = self.c.execute("select * from MODEL_SCALARS where step >= %d and step < %d" % (start_step, end_step))
        res = []
        for row in cursor:
            res.append({
                "step": row[0],
                "train_loss": row[1],
                "test_loss": row[2],
                "train_accuracy": row[3],
                "test_accuracy": row[4],
                "learning_rate": row[5]
            })
        return res

    def get_activation_scalars(self, node, start_step, end_step):
        cursor = self.c.execute("select * from ACTIVATION_SCALARS where step >= %d and step < %d and node = '%s'" % (start_step, end_step, node))
        res = []
        for row in cursor:
            res.append({
                "step": row[0],
                "activation_min": row[2],
                "activation_mean": row[3],
                "activation_max": row[4]
            })
        return res

    def get_gradient_scalars(self, node, start_step, end_step):
        cursor = self.c.execute("select * from GRADIENT_SCALARS where step >= %d and step < %d and node = '%s'" % (start_step, end_step, node + ".weight.gradient"))
        res = []
        for row in cursor:
            res.append({
                "step": row[0],
                "gradient_min": row[2],
                "gradient_mean": row[3],
                "gradient_max": row[4]
            })
        return res

    def get_weight_scalars(self, node, start_step, end_step):
        cursor = self.c.execute("select * from WEIGHT_SCALARS where step >= %d and step < %d and node = '%s'" % (start_step, end_step, node + ".weight"))
        res = []
        for row in cursor:
            res.append({
                "step": row[0],
                "weight_min": row[2],
                "weight_mean": row[3],
                "weight_max": row[4]
            })
        return res

    def get_metadata(self, key):
        cursor = self.c.execute("select VALUE from METADATA where KEY='%s'" % (key))
        for i in cursor:
            return i[0]

    def close(self):
        self.conn.close()