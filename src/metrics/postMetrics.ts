import { Route } from "../App";
import { CityName } from "../coordinates";
import { PathPoint } from "./dispatchers";

const API_ENDPOINT = import.meta.env.VITE_API || "http://localhost:8080";

export type InteractionType = 'drag' | 'click' | 'solve' | 'route_change' | 'exit';

export type InteractionBody = {
  event_type: InteractionType;
  payload?: object;
}

export async function postHandshake() {
  try {
    const res = await fetch(API_ENDPOINT + '/register').then(res => res.json());
    const token: string | undefined = res.token;
    if (token === undefined) {
      return null;
    }
    console.log('completed handshake');
    return token;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function postClick(token: string, x: number, y: number) {
  const payload = { x, y };
  postEvent(token, 'click', payload);
}

export async function postDrag(token: string, path: PathPoint[], cityName: CityName) {
  if (path.length <= 1) {
    console.error("Path length should not be <=1")
    return;
  }
  if (path.length === 2) {
    const [p1, p2] = path;
    if (p1.x === p2.x && p1.y === p2.y && p1.z == p2.z) {
      return;
    }
  }
  path.reverse();
  const payload = { path, city_name: cityName };
  postEvent(token, 'drag', payload);
}

export async function postSolve(token: string, type: 'global' | 'fixed', cityName?: CityName) {
  type Payload = {
    solve_type: 'global' | 'fixed',
    city_name?: CityName
  }
  const payload: Payload = {
    solve_type: type
  }
  if (type === 'fixed' && cityName !== undefined) {
    payload.city_name = cityName;
  }
  postEvent(token, 'solve', payload);
}

export async function postRouteChange(token: string | null, route: Route, ok: boolean = true) {
  if (token === null) {
    return;
  }

  const payload = {
    destination: route,
    success: ok
  };
  postEvent(token, 'route_change', payload);
}

export async function postExit(token: string | null, route: Route | null) {
  if (token === null) {
    return;
  }
  const payload = {
    current_route: route
  };
  postEvent(token, 'exit', payload);
}


async function postEvent(token: string, type: InteractionType, payload: object | null) {
  const body: InteractionBody = {
    event_type: type,
  };
  if (payload !== null) {
    body.payload = payload;
  }
  try {
    const res = await fetch(API_ENDPOINT + '/log/event',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      }
    );
    if (!res.ok) {
      throw Error(`Received error code: ${res.status}`);
    }
  } catch (err) {
    console.error(err);
  }
  //console.log(`logged type:${type}, body:${JSON.stringify(body)}`);
}

async function postGeneric(path: string, token: string | null, payload: object) {
  if (token === null) {
    console.log(`Endpoint ${path} requires authorization`);
    return;
  }
  try {
    const res = await fetch(API_ENDPOINT + path,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }
    );
    if (!res.ok) {
      throw Error(`Received error code: ${res.status}`);
    }
  } catch (err) {
    console.error(err);
  }
  //console.log(`sent payload to ${path}`);
}

export function postBug(token: string | null, payload: object) {
  return postGeneric('/log/report', token, payload);
}

export function postSurvey1(token: string | null, payload: object) {
  return postGeneric('/log/survey1', token, payload);
}

export function postSurvey2(token: string | null, payload: object) {
  return postGeneric('/log/survey2', token, payload);
}


