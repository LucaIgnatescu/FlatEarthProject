import { Object3D, Vector3 } from "three";
import { CityName, PolarCoords, truePositions } from "./coordinates";
import { Distances, useUIContext } from "./state";

export const EARTH_RADIUS = 6371e3;
export const SPHERE_RADIUS = 30;
export const CIRCLE_RADIUS = 80;
export const SCALE_FACTOR = 225;

export type ObjectType = 'plane' | 'sphere';

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}


export function sphericalDistance(x: PolarCoords, y: PolarCoords, r: number) {
  const φ1 = x.lat * Math.PI / 180;
  const φ2 = y.lat * Math.PI / 180;
  const Δφ = (y.lat - x.lat) * Math.PI / 180;
  const Δλ = (y.lon - x.lon) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = r * c; // in metres
  return Math.round(d / 10) / 100;
}

export function planarDistance(p1: Object3D, p2: Object3D) {
  return p1.position.distanceTo(p2.position);
}

export function totalDistance(distances: Distances) {
  let totalSum = 0;
  for (const city1 of Object.keys(distances) as CityName[]) {
    for (const city2 of Object.keys(distances[city1]) as CityName[]) {
      totalSum += distances[city1][city2]
    }
  }
  return totalSum;
}

export function useDistanceInfo() {
  const realDistances = getRealDistances();
  const { currDistances } = useUIContext();
  const totalCurr = totalDistance(currDistances); //should be 5.018 in correct solve
  const totalReal = totalDistance(realDistances);
  return { realDistances, currDistances, totalCurr, totalReal };
}

const realDistances: Distances = {};

export function getRealDistances(): Distances {
  if (Object.keys(realDistances).length === 0) {
    for (const [cityName1, cityMesh1] of Object.entries(truePositions) as [CityName, PolarCoords][]) {
      for (const [cityName2, cityMesh2] of Object.entries(truePositions) as [CityName, PolarCoords][]) {
        const distance = sphericalDistance(cityMesh1, cityMesh2, EARTH_RADIUS);
        if (realDistances[cityName1] === undefined) realDistances[cityName1] = {};
        if (realDistances[cityName2] === undefined) realDistances[cityName2] = {};
        realDistances[cityName1][cityName2] = distance;
        realDistances[cityName2][cityName1] = distance;
      }
    }
  }
  return realDistances;
}

export function polarToCartesian(lat: number, lon: number, r: number) {
  const latRad = lat * (Math.PI / 180);
  const lonRad = -lon * (Math.PI / 180);
  const x = Math.cos(latRad) * Math.cos(lonRad) * r;
  const y = Math.sin(latRad) * r;
  const z = Math.cos(latRad) * Math.sin(lonRad) * r;
  return new Vector3(x, y, z);
}


export function cartesianToPolar(v: Vector3, r: number) {
  const { x, y, z } = v;
  const lat = Math.asin(y / r) * (180 / Math.PI);
  const lon = -1 * Math.atan2(z, x) * (180 / Math.PI);

  return { lat, lon }
}

export function sca() {
  return Math.random() * 26 - 18;
}

export function slerp(base: Vector3, dest: Vector3, t: number) { // NOTE: Assumes normalized
  base = new Vector3().copy(base);
  dest = new Vector3().copy(dest);
  const theta = Math.acos(base.dot(dest));
  return base.multiplyScalar(Math.sin((1 - t) * theta) / Math.sin(theta)).add(
    dest.multiplyScalar(Math.sin(t * theta) / Math.sin(theta))
  );
}
