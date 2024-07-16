import { Line, MapControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, CircleGeometry, ConeGeometry, Mesh, Points, Raycaster, TextureLoader, Vector3 } from "three";
import { TextSprite } from "../utils";
import { CityName, cities as truePositions } from "../coordinates"; // NOTE: This used to be an array in the original implementation
import { CityContextProvider, useCityContext } from "../state";

const EARTH_RADIUS = 80;
const ROTATION: [number, number, number] = [-Math.PI / 2, 0, -Math.PI / 2];


export default function Plane() {
  return (
    <CityContextProvider>
      <Canvas gl={{ antialias: true }} className="bg-black">
        <PerspectiveCamera makeDefault position={[10, 10, 0]} />
        <Controls />
        <ambientLight color={0xffffff} intensity={2} />
        <Cities />
        <Earth />
        <EarthWireframe />
        <Stars />
        <Curves />
      </Canvas>
    </CityContextProvider>
  );
}

function Controls() {
  const { isDragging } = useCityContext();
  return <MapControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} enabled={!isDragging} />
}

function Earth() {
  const texture = useLoader(TextureLoader, '../../static/img/disk.png'); // BUG: Earth not receiving intersection without adding onPointerMove
  const { setHoveredPosition, citiesRef, setIsDragging, isDragging, hoveredCity } = useCityContext();

  const dragCity = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !hoveredCity) return;
    const earthIntersection = event.intersections.find(
      (intersection) => ((intersection.object as Mesh).geometry instanceof CircleGeometry)
    );
    if (earthIntersection === undefined) throw new Error("Didn't intersect earth");
    const { x, z } = earthIntersection.point;

    const hoveredMesh = citiesRef.current[hoveredCity];
    if (hoveredMesh === undefined) return;
    hoveredMesh.position.set(x, hoveredMesh.position.y, z);

    setHoveredPosition(new Vector3(x, hoveredMesh.position.y, z));
  }
  return (
    <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]}
      onPointerUp={() => setIsDragging(false)}
      onPointerMove={dragCity}>
      <circleGeometry args={[EARTH_RADIUS, 64]} />
      <meshStandardMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function EarthWireframe() {
  const wireframe = [];
  for (let amplitude = 0; amplitude < EARTH_RADIUS; amplitude += 10) {
    wireframe.push(<CircleWire amplitude={amplitude} key={amplitude} />);
  }
  return (
    <>
      {wireframe}
      <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]}>
        <circleGeometry args={[EARTH_RADIUS, 32]} />
        <meshBasicMaterial color={"gray"} wireframe />
      </mesh>
    </>
  );
}

function CircleWire({ amplitude = EARTH_RADIUS, resolution = 90 }: { amplitude?: number, resolution?: number }) {
  const points = useMemo(() => {
    const size = 360 / resolution;
    return Array.from({ length: resolution + 1 }, (_, i) => {
      const segment = (i * size) * Math.PI / 180;
      return new Vector3(Math.cos(segment) * amplitude, 0, Math.sin(segment) * amplitude);
    });
  }, [amplitude, resolution]);
  return (
    <Line points={points} color={"grey"} linewidth={1} />
  );
}

function Stars() {
  const ref = useRef<Points>(null!);
  const starVerticies = useMemo(() => {
    const vertices = [];
    for (let i = 0; i < 50000; i++) {
      const x = (Math.random() - 0.5) * 1000;
      const y = (Math.random() - 0.5) * 1000;
      const z = (Math.random() - 0.5) * 1000;
      if (x * x + y * y + z * z > 120000) vertices.push(x, y, z);
    }
    return vertices;
  }, [])

  useFrame((_, delta) => {
    const speed = 0.01;
    ref.current.rotation.x += delta * speed;
    ref.current.rotation.y += delta * speed;
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <float32BufferAttribute args={[starVerticies, 3]} attach={"attributes-position"} />
      </bufferGeometry>
    </points>
  );
}

const City = memo(function({ i, cityName }: { i: number, cityName: CityName }) {
  console.log("rendering");
  const height = 0.4, nTriangles = 6;
  const coneRef = useRef<ConeGeometry>(null!);
  const meshRef = useRef<Mesh>(null!);
  const { citiesRef, updateCities, setHoveredCity, hoveredCity, setIsDragging, isDragging, setHoveredPosition } = useCityContext();
  useEffect(() => {
    coneRef.current.translate(0, height / 2, 0);
  }, []);

  useEffect(() => {
    updateCities(cityName, meshRef.current);
  }, [cityName, updateCities]);

  const onHover = () => {
    if (cityName !== hoveredCity && isDragging === false) {
      setHoveredCity(cityName);
      setHoveredPosition(citiesRef.current[cityName]?.position ?? null);
    }
  }
  const spriteArguments = {
    fontsize: 60,
    borderColor: { r: 225, g: 0, b: 0, a: 1.0 },
    backgroundColor: { r: 225, g: 140, b: 0, a: 0.9 }
  };


  const { lat, lon } = truePositions[cityName];
  return (
    <mesh position={[lat / 3, 0, lon / 3]} ref={meshRef}
      onPointerOver={onHover}
      onPointerDown={() => setIsDragging(true)} // NOTE: Check sprite effects for bugs
      onPointerLeave={() => {
        if (isDragging) return;
        setHoveredPosition(null);
        setHoveredCity(null);
      }}
    >
      <coneGeometry args={[height, height, nTriangles]} ref={coneRef} />
      <meshBasicMaterial color={"#DE1738"} />
      <TextSprite message={String.fromCharCode(65 + i)} parameters={spriteArguments} />
    </mesh>
  )
});


function Cities() {
  return (
    Object.entries(Object.keys(truePositions))
      .map(([i, cityName]) => <City i={+i} cityName={cityName as CityName} key={cityName} />)
  );
}

function Curve({ base, dest }: { base: Vector3, dest: Vector3 }) {
  const curve = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const p = new Vector3().lerpVectors(base, dest, i / 12);
      pts.push(p);
    }
    return new CatmullRomCurve3(pts);
  }, [base, dest]) // TODO: Optimize 2d vectors as just one line
  const green = 0x3acabb; // TODO: Check distance
  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.05, 50, false]} />
      <meshBasicMaterial color={green} />
    </mesh>
  );
}

function Curves() {
  const { hoveredPosition, citiesRef } = useCityContext();
  if (hoveredPosition === null) return;
  const positions = Object.values(citiesRef.current).map(mesh => mesh.position).filter(position => position !== undefined);
  return positions.map((dest, i) => <Curve base={hoveredPosition} dest={dest} key={i} />) // FIX: key
}



