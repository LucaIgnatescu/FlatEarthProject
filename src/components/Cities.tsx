import { ThreeEvent, useFrame } from "@react-three/fiber";
import { forwardRef, MutableRefObject, useEffect, useRef, useState } from "react";
import { Mesh, Vector3 } from "three";
import { CityName, positions } from "../coordinates";
import { polarToCartesian, sca, ObjectType, SPHERE_RADIUS, CIRCLE_RADIUS, slerp } from "../utils";
import { useStore } from "../state";
import { startAnimation, useAnimation } from "../animation";
import { getDistances } from "../distances";

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
  useSnapping(type, cityName);

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
  const hoveredCityRef = useStore(state => state.hoveredCityRef);
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
      cityName !== hoveredCityRef.current?.name &&
      isDragging === false
    ) {
      updateHoveredCity(cityName);
    }
  };
  return { onPointerMove, onPointerDown, onPointerLeave, onContextMenu };
}

function useSnapping(type: ObjectType, cityName: CityName) {
  const hoveredCityRef = useStore(state => state.hoveredCityRef);
  const truePositions = useStore(state => state.truePositions);
  const citiesRef = useStore(state => state.citiesRef);
  const moveHoveredCity = useStore(state => state.moveHoveredCity);
  const updateControls = useStore(state => state.updateControlsEnabled);
  const isDragging = useStore(state => state.isDragging);
  const [fixTarget, setFixTarget] = useState<CityName | null>(null);

  const THRESH_CLOSE = 200;
  const THRESH_FAR = 500;
  useFrame(() => {
    if (hoveredCityRef.current?.name !== cityName || !isDragging) {
      return
    }
    const otherCities = Object.keys(truePositions).filter(key => key !== cityName) as CityName[];
    for (const other of otherCities) {
      if (
        citiesRef.current[cityName] === undefined ||
        citiesRef.current[other] === undefined
      ) continue;
      const { trueDistance, currDistance } = getDistances(cityName, other, type, citiesRef);
      const delta = Math.abs(trueDistance - currDistance);
      if (fixTarget === other) {
        if (delta > THRESH_FAR) {
          setFixTarget(null);
        }
        return;
      }
      if (delta < THRESH_CLOSE) {
        const dest = citiesRef.current[cityName].position;
        const base = citiesRef.current[other].position;
        const pos = (type === 'plane') ?
          new Vector3().lerpVectors(base, dest, trueDistance / currDistance) :
          slerp(base, dest, trueDistance / currDistance);
        const { x, y, z } = pos;
        moveHoveredCity(x, y, z, true);
        setFixTarget(other);
        updateControls(false);
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
