import { distanceDependencies, dotMultiply, eigs, identity, Matrix, matrix, multiply, ones, sqrt, subtract, transpose } from "mathjs"
import { CIRCLE_RADIUS, getRealDistances, planarDistance, SCALE_FACTOR, SPHERE_RADIUS } from "./../utils";
import { CityName, truePositions } from "./../coordinates";
import { Vector3 } from "three";
import { AnimationStatus, RenderContextState } from "../state";

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

let solution: Configuration | null = null;
export const getPositionMDS = (cityName: CityName) => {
  if (solution === null) {
    solution = getPlanarSolution() as Configuration;
  }
  return solution[cityName];
};

const getPosition = (cityName: CityName, citiesRef: RenderContextState['citiesRef'], hoveredCityRef: RenderContextState['hoveredCityRef']) => {
  const destMesh = citiesRef.current[cityName];
  const hoveredCity = hoveredCityRef.current;
  if (destMesh === undefined || hoveredCity === null) throw new Error("Base or dest should not be undefined");
  const baseMesh = hoveredCity.mesh;
  const distance = planarDistance(baseMesh, destMesh) * SCALE_FACTOR;
  // @ts-expect-error: getRealDistances returns a complete table
  const trueDistance = getRealDistances()[cityName][hoveredCity.name] as number;

  const base = new Vector3().copy(baseMesh.position);
  const dest = new Vector3().copy(destMesh.position);
  const pos = new Vector3().lerpVectors(base, dest, trueDistance / distance);
  if (cityName === 'easter') console.log(pos, pos.length(), CIRCLE_RADIUS);
  if (pos.length() > CIRCLE_RADIUS) {
    pos.multiplyScalar((CIRCLE_RADIUS - 1) / pos.length());
  }
  return pos;
}

export const getFinalPositionPlane = (
  animation: AnimationStatus,
  cityName: CityName,
  citiesRef: RenderContextState['citiesRef'],
  hoveredCityRef: RenderContextState['hoveredCityRef']
) => {
  if (animation === null) throw new Error("animation should not be null in getFinalPosition");
  if (animation === 'global')
    return new Vector3(0, 0, 0);
  if (animation === 'fixed') {
    const pos = citiesRef.current[cityName]?.position;
    if (pos === undefined) throw new Error("City does not exist")
    return pos;
  }
  return getPosition(cityName, citiesRef, hoveredCityRef);
}

