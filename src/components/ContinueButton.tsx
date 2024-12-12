import { useEffect, useRef } from "react";
import { NavigateFunction } from "react-router-dom";
import { useStore } from "../state";

export function ContinueButton({ onClick, text, disabled }: { onClick: () => void, text?: string, disabled?: boolean }) {
  if (text === undefined) text = 'Continue'
  if (disabled === undefined) disabled = false;

  return (
    <button onClick={onClick} disabled={disabled}
      className={"bg-blue-500 p-5 text-white w-fit rounded " + (disabled ? "opacity-0" : "animate-fade")}>
      {text}
    </button>
  );
}

export type ButtonProps<T> = {
  onClick: () => void;
  text?: string;
  useSnapshot: () => T | null;
  compareSnapshot?: (current: T | null, saved: T | null) => boolean;
}

function defaultCompareSnapshot<T>(current: T | null, saved: T | null) {
  if (current === null || saved === null) return false;
  return JSON.stringify(current) === JSON.stringify(saved);
}

export function DynamicContinueButton<T>({ onClick, text, useSnapshot, compareSnapshot }: ButtonProps<T>) {
  if (compareSnapshot === undefined) compareSnapshot = defaultCompareSnapshot;
  const snapshotRef = useRef<T | null>(null);
  const data = useSnapshot();
  const nCities = useStore(state => state.nCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const disabled = nRenderedCities == nCities ? !compareSnapshot(data, snapshotRef.current) : true;

  useEffect(() => {
    if (snapshotRef.current === null && nCities === nRenderedCities) {
      snapshotRef.current = data;
    }
  }, [data, nCities, nRenderedCities]);


  return <ContinueButton onClick={onClick} disabled={disabled} text={text} />
}

export function DestinationFactory(dest: string, navigate: NavigateFunction) {
  return () => navigate(dest);
}

