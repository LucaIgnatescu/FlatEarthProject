import { useFrame } from "@react-three/fiber";
import { ReactNode, useRef, useState } from "react";
import { CatmullRomCurve3, Material, Mesh, MeshBasicMaterial, TubeGeometry, Vector3 } from "three";
import { GREEN, ObjectType, ORANGE, slerp, SPHERE_RADIUS, useDistanceInfo } from "../utils";
import { CityName } from "../coordinates"; // NOTE: This used to be an array in the original implementation
import { useStore } from "../state";


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

function Curve({ type, dest, cityName, radius }: { type: ObjectType, dest: Vector3, cityName: CityName, radius?: number }) {
  const ref = useRef<Mesh>(null!);
  const hoveredCityRef = useStore(state => state.hoveredCityRef);
  const { realDistances, currDistances } = useDistanceInfo();
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
    if (
      realDistances[baseName] === undefined ||
      realDistances[baseName][cityName] === undefined ||
      currDistances[baseName] === undefined ||
      currDistances[baseName][cityName] === undefined
    ) throw new Error(`${baseName} or ${cityName} not found`)


    const threshold = 50;
    const delta = Math.abs(realDistances[baseName][cityName] - currDistances[baseName][cityName]);
    const color = delta < threshold ? GREEN : ORANGE;
    const material = new MeshBasicMaterial({ color });
    (ref.current.material as Material).dispose();
    ref.current.material = material;

  });

  return (
    <mesh ref={ref}>
    </mesh>
  );
}

export function Curves({ type, radius }: { type: ObjectType, radius?: number }) {
  const citiesRef = useStore(state => state.citiesRef);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const nCities = useStore(state => state.nCities);
  if (nCities !== nRenderedCities) return null;

  return Object.keys(citiesRef.current).map(cityName =>
    <Curve dest={citiesRef.current[cityName as CityName]?.position ?? new Vector3(0, 0, 0)} key={cityName} radius={radius} type={type} cityName={cityName as CityName} />
  )
}
