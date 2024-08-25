import { useStore } from "../state";
import { CityName, positions } from "../coordinates";
import { computeTotalError, getDistancesLazy } from "../distances";

export function TotalError() {
  const nCities = useStore(state => state.nCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const currPositions = useStore(state => state.currPositions);
  const type = useStore(state => state.objectType);

  const totalError = Math.round(computeTotalError(type, currPositions) / 10) * 10;
  if (nCities !== nRenderedCities) return null;
  return (
    <div className="text-white p-10 text-4xl pointer-events-none">
      {totalError}
    </div>
  );
}

export function CityRealDistances() {
  const citiesRef = useStore(state => state.citiesRef)
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const type = useStore(state => state.objectType);
  const hoveredCity = useStore(state => state.hoveredCity);

  const cityName = hoveredCity?.name;

  if (nRenderedCities === 0 || cityName === undefined) {
    return null; // TODO: Add some fallback component?
  }

  const distances: { [key in CityName]?: number } = {};
  for (const otherCityName of Object.keys(citiesRef.current) as CityName[]) {
    if (cityName === otherCityName) continue;
    const { trueDistance } = getDistancesLazy(cityName, otherCityName, type, citiesRef);
    distances[cityName] = trueDistance;
  }

  return (
    <div className="flex flex-col justify-center text-center">
      <div className="text-xl border-b-black">TrueDistances</div>
      <div className="flex flex-col justify-around">
        {(Object.keys(distances) as CityName[]).map(city =>
          <div>{distances[city]}</div>
        )}
      </div>
    </div>
  );
}


export function UIContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden w-full h-full absolute top-0 pointer-events-none">
      {children}
    </div>
  );
}


export function CitySlider() {
  const updateNCities = useStore(state => state.updateNCities)
  const nCities = useStore(state => state.nCities);
  return (
    <input type='range' min='1' max={Object.keys(positions).length} value={nCities}
      onChange={(event) => updateNCities(+event.target.value)}
    />
  );
}

