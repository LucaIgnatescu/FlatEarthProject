import { MutableRefObject, useEffect, useRef } from "react";
import { Mesh, Vector3 } from "three";
import { CityName, truePositions } from "./coordinates";
import { ComponentType, polarToCartesian, slerp, SPHERE_RADIUS } from "./utils";
import { AnimationStatus, useUpdateContext } from "./state";
import { useFrame } from "@react-three/fiber";

type AnimationData = {
  source: Vector3,
  dest: Vector3,
  elapsed: number
}

function getFinalPosition(type: ComponentType, cityName: CityName) {
  if (type === 'Sphere') return polarToCartesian(truePositions[cityName].lat, truePositions[cityName].lon, SPHERE_RADIUS);
  return new Vector3(0, 0, 0);
}

function getIntermediatePoint(source: Vector3, dest: Vector3, t: number, type: ComponentType) {
  if (type === 'Sphere') {
    const sourceCopy = new Vector3().copy(source).normalize();
    const destCopy = new Vector3().copy(dest).normalize();
    return slerp(sourceCopy, destCopy, t).multiplyScalar(SPHERE_RADIUS);
  }
  return new Vector3().lerpVectors(source, dest, t);
}

export function useAnimation(type: ComponentType, cityName: CityName, meshRef: MutableRefObject<Mesh>, animation: AnimationStatus) {
  const animationData = useRef<AnimationData | null>(null); // NOTE: Null means we should not be animating
  const animationTime = 2;
  const { updateAnimationState, updateCurrDistances } = useUpdateContext();
  useEffect(() => {
    if (animation === 'global') {
      const source = new Vector3().copy(meshRef.current.position);
      const dest = getFinalPosition(type, cityName);
      if (source.distanceTo(dest) > 0.01) {
        animationData.current = {
          source,
          dest,
          elapsed: 0
        };
      }
    } else if (animation === null) {
      animationData.current = null;
    }
  }, [animation, meshRef, cityName, type])

  useFrame((_, delta) => {
    if (animation !== 'global' || animationData.current === null) return;
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
  })
}
