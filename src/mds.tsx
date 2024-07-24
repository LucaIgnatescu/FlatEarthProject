import { add, divide, dotMultiply, eigs, identity, Matrix, matrix, multiply, ones, sqrt, subtract, sum, transpose } from "mathjs"

const sumColumns = (X: Matrix) => {
  const ans = [];
  const [m, n] = X.size();
  for (let j = 0; j < n; j++) {
    let colSum = 0;
    for (let i = 0; i < m; i++) {
      colSum += X.get([i, j]);
    }
    ans.push(colSum);
  }
  return matrix([ans]);
}

// NOTE: Implemented from https://link.springer.com/chapter/10.1007/978-3-642-27497-8_6 
const MDS = (distances: number[][]) => {
  const X = matrix(distances);
  const [N,] = X.size();
  const D = dotMultiply(X, X);
  const C = subtract(identity(N), multiply(1 / N, ones(1, 1)));
  const B = multiply(-0.5, multiply(C, multiply(D, C)));
  const { eigenvectors } = eigs(B);

  eigenvectors.sort(eigenvector => eigenvector.value as number);

  const e1 = eigenvectors[eigenvectors.length - 1];
  const e2 = eigenvectors[eigenvectors.length - 2];
  const v1 = multiply(sqrt(e1.value as number), e1.vector) as Matrix;
  const v2 = multiply(sqrt(e2.value as number), e2.vector) as Matrix;
  const ans = transpose(matrix([v1.toArray(), v2.toArray()] as number[][]));
  return ans.toArray() as [number, number][];
}

MDS([
  [0, 1, 1],
  [1, 0, Math.sqrt(2)],
  [1, Math.sqrt(2), 0]
]);
