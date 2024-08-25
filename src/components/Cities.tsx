import { ThreeEvent, useFrame } from "@react-three/fiber";
import { forwardRef, MutableRefObject, useEffect, useRef, useState } from "react";
import { Material, Mesh, MeshBasicMaterial, Vector2, Vector3 } from "three";
import { CityName, positions } from "../coordinates";
import { polarToCartesian, sca, ObjectType, SPHERE_RADIUS, CIRCLE_RADIUS, SCALE_FACTOR, GREEN } from "../utils";
import { useStore } from "../state";
import { startAnimation, useAnimation } from "../animation";
import { getDistancesLazy } from "../distances";
import { getPositionFromCenters } from "../solvers/planar";

export type MouseEventHandler = (event: ThreeEvent<MouseEvent>) => void;
export type CityProps = {
  onPointerMove: MouseEventHandler;
  onPointerDown: MouseEventHandler;
  onPointerLeave: MouseEventHandler;
  onContextMenu: MouseEventHandler;
};

export type CityMesh = typeof DefaultCityMesh;

export function Cities({ CityMesh }: { CityMesh?: CityMesh }) {
  if (CityMesh === undefined) CityMesh = DefaultCityMesh;
  const truePositions = useStore(state => state.truePositions);
  return (Object.keys(truePositions)).map((cityName) =>
    <CityWrapper cityName={cityName as CityName} key={cityName} CityMesh={CityMesh} />);
}

function CityWrapper({ cityName, CityMesh }: { cityName: CityName, CityMesh: CityMesh }) {
  const meshRef = useRef<Mesh>(null!);
  const props = useCreateHandlers(cityName, meshRef);
  const type = useStore(state => state.objectType);
  useAnimation(type, cityName, meshRef);
  useSetupPosition(type, cityName, meshRef);
  useSnapping(type, cityName, meshRef);

  useFrame(() => {
    const pos = meshRef.current.position;
    if (pos.length() > CIRCLE_RADIUS) {
      pos.multiplyScalar((CIRCLE_RADIUS - 1) / pos.length());
    }
  })


  return (<CityMesh {...props} ref={meshRef} />);
}


function useSetupPosition(type: ObjectType, cityName: CityName, meshRef: MutableRefObject<Mesh>) {
  const citiesRef = useStore(state => state.citiesRef);
  const updateCities = useStore(state => state.updateCities);
  useEffect(() => {
    const mesh = meshRef.current;
    if (citiesRef.current[cityName] !== undefined) {
      meshRef.current.position.copy(citiesRef.current[cityName].position);
    } else {
      const { lat, lon } = positions[cityName];
      if (type === 'sphere') {
        const pos = polarToCartesian(lat + sca(), lon + sca(), SPHERE_RADIUS);
        meshRef.current.position.copy(pos);
      } else {
        meshRef.current.position.set(lat / 3 + sca(), 0, lon / 3 + sca());
      }
    }
    updateCities(cityName, meshRef.current);
    return () => updateCities(cityName, mesh, true);
  }, [type, citiesRef, meshRef, updateCities, cityName]);
}


function useCreateHandlers(cityName: CityName, meshRef: MutableRefObject<Mesh>): CityProps {
  const hoveredCity = useStore(state => state.hoveredCity);
  const isDragging = useStore(state => state.isDragging);
  const updateHoveredCity = useStore(state => state.updateHoveredCity);
  const updateIsDragging = useStore(state => state.updateIsDragging);
  const updateMenuInfo = useStore(state => state.updateContextMenu);
  const isPicking = useStore(state => state.isPicking);
  const updateIsPicking = useStore(state => state.updateIsPicking);
  const contextMenu = useStore(state => state.contextMenu);
  const updateContextMenu = useStore(state => state.updateContextMenu);
  const updateAnimationState = useStore(state => state.updateAnimationState);
  const updateControls = useStore(state => state.updateControlsEnabled);
  const updateMoveLock = useStore(state => state.updateMoveLock);
  const onPointerDown = () => {
    updateIsDragging(true);
    updateControls(false);
    updateMoveLock(false);
    if (isPicking) {
      if (contextMenu.cityName === cityName) return;
      updateContextMenu({ ...contextMenu, anchor: cityName });
      updateIsPicking(false);
      startAnimation(updateAnimationState, updateHoveredCity, 'global');
    }
  };
  const onPointerLeave: MouseEventHandler = () => {
    // if (isDragging) return;
    // updateHoveredCity(null);
  };

  const onContextMenu: MouseEventHandler = (ev) => {
    ev.nativeEvent.preventDefault();
    updateMenuInfo({ cityName, mousePosition: [ev.nativeEvent.clientX, ev.nativeEvent.clientY], anchor: null, visible: true });
  };

  const onPointerMove: MouseEventHandler = (event) => {
    if (
      event.intersections.find(intersection => intersection.object.uuid === meshRef.current.uuid) &&
      cityName !== hoveredCity?.name &&
      isDragging === false
    ) {
      updateHoveredCity(cityName);
    }
  };
  return { onPointerMove, onPointerDown, onPointerLeave, onContextMenu };
}

function useSnapping(type: ObjectType, cityName: CityName, meshRef: MutableRefObject<Mesh>) {
  const hoveredCity = useStore(state => state.hoveredCity);
  const truePositions = useStore(state => state.truePositions);
  const citiesRef = useStore(state => state.citiesRef);
  const moveHoveredCity = useStore(state => state.moveHoveredCity);
  const updateControls = useStore(state => state.updateControlsEnabled);
  const isDragging = useStore(state => state.isDragging);
  const updateIsDragging = useStore(state => state.updateIsDragging);
  const [fixTarget, setFixTarget] = useState<CityName | null>(null);

  const THRESH_CLOSE = 200;
  const THRESH_FAR = 500;
  const THRESH_CLOSE_GLOBE = .5;
  useFrame(() => {
    if (
      hoveredCity?.name !== cityName || !isDragging ||
      truePositions[cityName] === undefined ||
      citiesRef.current[cityName] === undefined
    ) return;
    if (type === 'sphere') {
      const truePosition = polarToCartesian(truePositions[cityName].lat, truePositions[cityName].lon, SPHERE_RADIUS);
      const currPosition = citiesRef.current[cityName].position;
      if (currPosition.distanceTo(truePosition) < THRESH_CLOSE_GLOBE) {
        setFixTarget(cityName);
        moveHoveredCity(truePosition.x, truePosition.y, truePosition.z, true);
        updateIsDragging(false);
        updateControls(false);
        (meshRef.current.material as Material).dispose();
        const newMaterial = new MeshBasicMaterial({ color: GREEN });
        meshRef.current.material = newMaterial;
      }
      return;
    }
    const otherCities = Object.keys(truePositions).filter(key => key !== cityName) as CityName[];
    for (const other of otherCities) {
      if (citiesRef.current[other] === undefined) continue;
      const { trueDistance, currDistance } = getDistancesLazy(cityName, other, type, citiesRef);
      const delta = Math.abs(trueDistance - currDistance);
      if (fixTarget === other) {
        if (delta > THRESH_FAR) {
          setFixTarget(null);
        }
        return;
      }
      if (delta < THRESH_CLOSE) {
        for (const other1 of otherCities) {
          if (other1 === other || citiesRef.current[other1] === undefined) continue;
          const newDistances = getDistancesLazy(cityName, other1, type, citiesRef);
          const trueDistance1 = newDistances.trueDistance;
          const currDistance1 = newDistances.currDistance;
          const delta1 = Math.abs(trueDistance1 - currDistance1);
          if (delta1 < THRESH_CLOSE * 4) {
            const targetPosition = citiesRef.current[cityName].position;
            const position = citiesRef.current[other].position;
            const position1 = citiesRef.current[other1].position;
            const c1 = new Vector2(position.x, position.z);
            const c2 = new Vector2(position1.x, position1.z);
            const r1 = trueDistance / SCALE_FACTOR;
            const r2 = trueDistance1 / SCALE_FACTOR;

            const { sol1, sol2 } = getPositionFromCenters(c1, c2, r1, r2);

            const s1 = new Vector3(sol1.x, 0, sol1.y);
            const s2 = new Vector3(sol2.x, 0, sol2.y);

            const { x, y, z } = targetPosition.distanceTo(s1) < targetPosition.distanceTo(s2) ? s1 : s2;

            moveHoveredCity(x, y, z, true);
            setFixTarget(other);
            updateControls(false);
            updateIsDragging(false);
            return;
          }
        }

        const dest = citiesRef.current[cityName].position;
        const base = citiesRef.current[other].position;
        const pos = new Vector3().lerpVectors(base, dest, trueDistance / currDistance);
        const { x, y, z } = pos;
        moveHoveredCity(x, y, z, true);
        setFixTarget(other);
        updateControls(false);
        updateIsDragging(false);
        return;
      }
    }
  })
}

export const DefaultCityMesh = forwardRef<Mesh, CityProps>((props, meshRef) => {
  const radius = 0.5;
  return (
    <mesh ref={meshRef} position={[0, 0, 0]} {...props} >
      <sphereGeometry args={[radius]} />
      <meshBasicMaterial color={"red"} />
    </mesh >);
})
