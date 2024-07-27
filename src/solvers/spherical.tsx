import { AnimationStatus, RenderContextState } from "../state";
import { CityName, truePositions } from "../coordinates";
import { cartesianToPolar, EARTH_RADIUS, getRealDistances, polarToCartesian, slerp, SPHERE_RADIUS, sphericalDistance } from "../utils";
import { Vector3 } from "three";

const getPosition = (cityName: CityName, citiesRef: RenderContextState['citiesRef'], hoveredCityRef: RenderContextState['hoveredCityRef']) => {
  const destMesh = citiesRef.current[cityName];
  const hoveredCity = hoveredCityRef.current;
  if (destMesh === undefined || hoveredCity === null) throw new Error("Base or dest should not be undefined");
  const baseMesh = hoveredCity.mesh;
  const distance = sphericalDistance(cartesianToPolar(baseMesh.position, SPHERE_RADIUS), cartesianToPolar(destMesh.position, SPHERE_RADIUS), EARTH_RADIUS);
  // @ts-expect-error: getRealDistances returns a complete table
  const trueDistance = getRealDistances()[cityName][hoveredCity.name] as number;

  const base = new Vector3().copy(baseMesh.position).normalize();
  const dest = new Vector3().copy(destMesh.position).normalize();
  const pos = slerp(base, dest, trueDistance / distance).multiplyScalar(SPHERE_RADIUS);
  console.log(distance / trueDistance)
  return pos;
}

export const getFinalPositionSphere = (
  animation: AnimationStatus,
  cityName: CityName,
  citiesRef: RenderContextState['citiesRef'],
  hoveredCityRef: RenderContextState['hoveredCityRef']
) => {
  if (animation === null) throw new Error("animation should not be null in getFinalPosition");
  if (animation === 'global')
    return polarToCartesian(truePositions[cityName].lat, truePositions[cityName].lon, SPHERE_RADIUS);
  if (animation === 'fixed') {
    const pos = citiesRef.current[cityName]?.position;
    if (pos === undefined) throw new Error("City does not exist")
    return pos;
  }
  return getPosition(cityName, citiesRef, hoveredCityRef);
}
