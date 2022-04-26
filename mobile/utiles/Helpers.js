import {Platform} from "react-native"
import axios from 'axios'
import PolyLine from '@mapbox/polyline';

export const prefix = Platform.OS === "ios" ? "ios" :"md";

export const API_KEY= 'AIzaSyCynyadVP6y0U3WS6-BTeJae2da6tDlMXE';
export const BASE_URL = "https://maps.googleapis.com/maps/api";


//Avoir la route indiquee
export const getRoute = async url =>{
  try {
    const {
      data :{routes}
    } = await axios.get(url);
    const points = routes[0].overview_polyline.points;
    return points;
  } catch (error) {
    console.error('error route',error)
  }
}

//decoder le point
export const decodePoint = point =>{
  const fixPoints = PolyLine.decode(point);
  const route = fixPoints.map(fixPoint =>{
    return{
      latitude:fixPoint[0],
      longitude:fixPoint[1],
    }
  });
  return route;
} 