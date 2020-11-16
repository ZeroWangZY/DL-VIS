import numpy as np


class PCAMatrix(object):
    m = 0
    n = 0
    # 降维所需的基向量
    base_vectors = None

    # 均值归一化
    def mean_normalization(self, X):
        for j in range(self.n):
            me = np.mean(X[:, j])
            X[:, j] = X[:, j] - me
        return X

    # r为降低到的维数
    def fit(self, X, r):
        self.m = X.shape[0]
        self.n = X.shape[1]
        # 均值归一化
        X = self.mean_normalization(X)
        Xt = X.T
        # 协方差矩阵
        c = (1 / self.m) * Xt.dot(X)
        print(c)
        # 求解协方差矩阵的特征向量和特征值
        eigenvalue, featurevector = np.linalg.eig(c)
        # 对特征值索引排序 从大到小
        aso = np.argsort(eigenvalue)
        indexs = aso[::-1]
        print("特征值:", eigenvalue)
        print("特征向量:", featurevector)
        print("降为", r, "维")
        eigenvalue_sum = np.sum(eigenvalue)
        self.base_vectors = []
        for i in range(r):
            print("第", indexs[i], "特征的解释率为:", (eigenvalue[indexs[i]] / eigenvalue_sum))
            self.base_vectors.append(featurevector[:, indexs[i]])  # 取前r个特征值大的特征向量作为基向量
        self.base_vectors = np.array(self.base_vectors)
        return

    def transform(self, X):
        # r*n的P乘以n*m的矩阵转置后为m*r的矩阵
        return self.base_vectors

    def fit_transform(self, X, r):
        self.fit(X, r)
        return self.transform(X)