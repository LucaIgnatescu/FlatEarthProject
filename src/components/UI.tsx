import { useStore } from "../state";
import { positions } from "../coordinates";
import { computeTotalError } from "../distances";

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
