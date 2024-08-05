import { dotMultiply, eigs, identity, Matrix, matrix, multiply, ones, sqrt, subtract, transpose } from "mathjs"
import { getRealDistances, planarDistance, SCALE_FACTOR } from "./../utils";
import { CityName } from "./../coordinates";
import { Vector2, Vector3 } from "three";
import { AnimationType, Positions, Store } from "../state";

const rotate = (theta: number) => matrix(
  [[Math.cos(theta), -Math.sin(theta), 0],
  [Math.sin(theta), Math.cos(theta), 0],
  [0, 0, 1]]
);

const translate = (x: number, y: number) => matrix([[1, 0, x], [0, 1, y], [0, 0, 1]]);
const getAngle = (v1: Vector2, v2: Vector2) => {
  const theta = Math.atan((v2.y - v1.y) / (v2.x - v1.x));
  return v1.x > v2.x ? Math.PI + theta : theta;
}


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
  const ans = [v1.toArray(), v2.toArray()] as number[][];
  return ans;
}

const centerSolution = (numbers: number[][], citiesArray: CityName[], params: ConfigParams) => {
  const i1 = citiesArray.findIndex(name => name === params.city1.name);
  const i2 = citiesArray.findIndex(name => name === params.city2.name);
  if (i1 === undefined || i2 === undefined) throw new Error("city does not exist");
  const p1MDS = new Vector2(numbers[0][i1], numbers[1][i1]);
  const p2MDS = new Vector2(numbers[0][i2], numbers[1][i2]);

  const p1 = new Vector2(params.city1.position.x, params.city1.position.z);
  const p2 = new Vector2(params.city2.position.x, params.city2.position.z);

  const thetaMDS = getAngle(p1MDS, p2MDS);
  const theta = getAngle(p1, p2);
  // if (p1.x > p2.x) {
  //   theta = Math.PI + theta;
  // }

  const row = Array.from({ length: numbers[0].length }).map(() => 1);
  const m = matrix([...numbers, row]);
  const transformed = multiply(translate(p1.x, p1.y),
    multiply(rotate(-thetaMDS + theta), multiply(
      translate(-p1MDS.x, -p1MDS.y), m)
    )
  ).toArray() as number[][];
  return transpose(matrix([transformed[0], transformed[1]])).toArray() as number[][];
}


type Configuration = { [key in CityName]: Vector3 };

type ConfigParams = {
  city1: {
    name: CityName,
    position: Vector3
  },
  city2: {
    name: CityName,
    position: Vector3
  },
  positions: Positions
};

export const getPlanarSolution = (params: ConfigParams) => {
  const distances = getRealDistances(params.positions);
  const citiesArray = Object.keys(distances) as CityName[]; // NOTE: used to match distance matrix to cities
  const n = citiesArray.length;

  const mat = Array.from({ length: n }).map(() => Array.from({ length: n }).map(() => 0));
  for (let i = 0; i < citiesArray.length; i++) {
    for (let j = 0; j < citiesArray.length; j++) {
      // @ts-expect-error: Already checked length
      mat[i][j] = distances[citiesArray[i]][citiesArray[j]] / SCALE_FACTOR;
    }
  }
  const sol = centerSolution(MDS(mat), citiesArray, params);
  // @ts-expect-error: avoid using reduce
  const ans: Configuration = {};
  for (let i = 0; i < citiesArray.length; i++) {
    const cityName = citiesArray[i];
    ans[cityName] = new Vector3(sol[i][0], 0, sol[i][1]);
  }
  return ans;
}

type Singleton = { // NOTE: typescript error forced me to write it like this
  solution: Configuration | null;
  prevParams: ConfigParams | null;
};


const singleton: Singleton = { solution: null, prevParams: null };

const getPositionMDS = (cityName: CityName, params: ConfigParams) => {
  if (singleton.solution === null || JSON.stringify(singleton.prevParams) !== JSON.stringify(params)) {
    singleton.solution = getPlanarSolution(params) as Configuration;
    singleton.prevParams = params;
  }
  return singleton.solution[cityName];
};

const getPosition = (cityName: CityName, citiesRef: Store['citiesRef'], hoveredCityRef: Store['hoveredCityRef']) => {
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
  return pos;
}

export const getFinalPositionPlane = (
  animation: AnimationType,
  cityName: CityName,
  citiesRef: Store['citiesRef'],
  hoveredCityRef: Store['hoveredCityRef'],
  getTruePositions: Store['getTruePositions'],
  anchors: [CityName | null, CityName | null]
) => {
  if (animation === 'global') {
    const [city1, city2] = anchors;
    if (!city1 || !city2) throw new Error("animation should not be null in getFinalPosition");
    const pos1 = citiesRef.current[city1]?.position;
    const pos2 = citiesRef.current[city2]?.position;
    if (pos1 === undefined || pos2 === undefined) throw new Error("City does not exist");
    const positions = getTruePositions();
    const params: ConfigParams = {
      city1: {
        name: city1,
        position: new Vector3().copy(pos1)
      },
      city2: {
        name: city2,
        position: new Vector3().copy(pos2)
      },
      positions
    };
    return getPositionMDS(cityName, params);
  }
  if (animation === 'fixed') {
    const pos = citiesRef.current[cityName]?.position;
    if (pos === undefined) throw new Error("City does not exist")
    return pos;
  }
  return getPosition(cityName, citiesRef, hoveredCityRef);
}

