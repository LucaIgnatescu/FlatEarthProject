import { Mesh } from "three";
import { CityName, PolarCoords, positions } from "./coordinates";
import { Distances, Positions, Store } from "./state";
import { cartesianToPolar, EARTH_RADIUS, ObjectType, planarDistance, SCALE_FACTOR, SPHERE_RADIUS, sphericalDistance } from "./utils";


export function getDistances(city1: CityName, city2: CityName, type: ObjectType, citiesRef: Store['citiesRef']) {
  const trueDistance = sphericalDistance(positions[city1], positions[city2], EARTH_RADIUS);
  const mesh1 = citiesRef.current[city1];
  const mesh2 = citiesRef.current[city2];
  if (mesh1 === undefined || mesh2 === undefined) throw new Error(`${city1} or ${city2} does not exist`);

  const calculateDistances = type === 'plane' ? calculateDistancesPlane : calculateDistancesSphere;
  const currDistance = calculateDistances(mesh1, mesh2);
  return { trueDistance, currDistance };
}

export function computeTotalError(type: ObjectType, citiesRef: Store['citiesRef']) {
  let error = 0;
  const cities = Object.keys(citiesRef.current) as CityName[];
  for (const city1 of cities) {
    for (const city2 of cities) {
      if (city1 === city2) continue;
      const { trueDistance, currDistance } = getDistances(city1, city2, type, citiesRef);
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

const calculateDistancesPlane = (mesh1: Mesh, mesh2: Mesh) => {
  return planarDistance(mesh1, mesh2) * SCALE_FACTOR;
}


const calculateDistancesSphere = (mesh1: Mesh, mesh2: Mesh) => {
  const p1 = cartesianToPolar(mesh1.position, SPHERE_RADIUS);
  const p2 = cartesianToPolar(mesh2.position, SPHERE_RADIUS);
  return sphericalDistance(p1, p2, EARTH_RADIUS); //compute distances as if on the earth
}
