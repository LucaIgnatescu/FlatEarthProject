import { Size, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Camera, CatmullRomCurve3, Material, Mesh, MeshBasicMaterial, TubeGeometry, Vector2, Vector3 } from "three";
import { getColor, ObjectType, slerp, SPHERE_RADIUS } from "../utils";
import { CityName } from "../coordinates"; // NOTE: This used to be an array in the original implementation
import { CityInfo, useStore } from "../state";
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

function getMidpoint(type: ObjectType, base: Vector3, dest: Vector3) {
  if (type === 'plane') {
    const midpoint = new Vector3().lerpVectors(base, dest, 1 / 2);
    midpoint.add({ x: 1, y: 0, z: 1 });
    return midpoint;
  }
  const midpoint = slerp(new Vector3().copy(base).normalize(), new Vector3().copy(dest).normalize(), 1 / 2);
  const OFFSET = 2; // TODO: Add a mapping function for the offset
  return midpoint.multiplyScalar(SPHERE_RADIUS + OFFSET);
}

//function getRealMidpoint(type: ObjectType, base: Vector3, dest: Vector3) {
//  if (type === 'plane') return new Vector3().lerpVectors(base, dest, 1 / 2);
//  return slerp(new Vector3().copy(base).normalize(), new Vector3().copy(dest).normalize(), 1 / 2).multiplyScalar(SPHERE_RADIUS)
//}

function project(p: Vector3, camera: Camera, size: Size) {
  const proj = p.clone().project(camera);

  // Convert NDC to screen space
  const x = (proj.x * 0.5 + 0.5) * size.width;
  const y = (1 - proj.y * 0.5 - 0.5) * size.height;
  return [x, y];
}

const getAngle = (v1: Vector2, v2: Vector2) => {
  const theta = Math.atan((v2.y - v1.y) / (v2.x - v1.x));
  return theta;
}

function getTextAngle(type: ObjectType, base: Vector3, dest: Vector3, camera: Camera, size: Size) {
  const OFFSET = 0.01;
  let mid, offset;
  if (type === 'plane') {
    mid = new Vector3().lerpVectors(base, dest, 1 / 2);
    offset = new Vector3().lerpVectors(base, dest, 1 / 2 + OFFSET);
  } else {
    const baseN = base.clone().normalize();
    const destN = dest.clone().normalize();
    mid = slerp(baseN, destN, 1 / 2).multiplyScalar(SPHERE_RADIUS);
    offset = slerp(baseN, destN, 1 / 2 + OFFSET).multiplyScalar(SPHERE_RADIUS);
  }
  const [x1, y1] = project(mid, camera, size);
  const [x2, y2] = project(offset, camera, size);

  return getAngle(new Vector2(x1, y1), new Vector2(x2, y2));
}


function useHoveringDistance(type: ObjectType, baseInfo: CityInfo, destInfo: CityInfo) {
  // function useHoveringDistance(type: ObjectType, destName: CityName, base: Vector3, dest: Vector3) {
  const updateHoverPositions = useStore(state => state.updateHoverPositions);
  const { camera, size, raycaster, scene } = useThree();
  const earthUUID = useStore(state => state.earthUUID);
  const earth = scene.getObjectByProperty('uuid', earthUUID);
  useFrame(() => { // NOTE: might need to move this somewhere else
    // if (hoveredCity === null) return; // TODO: Reset hovered
    const midpoint = getMidpoint(type, baseInfo.mesh.position, destInfo.mesh.position);
    const [x, y] = project(midpoint, camera, size);

    const proj = midpoint.clone().project(camera);
    raycaster.setFromCamera(new Vector2(proj.x, proj.y), camera);

    if (earth === undefined) return;
    const objects = raycaster.intersectObject(earth);
    if (objects.length !== 0) {
      const firstPoint = objects[0].point
      const THRESH = 10; // NOTE: This is a harcoded value because intersections behave weirdly

      if (firstPoint.distanceTo(midpoint) > THRESH) {
        updateHoverPositions(`${baseInfo.name}_${destInfo.name}`, null);
        return;
      }
    }

    const rotation = getTextAngle(type, baseInfo.mesh.position, destInfo.mesh.position, camera, size);
    updateHoverPositions(`${baseInfo.name}_${destInfo.name}`, [x, y], rotation);
  })
}

function Curve({ baseInfo, destInfo, radius }: { baseInfo: CityInfo, destInfo: CityInfo, radius?: number }) {
  const ref = useRef<Mesh>(null!);
  const citiesRef = useStore(state => state.citiesRef);
  const type = useStore(state => state.objectType);

  const base = baseInfo.mesh.position;
  const baseName = baseInfo.name;
  const dest = destInfo.mesh.position;
  const destName = destInfo.name;

  useHoveringDistance(type, baseInfo, destInfo);

  useFrame(() => {
    ref.current.visible = true;

    const pts = generatePoints(type, base, dest);
    if (pts.length < 2 || isNaN(pts[0].x)) return; // TODO: Find out why this happens

    const curve = new CatmullRomCurve3(pts);

    ref.current.geometry.dispose();
    ref.current.geometry = new TubeGeometry(curve, 64, radius ?? 0.07, 50, false);
    const { currDistance, trueDistance } = getDistancesLazy(baseName, destName, type, citiesRef);
    const delta = currDistance - trueDistance;
    const color = getColor(delta);
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
  const hoveredCity = useStore(state => state.hoveredCity);
  const clearHoverPositions = useStore(state => state.clearHoverPositions);
  useEffect(() =>
    clearHoverPositions() // TODO: Change this
  );
  if (nCities !== nRenderedCities || hoveredCity === null) return null;
  const curves = [];
  for (const cityName of Object.keys(citiesRef.current) as CityName[]) {
    if (cityName === hoveredCity.name) continue;
    const destInfo: CityInfo = { mesh: citiesRef.current[cityName] as Mesh, name: cityName };
    curves.push(
      <Curve
        baseInfo={hoveredCity}
        destInfo={destInfo}
        key={cityName}
        radius={radius}
      />
    )
  }

  return curves;
}

export function AllCurves({ radius }: { radius?: number }) {
  const citiesRef = useStore(state => state.citiesRef);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const nCities = useStore(state => state.nCities);
  if (nCities !== nRenderedCities) return null;

  const cities = Object.keys(citiesRef.current) as CityName[];

  const curves = [];
  for (let i = 0; i < cities.length; i++) {
    for (let j = 0; j < i; j++) {
      const baseName = cities[i];
      const destName = cities[j];
      const baseInfo: CityInfo = { name: baseName, mesh: citiesRef.current[baseName] as Mesh };
      const destInfo: CityInfo = { name: destName, mesh: citiesRef.current[destName] as Mesh };

      curves.push(
        <Curve
          baseInfo={baseInfo}
          destInfo={destInfo}
          key={baseName + destName}
          radius={radius}
        />

      )
    }
  }
  return curves;
}
