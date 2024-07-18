import { CityName } from "./coordinates";
import { getRealDistances, useUIContext } from "./state";


export function TotalError() {
  const realDistances = getRealDistances();
  const { currDistances } = useUIContext();
  let totalError = 0;
  for (const city1 of Object.keys(currDistances) as CityName[]) {
    for (const city2 of Object.keys(currDistances[city1]) as CityName[]) {
      totalError += Math.abs(currDistances[city1][city2] - realDistances[city1][city2]);
    }
  }
  totalError = Math.round(totalError / 2);
  return (
    <div className="text-white p-2 text-lg">
      Difference: {totalError}
    </div>
  );
}


export function UIWrapper() {
  return (
    <div className="w-full absolute top-0 h-full pointer-events-none">
      <div className="flex w-full justify-center">
        <TotalError />
      </div>
    </div>
  );
}
