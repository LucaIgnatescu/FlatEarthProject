import { useNavigate } from "react-router-dom";
import { useStore } from "../state";
import { useEffect, useLayoutEffect } from "react";
import { Route } from "../App";

export default function useSetupSection(nCities: number, routeName: Route) {
  const updateRoute = useStore(state => state.updateRoute);
  const updateNCities = useStore(state => state.updateNCities);
  const nRenderedCities = useStore(state => state.nRenderedCities);
  const updateHoveredCity = useStore(state => state.updateHoveredCity);
  const route = useStore(state => state.route);
  const updateProgression = useStore(state => state.updateProgression);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    updateRoute(routeName);
    updateNCities(nCities);
  }, [nCities, navigate, routeName, updateRoute, updateNCities, updateProgression]);

  useEffect(() => {
    if (nRenderedCities === nCities && route === routeName) {
      updateHoveredCity('atlanta');
    }
  }, [nCities, routeName, updateHoveredCity, nRenderedCities, route]);
}
