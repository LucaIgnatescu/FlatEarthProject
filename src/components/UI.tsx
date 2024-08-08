import { useNavigate } from "react-router-dom";
import { useDistanceInfo } from "../utils";
import { useStore } from "../state";
import { positions } from "../coordinates";

export function TotalError() {
  const { totalReal, totalCurr } = useDistanceInfo();
  const delta = Math.round(Math.abs(totalCurr - totalReal) / 100) * 100;
  return (
    <div className="text-white p-10 text-xl">
      Total Error: {delta} km
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

export function ContinueButton({ dest }: { dest: string }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(dest)}
      className="bg-blue-500 p-5 text-white w-fit rounded">
      Continue
    </button>
  )
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
