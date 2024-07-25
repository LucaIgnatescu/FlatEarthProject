import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { CatmullRomCurve3, Mesh, TextureLoader, TubeGeometry, Vector3 } from "three";
import { CityName } from "../coordinates";
import { slerp, SphericalPolarDistance, cartesianToPolar } from "../utils";
import { CityTable, ContextProvider, Distances, useRenderContext, useUpdateContext } from "../state";
import { UIWrapper } from "../ui";
import { EARTH_RADIUS, SPHERE_RADIUS } from "../utils";
import { Stars } from "../components/shared";
import { Cities } from "../components/Cities";

export default function Globe() {
  const calculateDistances = (cities: CityTable) => { // FIX:
    const currDistaces: Distances = {};
    for (const [cityName1, cityMesh1] of Object.entries(cities) as [CityName, Mesh][]) {
      for (const [cityName2, cityMesh2] of Object.entries(cities) as [CityName, Mesh][]) {
        const p1 = cartesianToPolar(cityMesh1.position, SPHERE_RADIUS);
        const p2 = cartesianToPolar(cityMesh2.position, SPHERE_RADIUS);
        const distance = SphericalPolarDistance(p1, p2, EARTH_RADIUS); //compute distances as if on the earth
        if (currDistaces[cityName1] === undefined) currDistaces[cityName1] = {};
        if (currDistaces[cityName2] === undefined) currDistaces[cityName2] = {};
        currDistaces[cityName1][cityName2] = distance;
        currDistaces[cityName2][cityName1] = distance;
      }
    }
    return currDistaces;
  }
  return (
    <ContextProvider calculateDistances={calculateDistances}>
      <Canvas gl={{ antialias: true }} className="bg-black">
        <PerspectiveCamera makeDefault position={[15, 15, 15]} />
        <Controls />
        <Earth />
        <Stars />
        <Cities type="Sphere" />
        <Curves />
      </Canvas>
      <UIWrapper>
      </UIWrapper>
    </ContextProvider>
  );
}


function Controls() {
  const { isDragging } = useRenderContext();
  // return <OrbitControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={!isDragging} />
  return <OrbitControls enabled={!isDragging} enablePan={false} enableDamping dampingFactor={0.075} minDistance={50} maxDistance={200} rotateSpeed={0.5} />
}

function Earth() { // TODO: Better wireframe
  const texture = useLoader(TextureLoader, '../../static/img/globe1.jpg');
  const { isDragging, hoveredCityRef } = useRenderContext();
  const { moveHoveredCity, setIsDragging, } = useUpdateContext();
  const ref = useRef<Mesh>(null!);

  const dragCity = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !hoveredCityRef.current) return;
    const meshes = event.intersections.filter((intersection) => intersection.object instanceof Mesh);
    if (meshes.length === 0) return;
    const earthIntersection = meshes[meshes.length - 1];
    if (earthIntersection === undefined) throw new Error("Didn't intersect earth");
    const { x, y, z } = earthIntersection.point;
    moveHoveredCity(x, y, z);
    event.stopPropagation();
  }
  return (
    <>
      <mesh onPointerUp={() => setIsDragging(false)} onPointerMove={dragCity} ref={ref}>
        <sphereGeometry args={[SPHERE_RADIUS, 50, 50]} />
        <meshBasicMaterial map={texture} />
      </mesh >
    </>
  );
}


/* function City({ cityName, animation }: { cityName: CityName, animation: AnimationStatus }) {
  const radius = 0.2;
  const meshRef = useRef<Mesh>(null!);
  const { hoveredCityRef, isDragging, citiesRef } = useRenderContext();
  const { updateHoveredCity, updateCities, setIsDragging } = useUpdateContext();

  useAnimation({ animation, mesh: meshRef.current, cityName, type: 'Sphere' });

  useEffect(() => {
    if (citiesRef.current[cityName] !== undefined) {
      meshRef.current.position.copy(citiesRef.current[cityName].position);
    }
    updateCities(cityName, meshRef.current);
  });

  useEffect(() => {
    const { lat, lon } = truePositions[cityName];
    const { x, y, z } = polarToCartesian(lat + sca(), lon + sca(), SPHERE_RADIUS); // TODO: scatter
    meshRef.current.position.set(x, y, z);
  }, [cityName]);

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
    <mesh ref={meshRef}
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
} */

// function Cities() {
//   const { animations } = useAnimationContext();
//   return (
//     Object.entries(Object.keys(truePositions))
//       .map(([, cityName]) =>
//         <City cityName={cityName as CityName} key={cityName} animation={animations[cityName as CityName] ?? null} type="Sphere" />)
//   );
// }



function Curve({ dest: destName, isCorrect }: { dest: CityName, isCorrect: boolean }) {
  const ref = useRef<Mesh>(null!);
  const { hoveredCityRef, citiesRef } = useRenderContext();


  useFrame(() => {
    if (hoveredCityRef.current === null) {
      ref.current.visible = false;
      return;
    }
    const base = hoveredCityRef.current.mesh.position;
    ref.current.visible = true;

    const destPos = citiesRef.current[destName]?.position;
    if (destPos === undefined) throw new Error(`City ${destName} does not exist`);

    const pts = [];
    const nSegments = 25;

    const destN = new Vector3().copy(destPos).normalize();
    const baseN = new Vector3().copy(base).normalize();
    for (let i = 0; i <= nSegments; i++) {
      pts.push(slerp(baseN, destN, i / nSegments));
    }
    if (pts.length < 2 || isNaN(pts[0].x)) return; // TODO: FInd out why this happens
    const pts3D = pts.map(q => q.multiplyScalar(SPHERE_RADIUS));
    const curve = new CatmullRomCurve3(pts3D);

    ref.current.geometry.dispose();
    ref.current.geometry = new TubeGeometry(curve, 64, 0.05, 50, false);

  });

  const color = isCorrect ? 0x3acabb : 0xff8400;

  return (
    <>
      <mesh ref={ref}>
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
}

function Curves() {
  const { citiesRef, hoveredCityRef } = useRenderContext();
  // const { currDistances } = useUIContext();
  //
  // const THRESH = 1;
  //
  // if (hoveredCityRef.current === null) return null;

  const cities = citiesRef.current;
  // const hoveredCity = hoveredCityRef.current.name;
  // const realDistances = getRealDistances();
  // const totalCurrent = totalDistance(currDistances);
  // const totalReal = totalDistance(realDistances);

  const curves = [];
  for (const cityName of Object.keys(cities) as CityName[]) {
    if (cities[cityName]?.position === undefined || cityName === hoveredCityRef.current?.name) continue;
    // const d = Math.abs(currDistances[hoveredCity][cityName] / totalCurrent - realDistances[hoveredCity][cityName] / totalReal);
    curves.push(<Curve dest={cityName} key={cityName} isCorrect={false} />)
  }
  return curves;
}

