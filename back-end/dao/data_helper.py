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
                "batchSize": row[3],
                "maximum": row[4],
                "upperBoundary": row[5],
                "Q3": row[6],
                "median": row[7],
                "mean": row[8],
                "Q1": row[9],
                "lowerBoundary": row[10],
                "minimum":row[11]
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
                "dataIndex": row[2],
                "minimum": row[3],
                "Q1": row[4],
                "median": row[5],
                "mean": row[6],
                "Q3": row[7],
                "maximum": row[8],
            })
        return res

    def get_gradient_scalars(self, node, start_step, end_step):
        cursor = self.c.execute("select * from GRADIENT_SCALARS where step >= %d and step < %d and node = '%s'" % (start_step, end_step, node))
        res = []
        for row in cursor:
            res.append({
                "step": row[0],
                "minimum": row[2],
                "Q1": row[3],
                "median": row[4],
                "mean": row[5],
                "Q3": row[6],
                "maximum": row[7],
            })
        return res

    def get_weight_scalars(self, node, start_step, end_step):
        cursor = self.c.execute("select * from WEIGHT_SCALARS where step >= %d and step < %d and node = '%s'" % (start_step, end_step, node))
        res = []
        for row in cursor:
            res.append({
                "step": row[0],
                "minimum": row[2],
                "Q1": row[3],
                "median": row[4],
                "mean": row[5],
                "Q3": row[6],
                "maximum": row[7],
            })
        return res

    def get_metadata(self, key):
        cursor = self.c.execute("select VALUE from METADATA where KEY='%s'" % (key))
        for i in cursor:
            return i[0]
    
    def get_realtime_metadata(self, key):
        cursor = self.c.execute("select max(step) from MODEL_SCALARS")
        for i in cursor:
            return i[0]

    def close(self):
        self.conn.close()