import { useFrame } from "@react-three/fiber";
import { ReactNode, useRef, useState } from "react";
import { CatmullRomCurve3, Mesh, TubeGeometry, Vector3 } from "three";
import { ObjectType, slerp, SPHERE_RADIUS } from "../utils";
import { CityName, truePositions } from "../coordinates"; // NOTE: This used to be an array in the original implementation
import { useRenderContext } from "../state";


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

function Curve({ type, dest }: { type: ObjectType, dest: Vector3 }) {
  const ref = useRef<Mesh>(null!);
  const { hoveredCityRef } = useRenderContext();
  useFrame(() => {
    const base = hoveredCityRef.current?.mesh.position;
    if (base === undefined) {
      ref.current.visible = false;
      return;
    }
    ref.current.visible = true;

    const pts = generatePoints(type, base, dest);
    if (pts.length < 2 || isNaN(pts[0].x)) return; // TODO: Find out why this happens

    const curve = new CatmullRomCurve3(pts);

    ref.current.geometry.dispose();
    ref.current.geometry = new TubeGeometry(curve, 64, 0.05, 50, false);
  });

  const color = 0x3acabb; // TODO: Adjust color
  return (
    <mesh ref={ref}>
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

export function Curves({ type }: { type: ObjectType }) {
  const { citiesRef, hoveredCityRef } = useRenderContext();
  const [isSet, setIsSet] = useState(false);
  const curvesRef = useRef<ReactNode[]>([]);

  useFrame(() => {
    if (
      isSet ||
      hoveredCityRef.current === null || citiesRef.current == null ||
      Object.keys(citiesRef.current).length !== Object.keys(truePositions).length
    ) return;
    const cities = citiesRef.current;
    curvesRef.current = [];
    for (const cityName of Object.keys(citiesRef.current) as CityName[]) {
      if (cities[cityName]?.position === undefined) return;
      curvesRef.current.push(<Curve dest={cities[cityName].position} key={cityName} type={type} />)
    }
    setIsSet(true);
  })

  return curvesRef.current; //this is prob bad
}
