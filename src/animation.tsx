import { MutableRefObject, useEffect, useRef } from "react";
import { Mesh, Vector3 } from "three";
import { CityName } from "./coordinates";
import { ObjectType, slerp, SPHERE_RADIUS } from "./utils";
import { AnimationStatus, RenderContextState, useRenderContext, useUpdateContext } from "./state";
import { useFrame } from "@react-three/fiber";
import { getFinalPositionPlane, getPositionMDS } from "./solvers/planar";
import { getFinalPositionSphere } from "./solvers/spherical";

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

export function useAnimation(type: ObjectType, cityName: CityName, meshRef: MutableRefObject<Mesh>, animation: AnimationStatus) {
  const animationData = useRef<AnimationData | null>(null); // NOTE: Null means we should not be animating
  const animationTime = 2;
  const { updateAnimationState, updateCurrDistances } = useUpdateContext();
  const { citiesRef, hoveredCityRef } = useRenderContext();
  useEffect(() => {
    if (animation !== null) {
      const source = new Vector3().copy(meshRef.current.position);
      let dest;
      if (type === 'sphere') {
        dest = getFinalPositionSphere(animation, cityName, citiesRef, hoveredCityRef);
      } else {
        dest = getFinalPositionPlane(animation, cityName, citiesRef, hoveredCityRef, ['kiev', 'florence'])
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
  }, [animation, meshRef, cityName, type, citiesRef, hoveredCityRef, updateAnimationState]);

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
