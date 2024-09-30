const API_ENDPOINT = "http://localhost:8080"


export async function LoadDispatcher() {

  const res = await fetch(API_ENDPOINT + "/setup").then(res => res.json());

  console.log(res)
}
