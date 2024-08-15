import { Vector3 } from "three";
import { CityName, PolarCoords, positions } from "./coordinates";
import { CurrPositions, Distances, Positions, Store } from "./state";
import { cartesianToPolar, EARTH_RADIUS, ObjectType, planarDistance, SCALE_FACTOR, SPHERE_RADIUS, sphericalDistance } from "./utils";


export function getDistancesLazy(city1: CityName, city2: CityName, type: ObjectType, citiesRef: Store['citiesRef']) {
  const trueDistance = sphericalDistance(positions[city1], positions[city2], EARTH_RADIUS);
  const mesh1 = citiesRef.current[city1];
  const mesh2 = citiesRef.current[city2];
  if (mesh1 === undefined || mesh2 === undefined) throw new Error(`${city1} or ${city2} does not exist`);

  const calculateDistances = type === 'plane' ? calculateDistancesPlane : calculateDistancesSphere;
  const currDistance = calculateDistances(mesh1.position, mesh2.position);
  return { trueDistance, currDistance };
}

export function getDistancesFast(city1: CityName, city2: CityName, type: ObjectType, currPositions: CurrPositions) {
  const trueDistance = sphericalDistance(positions[city1], positions[city2], EARTH_RADIUS);
  const v1 = currPositions[city1];
  const v2 = currPositions[city2];
  if (v1 === undefined || v2 === undefined) throw new Error(`${city1} or ${city2} does not exist`);

  const calculateDistances = type === 'plane' ? calculateDistancesPlane : calculateDistancesSphere;
  const currDistance = calculateDistances(v1, v2);
  return { trueDistance, currDistance };
}

export function computeTotalError(type: ObjectType, currPositions: CurrPositions) {
  let error = 0;
  const cities = Object.keys(currPositions) as CityName[];
  for (const city1 of cities) {
    for (const city2 of cities) {
      if (city1 === city2) continue;
      const { trueDistance, currDistance } = getDistancesFast(city1, city2, type, currPositions);
      console.log(trueDistance, currDistance, city1, city2);
      error += Math.abs(trueDistance - currDistance);
    }
  }
  return error;
}


export function computeRealDistances(pos?: Positions): Distances {
  if (pos === undefined) pos = positions;
  const realDistances: Distances = {};
  for (const [cityName1, cityMesh1] of Object.entries(pos) as [CityName, PolarCoords][]) {
    for (const [cityName2, cityMesh2] of Object.entries(pos) as [CityName, PolarCoords][]) {
      const distance = sphericalDistance(cityMesh1, cityMesh2, EARTH_RADIUS);
      if (realDistances[cityName1] === undefined) realDistances[cityName1] = {};
      if (realDistances[cityName2] === undefined) realDistances[cityName2] = {};
      realDistances[cityName1][cityName2] = distance;
      realDistances[cityName2][cityName1] = distance;
    }
  }
  return realDistances;
}

const calculateDistancesPlane = (v1: Vector3, v2: Vector3) => {
  return planarDistance(v1, v2) * SCALE_FACTOR;
}


const calculateDistancesSphere = (v1: Vector3, v2: Vector3) => {
  const p1 = cartesianToPolar(v1, SPHERE_RADIUS);
  const p2 = cartesianToPolar(v2, SPHERE_RADIUS);
  return sphericalDistance(p1, p2, EARTH_RADIUS); //compute distances as if on the earth
}
