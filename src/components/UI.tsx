import { useStore } from "../state";
import { positions } from "../coordinates";
import { computeTotalError } from "../distances";

export function TotalError() {
  const nCities = useStore(state => state.nCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const currentPositions = useStore(state => state.currentPositions);
  const type = useStore(state => state.objectType);

  const totalError = Math.round(computeTotalError(type, currentPositions) / 100) * 100;
  if (nCities !== nRenderedCities) return null;
  return (
    <div className="text-white p-10 text-xl">
      Total Error: {totalError} km
    </div>
  );
}

export function UIWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full absolute top-0 pointer-events-none">
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
