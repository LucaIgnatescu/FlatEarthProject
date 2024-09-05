import { CityName } from "../coordinates";
import { getDistancesLazy } from "../distances";
import { CityPair, useStore } from "../state";
import { getColor } from "../utils";

function decodeKey(key: CityPair) {
  const index = (key as string).indexOf('_');
  const baseName = key.slice(0, index) as CityName;
  const destName = key.slice(index + 1) as CityName;
  return { baseName, destName };
}

export function Distances() {
  const hoverPositions = useStore(state => state.hoverPositions);

  const ans: JSX.Element[] = [];
  for (const cityName of Object.keys(hoverPositions) as CityPair[]) {
    const { baseName, destName } = decodeKey(cityName);
    if (hoverPositions[cityName] === undefined || hoverPositions[cityName].position === null) continue;
    ans.push(<Distance
      key={cityName}
      baseName={baseName}
      destName={destName}
      position={hoverPositions[cityName].position}
      rotation={hoverPositions[cityName]?.rotation as number}
    />)
  }
  return ans;
}


export function Distance({ baseName, destName, position, rotation }: { baseName: CityName, destName: CityName, position: [number, number], rotation: number }) {
  const [x, y] = position;
  const citiesRef = useStore(state => state.citiesRef);
  const type = useStore(state => state.objectType);

  if (citiesRef.current === null) return null;

  const { currDistance, trueDistance } = getDistancesLazy(baseName, destName, type, citiesRef);
  const delta = currDistance - trueDistance;
  const color = "#" + getColor(delta).toString(16);
  return (
    <p
      style={{ // NOTE: Cannot use tailwind here because pixel values are dynamic
        top: y,
        left: x,
        transform: `rotate(${rotation}rad)`,
        color: color
      }}
      className="absolute"
    >
      {Math.round(Math.abs(delta))}
    </p>
  );
}
