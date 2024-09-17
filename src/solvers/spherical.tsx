import { AnimationType, Store } from "../state";
import { CityName, positions } from "../coordinates";
import { polarToCartesian, slerp, SPHERE_RADIUS } from "../utils";
import { Vector3 } from "three";
import { getDistancesLazy } from "../distances";

const getPosition = (cityName: CityName, citiesRef: Store['citiesRef'], hoveredCity: Store['hoveredCity']) => {
  const destMesh = citiesRef.current[cityName];
  if (destMesh === undefined || hoveredCity === null) throw new Error("Base or dest should not be undefined");
  const baseMesh = hoveredCity.mesh;
  const { trueDistance, currDistance } = getDistancesLazy(cityName, hoveredCity.name, 'sphere', citiesRef);
  const base = new Vector3().copy(baseMesh.position).normalize();
  const dest = new Vector3().copy(destMesh.position).normalize();
  const pos = slerp(base, dest, trueDistance / currDistance).multiplyScalar(SPHERE_RADIUS);
  return pos;
}

export const getFinalPositionSphere = (
  animation: AnimationType,
  cityName: CityName,
  citiesRef: Store['citiesRef'],
  hoveredCity: Store['hoveredCity']
) => {
  if (animation === null) throw new Error("animation should not be null in getFinalPosition");
  if (animation === 'global') {
    if (!positions[cityName]) throw new Error("city does not exist");
    return polarToCartesian(positions[cityName].lat, positions[cityName].lon, SPHERE_RADIUS);
  }
  if (animation === 'fixed') {
    const pos = citiesRef.current[cityName]?.position;
    if (pos === undefined) throw new Error("City does not exist")
    return pos;
  }
  return getPosition(cityName, citiesRef, hoveredCity);
}
