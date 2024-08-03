import { ThreeEvent, useFrame } from "@react-three/fiber";
import { MutableRefObject, useEffect, useRef } from "react";
import { Mesh, Sprite } from "three";
import { CityName, truePositions } from "../coordinates";
import { polarToCartesian, sca, ObjectType, SPHERE_RADIUS, CIRCLE_RADIUS } from "../utils";
import { useStore, AnimationStatus } from "../state";
import { useAnimation } from "../animation";
import { TextSprite } from "./TextSprite";

export function Cities({ type }: { type: ObjectType }) {
  const animations = useStore(state => state.animations);
  const getTruePositions = useStore(state => state.getTruePositions);
  return (
    Object.entries(Object.keys(getTruePositions()))
      .map(([, cityName]) =>
        <City cityName={cityName as CityName} key={cityName} animation={animations[cityName as CityName] ?? null} type={type} />)
  );
}


function City({ cityName, animation, type }: { cityName: CityName, animation: AnimationStatus, type: ObjectType }) {
  const meshRef = useRef<Mesh>(null!);
  const spriteRef = useRef<Sprite>(null!);

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

  const radius = type === 'sphere' ? 0.2 : 0.3;

  useAnimation(type, cityName, meshRef, animation);
  useSetupPosition(type, cityName, meshRef, spriteRef);

  useFrame(() => {
    const pos = meshRef.current.position;
    if (pos.length() > CIRCLE_RADIUS) {
      pos.multiplyScalar((CIRCLE_RADIUS - 1) / pos.length());
    }
  })

  const onHover = (event: ThreeEvent<PointerEvent>) => {
    if (
      event.intersections.find(intersection => intersection.object.uuid === meshRef.current.uuid) &&
      cityName !== hoveredCityRef.current?.name &&
      isDragging === false
    ) {
      updateHoveredCity(cityName);
    }
  };

  const spriteArguments = {
    fontsize: 30,
    borderColor: { r: 225, g: 0, b: 0, a: 1.0 },
    backgroundColor: { r: 225, g: 140, b: 0, a: 0.9 }
  };

  const capitalized = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}
      onPointerMove={onHover}
      onPointerDown={() => {
        updateIsDragging(true);
        if (isPicking) {
          updateContextMenu({ ...contextMenu, anchor: cityName });
          updateIsPicking(false);
          updateAnimationState('global');
          updateHoveredCity(cityName);
        }
      }}
      onPointerLeave={() => {
        if (isDragging) return;
        updateHoveredCity(null);
      }}
      onContextMenu={(ev) => {
        updateMenuInfo({ cityName, mousePosition: [ev.nativeEvent.clientX, ev.nativeEvent.clientY], anchor: null, visible: true });
        ev.nativeEvent.preventDefault();
        ev.stopPropagation();
      }}
    >
      <sphereGeometry args={[radius]} />
      <meshBasicMaterial color={"red"} />
      <TextSprite message={capitalized} parameters={spriteArguments} ref={spriteRef} />
    </mesh >
  )
}

function useSetupPosition(type: ObjectType, cityName: CityName, meshRef: MutableRefObject<Mesh>, spriteRef: MutableRefObject<Sprite>) {
  const citiesRef = useStore(state => state.citiesRef);
  const updateCities = useStore(state => state.updateCities);
  useEffect(() => {
    if (citiesRef.current[cityName] !== undefined) {
      meshRef.current.position.copy(citiesRef.current[cityName].position);
    } else {
      const { lat, lon } = truePositions[cityName];
      if (type === 'sphere') {
        const pos = polarToCartesian(lat + sca(), lon + sca(), SPHERE_RADIUS);
        meshRef.current.position.copy(pos);
      } else {
        meshRef.current.position.set(lat / 3 + sca(), 0, lon / 3 + sca());
      }
      spriteRef.current.position.copy(meshRef.current.position).multiplyScalar(0.08);
    }
    updateCities(cityName, meshRef.current);

  }, [type, citiesRef, meshRef, updateCities, cityName, spriteRef]);
}

