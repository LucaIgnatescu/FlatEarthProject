import { useDistanceInfo } from "../utils";

export function TotalError() {
  const { totalReal, totalCurr } = useDistanceInfo();
  const delta = Math.round(Math.abs(totalCurr - totalReal) / 100) * 100;
  return (
    <div className="text-white p-10 text-xl">
      Total Error:{delta} km
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
