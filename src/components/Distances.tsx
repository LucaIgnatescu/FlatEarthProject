import { useStore } from "../state";

export function Distances() {
  const hoveredCity = useStore(store => store.hoveredCityRef);
  const currDistances = useStore(store => store.currPositions);
}

export function Distance({ pos }: { pos: [number, number] }) {

}
