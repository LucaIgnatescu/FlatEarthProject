import { useFrame } from "@react-three/fiber";
import { ReactNode, useRef, useState } from "react";
import { CatmullRomCurve3, Material, Mesh, MeshBasicMaterial, TubeGeometry, Vector3 } from "three";
import { ObjectType, slerp, SPHERE_RADIUS, useDistanceInfo } from "../utils";
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

function Curve({ type, dest, cityName }: { type: ObjectType, dest: Vector3, cityName: CityName }) {
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
    ref.current.geometry = new TubeGeometry(curve, 64, 0.07, 50, false);
    if (
      realDistances[baseName] === undefined ||
      realDistances[baseName][cityName] === undefined ||
      currDistances[baseName] === undefined ||
      currDistances[baseName][cityName] === undefined
    ) throw new Error(`${baseName} or ${cityName} not found`)


    const threshold = 2000;
    const delta = Math.abs(realDistances[baseName][cityName] - currDistances[baseName][cityName]);
    const color = delta < threshold ? 0x3acabb : 0xff8400;
    const material = new MeshBasicMaterial({ color });
    (ref.current.material as Material).dispose();
    ref.current.material = material;

  });

  return (
    <mesh ref={ref}>
    </mesh>
  );
}

export function Curves({ type }: { type: ObjectType }) {
  const [isSet, setIsSet] = useState(false);
  const curvesRef = useRef<ReactNode[]>([]);
  const citiesRef = useStore(state => state.citiesRef);
  const hoveredCityRef = useStore(state => state.hoveredCityRef);
  const getTruePositions = useStore(state => state.getTruePositions);
  useFrame(() => {
    if (
      isSet ||
      hoveredCityRef.current === null || citiesRef.current == null ||
      Object.keys(citiesRef.current).length !== Object.keys(getTruePositions()).length
    ) return;
    const cities = citiesRef.current;
    curvesRef.current = [];
    for (const cityName of Object.keys(citiesRef.current) as CityName[]) {
      if (cities[cityName]?.position === undefined) return;
      curvesRef.current.push(<Curve dest={cities[cityName].position} key={cityName} type={type} cityName={cityName} />)
    }
    setIsSet(true);
  })

  return curvesRef.current;
}
