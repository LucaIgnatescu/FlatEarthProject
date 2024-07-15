import { Line, MapControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { ConeGeometry, Mesh, Points, TextureLoader, Vector3 } from "three";
import { makeTextSprite } from "../utils";
import { CityName, cities as truePosition } from "../coordinates"; // NOTE: This used to be an array in the original implementation
import { CityContextProvider, useCityContext } from "../state";

const EARTH_RADIUS = 80;
const ROTATION: [number, number, number] = [-Math.PI / 2, 0, -Math.PI / 2];


export default function Plane() {
  return (
    <CityContextProvider>
      <Canvas gl={{ antialias: true }} className="bg-black">
        <PerspectiveCamera makeDefault position={[10, 10, 0]} />
        <MapControls maxPolarAngle={1.5} minDistance={35} maxDistance={200} />
        <ambientLight color={0xffffff} intensity={2} />
        <Earth />
        <EarthWireframe />
        <Stars />
        <Cities />
      </Canvas>
      <CheckContext />
    </CityContextProvider>
  );
}

function Earth() {
  const texture = useLoader(TextureLoader, '../../static/img/disk.png');
  return (
    <>
      <mesh rotation={ROTATION} receiveShadow={true} position={[0, -0.05, 0]}>
        <circleGeometry args={[EARTH_RADIUS, 64]} />
        <meshLambertMaterial map={texture} toneMapped={false} />
      </mesh>
    </>
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
  const size = 360 / resolution;
  const points = useMemo(() => {
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

function City({ i, cityName }: { i: number, cityName: CityName }) {
  const height = 0.4, nTriangles = 6;
  const coneRef = useRef<ConeGeometry>(null!);
  const meshRef = useRef<Mesh>(null!);
  const { updateCities } = useCityContext();

  useEffect(() => {
    coneRef.current.translate(0, height / 2, 0);
  }, []);

  useEffect(() => {
    updateCities(cityName, meshRef.current);
  }, [cityName, updateCities]);


  const spriteArguments = {
    fontsize: 60,
    borderColor: { r: 225, g: 0, b: 0, a: 1.0 },
    backgroundColor: { r: 225, g: 140, b: 0, a: 0.9 }
  }; // TODO: add to cities in context

  const { lat, lon } = truePosition[cityName];
  return (
    <mesh position={[lat / 3, 0, lon / 3]} ref={meshRef}>
      <coneGeometry args={[height, height, nTriangles]} ref={coneRef} />
      <meshBasicMaterial color={"#DE1738"} />
      <lineSegments>
        <edgesGeometry args={[coneRef.current]} />
        <lineBasicMaterial color={"black"} />
      </lineSegments>
      {makeTextSprite(String.fromCharCode(65 + i), spriteArguments)}
    </mesh>
  )
}


function Cities() {
  return (
    Object.entries(Object.keys(truePosition))
      .map(([i, cityName]) => <City i={+i} cityName={cityName as CityName} key={cityName} />)
  );
}

function CheckContext() {
  const { citiesRef } = useCityContext();

  return <button className="absolute top-20 left-20 bg-white" onClick={() => console.log(citiesRef.current)}>
    Print
  </button>
}


