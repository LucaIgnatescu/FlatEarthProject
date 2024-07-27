import { ThreeEvent } from "@react-three/fiber";
import { MutableRefObject, useEffect, useRef } from "react";
import { Mesh } from "three";
import { CityName, truePositions } from "../coordinates";
import { polarToCartesian, sca, ObjectType, SPHERE_RADIUS } from "../utils";
import { AnimationStatus, useAnimationContext, useRenderContext, useUpdateContext } from "../state";
import { useAnimation } from "../animation";
import { TextSprite } from "./shared";

export function Cities({ type }: { type: ObjectType }) {
  const { animations } = useAnimationContext();
  return (
    Object.entries(Object.keys(truePositions))
      .map(([, cityName]) =>
        <City cityName={cityName as CityName} key={cityName} animation={animations[cityName as CityName] ?? null} type={type} />)
  );
}


function City({ cityName, animation, type }: { cityName: CityName, animation: AnimationStatus, type: ObjectType }) {
  const radius = 0.2;
  const meshRef = useRef<Mesh>(null!);
  const { hoveredCityRef, isDragging } = useRenderContext();
  const { updateHoveredCity, setIsDragging } = useUpdateContext();

  useAnimation(type, cityName, meshRef, animation);
  useSetupPosition(type, cityName, meshRef);

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
      onPointerDown={() => setIsDragging(true)}
      onPointerLeave={() => {
        if (isDragging) return;
        updateHoveredCity(null);
      }}
    >
      <sphereGeometry args={[radius]} />
      <meshBasicMaterial color={"red"} />
      <TextSprite message={capitalized} parameters={spriteArguments} />
    </mesh >
  )
}

function useSetupPosition(type: ObjectType, cityName: CityName, meshRef: MutableRefObject<Mesh>) {
  const { citiesRef } = useRenderContext();
  const { updateCities } = useUpdateContext();
  useEffect(() => {
    if (citiesRef.current[cityName] !== undefined) {
      meshRef.current.position.copy(citiesRef.current[cityName].position);
    }
    updateCities(cityName, meshRef.current);
  }, [citiesRef, meshRef, updateCities, cityName]);

  useEffect(() => {
    const { lat, lon } = truePositions[cityName];
    if (type === 'sphere') {
      const pos = polarToCartesian(lat + sca(), lon + sca(), SPHERE_RADIUS); // TODO: scatter
      meshRef.current.position.copy(pos);
    } else {
      meshRef.current.position.set(lat / 3 + sca(), 0, lon / 3 + sca());
    }
  }, [type, cityName, meshRef]);
}

