import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { forwardRef, MutableRefObject, useEffect, useRef, useState } from "react";
import { Mesh, MeshBasicMaterial, Vector2, Vector3 } from "three";
import { CityName, positions } from "../coordinates";
import { polarToCartesian, sca, ObjectType, SPHERE_RADIUS, CIRCLE_RADIUS, SCALE_FACTOR } from "../utils";
import { useStore } from "../state";
import { useAnimation } from "../animation";
import { calculateDistancesPlane, getDistancesLazy } from "../distances";
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
  const hoveredCity = useStore(state => state.hoveredCity);
  const isDragging = useStore(state => state.isDragging);
  useAnimation(type, cityName, meshRef);
  useSetupPosition(type, cityName, meshRef);
  useSnapping(type, cityName);

  useFrame(() => {
    const pos = meshRef.current.position;
    if (pos.length() > CIRCLE_RADIUS) {
      pos.multiplyScalar((CIRCLE_RADIUS - 1) / pos.length());
    }
  })

  useEffect(() => {
    const material = meshRef.current.material as MeshBasicMaterial;
    material.color.set(cityName === hoveredCity?.name && isDragging ? 0xffaaaa : 0xff0000)
  }, [hoveredCity, cityName, isDragging]);


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
  const updateControls = useStore(state => state.updateControlsEnabled);
  const updateMoveLock = useStore(state => state.updateMoveLock);
  const onPointerDown: MouseEventHandler = (ev) => {
    const RIGHT_CLICK = 2;
    if (ev.button === RIGHT_CLICK) {
      return;
    }
    updateIsDragging(true);
    updateControls(false);
    updateMoveLock(false);
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

function useSnapping(type: ObjectType, cityName: CityName) {
  const hoveredCity = useStore(state => state.hoveredCity);
  const truePositions = useStore(state => state.truePositions);
  const citiesRef = useStore(state => state.citiesRef);
  const moveHoveredCity = useStore(state => state.moveHoveredCity);
  const isDragging = useStore(state => state.isDragging);
  const updateMoveLock = useStore(state => state.updateMoveLock);
  const pointer = useThree(state => state.pointer);
  const camera = useThree(state => state.camera);
  const raycaster = useThree(state => state.raycaster);
  const scene = useThree(state => state.scene);
  const earthUUID = useStore(state => state.earthUUID);
  const [fixTarget, setFixTarget] = useState<CityName | null>(null);
  const route = useStore(state => state.route);

  const THRESH_CLOSE = route === 'plane' ? 100 : 200;
  const THRESH_FAR = route === 'plane' ? 200 : 500;
  const THRESH_CLOSE_GLOBE = .5;
  const THRESH_FAR_GLOBE = 1.2;

  function computeIntersection() {
    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(scene.children);
    const earthIntersection = intersections.find(
      (intersection) => intersection.object.uuid === earthUUID
    );
    if (earthIntersection === undefined) return null
    let { x, y, z } = earthIntersection.point;
    x = +x.toFixed(3);
    y = +y.toFixed(3);
    z = +z.toFixed(3);
    return new Vector3(x, y, z);
  }

  useFrame(() => {
    if (
      hoveredCity?.name !== cityName || !isDragging ||
      truePositions[cityName] === undefined ||
      citiesRef.current[cityName] === undefined
    ) return;

    if (type === 'sphere') {
      const truePosition = polarToCartesian(truePositions[cityName].lat, truePositions[cityName].lon, SPHERE_RADIUS);
      const intersection = computeIntersection();
      if (intersection === null) {
        return;
      }

      const delta = intersection.distanceTo(truePosition);

      if (delta < THRESH_CLOSE_GLOBE) {
        setFixTarget(cityName);
        moveHoveredCity(truePosition.x, truePosition.y, truePosition.z, true);
      }
      if (delta > THRESH_FAR_GLOBE)
        updateMoveLock(false);
      return;
    }

    const otherCities = Object.keys(truePositions).filter(key => key !== cityName);
    for (const other of otherCities as CityName[]) {
      if (citiesRef.current[other] === undefined) continue;
      const { trueDistance } = getDistancesLazy(cityName, other, type, citiesRef);
      const intersection = computeIntersection();

      if (intersection === null) {
        return;
      }

      const currDistance = calculateDistancesPlane(
        intersection,
        citiesRef.current[other].position
      );
      const delta = Math.abs(trueDistance - currDistance);
      if (delta === 0) {
        setFixTarget(other);
        break;
      }
      if (fixTarget === other) {
        if (delta > THRESH_FAR) {
          setFixTarget(null);
          updateMoveLock(false);
        }
        return;
      }

      if (delta < THRESH_CLOSE) {
        for (const other1 of otherCities as CityName[]) {
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
            return;
          }
        }

        const dest = citiesRef.current[cityName].position;
        const base = citiesRef.current[other].position;
        const pos = new Vector3().lerpVectors(base, dest, trueDistance / currDistance);
        const { x, y, z } = pos;
        moveHoveredCity(x, y, z, true);
        setFixTarget(other);
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
