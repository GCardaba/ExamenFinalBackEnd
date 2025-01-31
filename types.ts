import { ObjectId } from "mongodb";

export type restaurantModel = {
  _id: ObjectId;
  nombre: string;
  direccion: string;
  ciudad: string;
  pais: string;
  telefono: string;
};

//https://api.api-ninjas.com/v1/validatephone?number=
export type APIPhone = {
  is_valid: boolean;
  country: string;
  timezones: string[];
};
//https://api.api-ninjas.com/v1/worldtime?timezone=

export type APITime = {
  hour: number;
  minute: number;
};
//https://api.api-ninjas.com/v1/weather?city=
export type APIWeather = {
  temp: number;
  feels_like: number;
};
//https://api.api-ninjas.com/v1/city?name=San Francisco

