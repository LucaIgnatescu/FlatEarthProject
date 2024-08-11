import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, useStore } from "../state";

export function ContinueButton({ dest, disabled }: { dest: string, disabled?: boolean }) {
  const navigate = useNavigate();
  if (disabled === undefined) disabled = false;
  return (
    <button onClick={() => navigate(dest)} disabled={disabled}
      className={"bg-blue-500 p-5 text-white w-fit rounded " + (disabled ? "opacity-75" : "")}>
      Continue
    </button>
  );
}

export type ButtonProps<T> = {
  dest: string;
  useSnapshot: () => T;
  compareSnapshot?: (current: T | null, saved: T | null) => boolean;
}

function defaultCompareSnapshot<T>(current: T | null, saved: T | null) {
  if (current === null || saved === null) return false;
  return JSON.stringify(current) === JSON.stringify(saved);
}

export function DynamicContinueButton<T>({ dest, useSnapshot, compareSnapshot }: ButtonProps<T>) {
  const data = useSnapshot();
  const nCities = useStore(state => state.nCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const snapshotRef = useRef<T | null>(null);
  if (compareSnapshot === undefined) compareSnapshot = defaultCompareSnapshot;

  const disabled = !compareSnapshot(data, snapshotRef.current);

  useEffect(() => {
    if (snapshotRef.current === null && nCities === nRenderedCities) {
      snapshotRef.current = data;
    }
  }, [data, nCities, nRenderedCities]);


  return <ContinueButton dest={dest} disabled={disabled} />
}


