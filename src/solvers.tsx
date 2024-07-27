import { distanceDependencies, dotMultiply, eigs, identity, Matrix, matrix, multiply, ones, sqrt, subtract, transpose } from "mathjs"
import { getRealDistances, SCALE_FACTOR } from "./utils";
import { CityName, truePositions } from "./coordinates";
import { Vector3 } from "three";

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

type Configuration = { [key in CityName]: Vector3 };

const getPlanarSolution = () => {
  const distances = getRealDistances();
  const citiesArray = Object.keys(distances) as CityName[];
  const n = citiesArray.length;
  if (n !== Object.keys(truePositions).length) throw Error("Not all cities have been loaded");
  const matrix = Array.from({ length: n }).map(() => Array.from({ length: n }).map(() => 0));

  for (let i = 0; i < citiesArray.length; i++) {
    for (let j = 0; j < citiesArray.length; j++) {
      // @ts-expect-error: Already checked length
      matrix[i][j] = distances[citiesArray[i]][citiesArray[j]] / SCALE_FACTOR;
    }
  }
  const sol = MDS(matrix);
  // @ts-expect-error: avoid using reduce
  const ans: Configuration = {};
  for (let i = 0; i < citiesArray.length; i++) {
    const cityName = citiesArray[i];
    ans[cityName] = new Vector3(sol[i][0], 0, sol[i][1]);
  }
  return ans;
}


const getPositionMDSWrapper = () => {
  let solution: Configuration | null = null;
  return (cityName: CityName) => {
    if (solution === null) {
      solution = getPlanarSolution() as Configuration;
    }
    return solution[cityName];
  }
}

export const getPositionMDS = getPositionMDSWrapper();


