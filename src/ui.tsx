import { CityName } from "./coordinates";
import { useRenderContext, useUpdateContext } from "./state";
import { useDistanceInfo } from "./utils";

export function UIWrapper() {
  return (
    <div className="text-white w-full absolute top-0 h-full z-100 pointer-events-none">
      <Animate />
      <TotalError />
    </div>
  );
}

function TotalError() {
  const { realDistances, currDistances, totalCurr, totalReal } = useDistanceInfo();

  let totalError = 0;
  for (const city1 of Object.keys(currDistances) as CityName[]) {
    for (const city2 of Object.keys(currDistances[city1]) as CityName[]) {
      totalError += Math.abs(currDistances[city1][city2] / totalCurr - realDistances[city1][city2] / totalReal);
    }
  }
  totalError = Math.round(totalError / 2);
  return (
    <div className="flex w-full justify-center">
      <div className="p-2 text-lg">
        Difference: {Math.round(totalReal)}:{Math.round(totalCurr)}
      </div>
    </div>
  );
}

function Deltas() {
  const { hoveredCityRef } = useRenderContext();
  const { realDistances, currDistances, totalCurr, totalReal } = useDistanceInfo();
  if (hoveredCityRef.current === null) return null;
  const current = hoveredCityRef.current.name as CityName;
  const cities = [];
  for (const other of Object.keys(currDistances[current])) {
    if (other === current) continue;
    const d = Math.abs(currDistances[current][other] / totalCurr - realDistances[current][other] / totalReal);
    cities.push(
      <div key={other}>
        Δ {current} {"->"} {other}: {Math.round(d)}
      </div>
    )
  }

  return (
    <div className="flex flex-col top-0.5 p-5">
      {cities}
    </div>
  );

}

function Animate() {
  const { updateAnimationState, updateHoveredCity } = useUpdateContext();
  const onClick = () => {
    updateHoveredCity('kiev');
    updateAnimationState('fixed', 'kiev');
  }
  return <button className="top-0.5 p-2 pointer-events-auto" onClick={onClick}> Animate</button >
}



