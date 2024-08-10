import { Object3D, Vector3 } from "three";
import { CityName, PolarCoords, positions } from "./coordinates";
import { useStore, Distances, Positions } from "./state";

export const EARTH_RADIUS = 6371e3;
export const SPHERE_RADIUS = 30;
export const CIRCLE_RADIUS = 80;
export const SCALE_FACTOR = 225;
export const ORANGE = 0xff8400;
export const GREEN = 0x3acabb;

export type ObjectType = 'plane' | 'sphere';

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

