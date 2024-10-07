const API_ENDPOINT = "http://localhost:8080";


export type InteractionType = 'drag' | 'click' | 'solve';

export type InteractionBody = {
  event_type: InteractionType;
  payload?: object;
}

export async function sendHandshake() {
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

export async function sendClick(token: string, x: number, y: number) {
  const payload = { x, y };
  sendEvent(token, 'click', payload);
}

export async function sendDrag(token: string, path: { x: number, y: number }[]) {
  if (path.length <= 1) {
    console.error("Path length should not be <=1")
    return;
  }
  if (path.length === 2) {
    const [p1, p2] = path;
    if (p1.x === p2.x && p1.y === p2.y) {
      return;
    }
  }
  path.reverse();
  sendEvent(token, 'drag', path);
}

async function sendEvent(token: string, type: InteractionType, payload: object | null) {
  const body: InteractionBody = {
    event_type: type,
  };

  if (payload !== null) {
    body.payload = payload;
  }
  console.log('sending', type);
  try {
    const res = await fetch(API_ENDPOINT + '/log',
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
  console.log('succesful log');
}


