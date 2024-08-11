import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, useStore } from "../state";

export function ContinueButton({ dest, disabled }: { dest: string, disabled: boolean }) {
  const navigate = useNavigate();

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
  useCompareSnapshot: (data: T | null) => boolean;
}

export function DynamicContinueButton<T>({ dest, useSnapshot, useCompareSnapshot }: ButtonProps<T>) {

  const data = useSnapshot();
  const nCities = useStore(state => state.nCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const snapshotRef = useRef<T | null>(null);
  const disabled = useCompareSnapshot(snapshotRef.current);

  useEffect(() => {
    if (snapshotRef.current === null && nCities === nRenderedCities) {
      snapshotRef.current = data;
    }
  }, [data, nCities, nRenderedCities]);


  return <ContinueButton dest={dest} disabled={disabled} />
}


type ConditionsConfig = {
  initData: Partial<Store>
  hasChanged: (data: Partial<Store>) => boolean;
}

class Conditions {
  data: Partial<Store>;
  constructor(config: ConditionsConfig) {
    this.data = { ...config.initData }
  }
}

