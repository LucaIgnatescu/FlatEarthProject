import { CityName } from "../coordinates";
import { getDistancesLazy } from "../distances";
import { useStore } from "../state";

export function Distances() {
  const hoverPositions = useStore(state => state.hoverPositions);

  const ans: JSX.Element[] = [];
  for (const cityName of Object.keys(hoverPositions) as CityName[]) {
    if (hoverPositions[cityName] === undefined || hoverPositions[cityName].position === null) continue;
    ans.push(<Distance key={cityName} cityName={cityName} position={hoverPositions[cityName].position}
      rotation={hoverPositions[cityName]?.rotation as number} />)
  }
  return ans;
}


export function Distance({ cityName, position, rotation }: { cityName: CityName, position: [number, number], rotation: number }) {
  const [x, y] = position;
  const hoveredCityRef = useStore(state => state.hoveredCityRef);
  const citiesRef = useStore(state => state.citiesRef);
  const type = useStore(state => state.objectType);
  if (hoveredCityRef.current === null || cityName === hoveredCityRef.current.name || citiesRef.current === null) return null;

  const { currDistance, trueDistance } = getDistancesLazy(hoveredCityRef.current.name, cityName, type, citiesRef);
  const delta = Math.round(Math.abs(currDistance - trueDistance));
  return (
    <p
      style={{ // NOTE: Cannot use tailwind here because pixel values are dynamic
        top: y,
        left: x,
        transform: `rotate(${rotation}rad)`
      }}
      className="text-white absolute"
    >
      {delta}
    </p>
  );
}
