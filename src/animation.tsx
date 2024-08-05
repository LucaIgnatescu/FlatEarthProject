import { MutableRefObject, useEffect, useRef } from "react";
import { Mesh, Vector3 } from "three";
import { CityName } from "./coordinates";
import { ObjectType, slerp, SPHERE_RADIUS } from "./utils";
import { useFrame } from "@react-three/fiber";
import { useStore, AnimationType, Store } from "./state";
import { getFinalPositionPlane } from "./solvers/planar";
import { getFinalPositionSphere } from "./solvers/spherical";
import { Vector } from "three/examples/jsm/Addons.js";

type AnimationData = {
  source: Vector3,
  dest: Vector3,
  elapsed: number
}

function getIntermediatePoint(source: Vector3, dest: Vector3, t: number, type: ObjectType) {
  if (type === 'sphere') {
    const sourceCopy = new Vector3().copy(source).normalize();
    const destCopy = new Vector3().copy(dest).normalize();
    const pos = slerp(sourceCopy, destCopy, t).multiplyScalar(SPHERE_RADIUS);
    return pos;
  }
  return new Vector3().lerpVectors(source, dest, t);
}

// Need to be able to:
// AnimationObject -> interface
// source
// dest 
// elapsed
// .getFinalPosition()
// .getIntermediatePoint()
// .addTime()
//
// Kinds of AnimationObjects -> different logic for each
// GlobalAnimationObject
// NullAnimationObject
// MovingAnimationObject
//
// useAnimationObject() hook that creates the needed Animation Object based on AnimationType and ObjectType
//
type AnimationInterface = {
  getIntermediatepoint: () => Vector3;
  addTime: () => void;
  getFinalPosition: () => Vector3;
  [key: string]: unknown;
}

function useAnimationObject(type: ObjectType, animation: AnimationType): AnimationInterface {
  // https://refactoring.guru/design-patterns/factory-method  
}

export function useAnimation(type: ObjectType, cityName: CityName, meshRef: MutableRefObject<Mesh>) {
  const animationData = useRef<AnimationData | null>(null); // NOTE: Null means we should not be animating
  const animationTime = 2;
  const updateAnimationState = useStore(state => state.updateAnimationState);
  const updateCurrDistances = useStore(state => state.updateCurrDistances);
  const citiesRef = useStore(state => state.citiesRef);
  const hoveredCityRef = useStore(state => state.hoveredCityRef);
  const contextMenu = useStore(state => state.contextMenu);
  const animations = useStore(state => state.animations);
  const getTruePositions = useStore(state => state.getTruePositions);
  const animation = animations[cityName] ?? null;

  useEffect(() => { // FIX: Weird interactions if i rightclick when animating
    if (animation !== null) {
      const source = new Vector3().copy(meshRef.current.position);
      let dest;
      if (type === 'sphere') {
        dest = getFinalPositionSphere(animation, cityName, citiesRef, hoveredCityRef);
      } else {
        dest = getFinalPositionPlane(animation, cityName, citiesRef, hoveredCityRef, getTruePositions, [contextMenu.cityName, contextMenu.anchor])
      }
      if (source.distanceTo(dest) > 0.01) {
        animationData.current = {
          source,
          dest,
          elapsed: 0
        };
      } else {
        updateAnimationState(null, cityName);
      }
    }
    else {
      animationData.current = null;
    }
  }, [animation, meshRef, cityName, type, contextMenu, getTruePositions, citiesRef, hoveredCityRef, updateAnimationState]);

  useFrame((_, delta) => {
    if (animationData.current === null) return;
    if (animationData.current.elapsed > animationTime) {
      meshRef.current.position.copy(animationData.current.dest);
      animationData.current = null;
      updateAnimationState(null);
      updateCurrDistances();
      return
    }
    const pos = getIntermediatePoint(animationData.current.source, animationData.current.dest, animationData.current.elapsed / animationTime, type);
    meshRef.current.position.copy(pos);

    animationData.current.elapsed += delta;
    updateCurrDistances();
  });
}

export function startAnimation(
  updateAnimationState: Store['updateAnimationState'],
  updateHoveredCity: Store['updateHoveredCity'],
  animation: AnimationType,
  cityName?: CityName,
) {
  if (cityName) updateHoveredCity(cityName);
  updateAnimationState(animation, cityName);
}

