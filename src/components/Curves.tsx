import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { CatmullRomCurve3, Material, Mesh, MeshBasicMaterial, TubeGeometry, Vector3 } from "three";
import { GREEN, ObjectType, ORANGE, PURPLE, slerp, SPHERE_RADIUS, YELLOW } from "../utils";
import { CityName } from "../coordinates"; // NOTE: This used to be an array in the original implementation
import { useStore } from "../state";
import { getDistancesLazy } from "../distances";


function generatePoints(type: ObjectType, base: Vector3, dest: Vector3) {
  if (type === 'plane') {
    return [new Vector3().copy(base), new Vector3().copy(dest)];
  }

  const pts = [];
  const nSegments = 25;

  const destN = new Vector3().copy(dest).normalize();
  const baseN = new Vector3().copy(base).normalize();
  for (let i = 0; i <= nSegments; i++) {
    pts.push(slerp(baseN, destN, i / nSegments).multiplyScalar(SPHERE_RADIUS));
  }
  return pts;
}
//
// function getMidpoint(type: ObjectType, base: Vector3, dest: Vector3) {
//   if (type === 'plane') {
//     const midpoint = new Vector3().lerpVectors(base, dest, 1 / 2);
//     midpoint.add({ x: 2, y: 0, z: 2 });
//     return midpoint;
//   }
//   const midpoint = slerp(new Vector3().copy(base).normalize(), new Vector3().copy(dest).normalize(), 1 / 2);
//   return midpoint.multiplyScalar(SPHERE_RADIUS + 5);
// }
//
// function useHoveringDistance(type: ObjectType, cityName: CityName, dest: Vector3) {
//   const hoveredCityRef = useStore(state => state.hoveredCityRef);
//   const updateHoverPositions = useStore(state => state.updateHoverPositions);
//   useFrame(() => {
//     if (hoveredCityRef.current === null) return; // TODO: Reset hovered
//
//     const midpoint = getMidpoint(type, hoveredCityRef.current.mesh.position, dest);
//
//   })
// }

function Curve({ dest, cityName, radius }: { dest: Vector3, cityName: CityName, radius?: number }) {
  const ref = useRef<Mesh>(null!);
  const hoveredCityRef = useStore(state => state.hoveredCityRef);
  const citiesRef = useStore(state => state.citiesRef);
  const type = useStore(state => state.objectType);

  const THRESH = 50;

  useFrame(() => {
    if (hoveredCityRef.current === null) {
      ref.current.visible = false;
      return;
    }
    const base = hoveredCityRef.current.mesh.position;
    const baseName = hoveredCityRef.current.name;
    ref.current.visible = true;

    const pts = generatePoints(type, base, dest);
    if (pts.length < 2 || isNaN(pts[0].x)) return; // TODO: Find out why this happens

    const curve = new CatmullRomCurve3(pts);

    ref.current.geometry.dispose();
    ref.current.geometry = new TubeGeometry(curve, 64, radius ?? 0.07, 50, false);
    const { currDistance, trueDistance } = getDistancesLazy(baseName, cityName, type, citiesRef);
    const delta = currDistance - trueDistance;
    let color = GREEN;
    if (delta > THRESH) color = ORANGE;
    if (delta < -THRESH) color = YELLOW;
    const material = new MeshBasicMaterial({ color });

    (ref.current.material as Material).dispose();
    ref.current.material = material;

  });

  return (
    <mesh ref={ref}>
    </mesh>
  );
}

export function Curves({ radius }: { radius?: number }) {
  const citiesRef = useStore(state => state.citiesRef);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const nCities = useStore(state => state.nCities);
  if (nCities !== nRenderedCities) return null;

  return Object.keys(citiesRef.current).map(cityName =>
    <Curve dest={citiesRef.current[cityName as CityName]?.position ?? new Vector3(0, 0, 0)} key={cityName} radius={radius} cityName={cityName as CityName} />
  )
}
