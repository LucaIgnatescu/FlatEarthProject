import { ThreeEvent, useFrame } from "@react-three/fiber";
import { forwardRef, MutableRefObject, useEffect, useRef } from "react";
import { Mesh } from "three";
import { CityName, truePositions } from "../coordinates";
import { polarToCartesian, sca, ObjectType, SPHERE_RADIUS, CIRCLE_RADIUS } from "../utils";
import { useStore } from "../state";
import { startAnimation, useAnimation } from "../animation";

export type MouseEventHandler = (event: ThreeEvent<MouseEvent>) => void;
export type CityProps = {
  onPointerMove: MouseEventHandler;
  onPointerDown: MouseEventHandler;
  onPointerLeave: MouseEventHandler;
  onContextMenu: MouseEventHandler;
};

export type CityMesh = typeof DefaultCityMesh;

export function Cities({ type, CityMesh }: { type: ObjectType, CityMesh?: CityMesh }) {
  if (CityMesh === undefined) CityMesh = DefaultCityMesh;
  const getTruePositions = useStore(state => state.getTruePositions);
  return (
    Object.entries(Object.keys(getTruePositions()))
      .map(([, cityName]) =>
        <CityWrapper cityName={cityName as CityName} key={cityName} type={type} CityMesh={CityMesh} />)
  );
}

function CityWrapper({ cityName, type, CityMesh }: { cityName: CityName, type: ObjectType, CityMesh: CityMesh }) {
  const meshRef = useRef<Mesh>(null!);
  const props = useCreateHandlers(cityName, meshRef);

  useAnimation(type, cityName, meshRef);
  useSetupPosition(type, cityName, meshRef);

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
    if (citiesRef.current[cityName] !== undefined) {
      meshRef.current?.position.copy(citiesRef.current[cityName].position);
    } else {
      const { lat, lon } = truePositions[cityName];
      if (type === 'sphere') {
        const pos = polarToCartesian(lat + sca(), lon + sca(), SPHERE_RADIUS);
        meshRef.current.position.copy(pos);
      } else {
        meshRef.current.position.set(lat / 3 + sca(), 0, lon / 3 + sca());
      }
    }
    updateCities(cityName, meshRef.current);
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

  const onPointerDown = () => {
    updateIsDragging(true);
    if (isPicking) {
      updateContextMenu({ ...contextMenu, anchor: cityName });
      updateIsPicking(false);
      startAnimation(updateAnimationState, updateHoveredCity, 'global');
    }
  };
  const onPointerLeave: MouseEventHandler = () => {
    if (isDragging) return;
    updateHoveredCity(null);
  };

  const onContextMenu: MouseEventHandler = (ev) => {
    updateMenuInfo({ cityName, mousePosition: [ev.nativeEvent.clientX, ev.nativeEvent.clientY], anchor: null, visible: true });
    ev.nativeEvent.preventDefault();
    ev.stopPropagation();
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

export const DefaultCityMesh = forwardRef<Mesh, CityProps>((props, meshRef) => {
  const radius = 0.5;
  return (
    <mesh ref={meshRef} position={[0, 0, 0]} {...props} >
      <sphereGeometry args={[radius]} />
      <meshBasicMaterial color={"red"} />
    </mesh >);
})
