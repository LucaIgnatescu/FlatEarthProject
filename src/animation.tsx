import { MutableRefObject, useEffect, useRef } from "react";
import { Mesh, Vector3 } from "three";
import { CityName } from "./coordinates";
import { ObjectType, slerp, SPHERE_RADIUS } from "./utils";
import { useFrame } from "@react-three/fiber";
import { useStore, AnimationType, Store, Positions, ContextMenu } from "./state";
import { getFinalPositionPlane } from "./solvers/planar";
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

type FinalPositionParams = {
  animation: AnimationType,
  type: ObjectType,
  cityName: CityName,
  citiesRef: Store['citiesRef'],
  hoveredCityRef: Store['hoveredCityRef']
  positions: Positions,
  contextMenu: ContextMenu
}

// Unfortunately, these computations requre a lot of state data
export function getFinalPosition({ type, animation, cityName, citiesRef, hoveredCityRef, contextMenu, positions }: FinalPositionParams) {
  if (type === 'sphere') {
    return getFinalPositionSphere(animation, cityName, citiesRef, hoveredCityRef);
  }
  return getFinalPositionPlane(animation, cityName, citiesRef, hoveredCityRef, positions, [contextMenu.cityName, contextMenu.anchor])
}

export function useAnimation(type: ObjectType, cityName: CityName, meshRef: MutableRefObject<Mesh>) {
  const ANIMATION_TIME = 5;

  const updateAnimationState = useStore(state => state.updateAnimationState);
  const citiesRef = useStore(state => state.citiesRef);
  const hoveredCityRef = useStore(state => state.hoveredCityRef);
  const contextMenu = useStore(state => state.contextMenu);
  const animations = useStore(state => state.animations);
  const truePositions = useStore(state => state.truePositions);
  const isAnimating = useStore(state => state.isAnimating);
  const updateIsAnimating = useStore(state => state.updateIsAnimating);
  const updateCurrentPositions = useStore(state => state.updateCurrentPositions);

  const animation = animations[cityName] ?? null;
  const animationData = useRef<AnimationData | null>(null);

  useEffect(() => {
    if (isAnimating || animation === null) return;
    if (citiesRef.current[cityName] === undefined) return;

    const source = citiesRef.current[cityName].position.clone();
    let dest = getFinalPosition({ animation, type, cityName, citiesRef, hoveredCityRef, contextMenu, positions: truePositions })
    const elapsed = 0;
    if (source.distanceTo(dest) < 0.01) dest = source.clone();

    animationData.current = { source, dest, elapsed };
    updateIsAnimating(true);

  }, [updateIsAnimating, citiesRef, cityName, isAnimating, animation, type, contextMenu, hoveredCityRef, truePositions]);


  useFrame((_, delta) => {
    if (!isAnimating || animationData.current === null) return;
    if (animationData.current.elapsed > ANIMATION_TIME) {
      meshRef.current.position.copy(animationData.current.dest);
      animationData.current = null;
      updateIsAnimating(false);
      updateAnimationState(null, cityName);
      updateCurrentPositions();
      return
    }
    const pos = getIntermediatePoint(animationData.current.source, animationData.current.dest, animationData.current.elapsed / ANIMATION_TIME, type);
    meshRef.current.position.copy(pos);
    animationData.current.elapsed += delta;
    updateCurrentPositions();
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

