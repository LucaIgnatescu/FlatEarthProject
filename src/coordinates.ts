/**
 * This is just a json-like file for all the cities coordinates.
 * @param {dict}, city has lat and lon taken from the Google Maps API
 *
 *
*/
export const truePositions = {
  atlanta: {
    lat: 33.753746,
    lon: -84.386330
  },

  beijing: {
    lat: 39.913818,
    lon: 116.363625
  },

  cape: {
    lat: -34.270836,
    lon: 18.459778
  },

  delhi: {
    lat: 28.644800,
    lon: 77.216721
  },

  easter: {
    lat: -27.104671,
    lon: -109.360481
  },

  florence: {
    lat: 43.769562,
    lon: 11.255814
  },

  goiania: {
    lat: -16.665136,
    lon: -49.286041
  },

  hobart: {
    lat: -42.880554,
    lon: 147.324997
  },

  irkutsk: {
    lat: 52.286974,
    lon: 104.305018
  },

  jakarta: {
    lat: -6.121435,
    lon: 106.774124
  },

  kiev: {
    lat: 50.450001,
    lon: 30.523333
  }
};

export type CityName = keyof typeof truePositions;
export type PolarCoords = {
  lat: number;
  lon: number;
}



