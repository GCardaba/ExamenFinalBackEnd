import { Collection, ObjectId } from "mongodb";
import type {
  APIPhone,
  APITime,
  APIWeather,
  restaurantModel,
} from "./types.ts";

type context = {
  contextRestaurants: Collection<restaurantModel>;
};
type addRestaurantInput = {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
};

type getRestaurantInput = {
  id: string;
};
type deleteRestaurantInput = {
  id: string;
};

export const resolvers = {
  Query: {
    getRestaurant: async (
      _: unknown,
      { input }: { input: getRestaurantInput },
      ctx: context
    ): Promise<restaurantModel | null> => {
      return await ctx.contextRestaurants.findOne({
        _id: new ObjectId(input.id),
      });
    },
    getRestaurants: async (
      _: unknown,
      __: unknown,
      ctx: context
    ): Promise<restaurantModel[]> => {
      return await ctx.contextRestaurants.find({}).toArray();
    },
  },
  Mutation: {
    addRestaurant: async (
      _: unknown,
      { input }: { input: addRestaurantInput },
      ctx: context
    ): Promise<restaurantModel> => {
      const apiKey = Deno.env.get("Api_Key");
      if (!apiKey) throw new Error("Missing apiKey");
      const { nombre, direccion, ciudad, telefono } = input;
      //comprobar telefono
      const existeTelefono = await ctx.contextRestaurants.countDocuments({
        telefono: telefono,
      });
      if (existeTelefono >= 1) throw new Error("ya existe el telefono");
      const url = `https://api.api-ninjas.com/v1/validatephone?number=${telefono}`;
      console.log(telefono);
      const data = await fetch(url, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });
      console.log(data.status, data.statusText);
      if (data.status !== 200) throw new Error("Error apiPhone");
      const response: APIPhone = await data.json();
      if (!response.is_valid) throw new Error("Telefono no es valido");
      const pais = response.country;
      // validar que la ciudad es la misma que el numero?
      const { insertedId } = await ctx.contextRestaurants.insertOne({
        _id: new ObjectId(),
        nombre,
        direccion,
        ciudad,
        pais,
        telefono,
      });
      return {
        _id: new ObjectId(insertedId),
        nombre,
        direccion,
        ciudad,
        pais,
        telefono,
      };
    },
    deleteRestaurant: async (
      _: unknown,
      input: deleteRestaurantInput,
      ctx: context
    ): Promise<boolean> => {
      const { deletedCount } = await ctx.contextRestaurants.deleteOne({
        _id: new ObjectId(input.id),
      });
      return deletedCount === 1;
    },
  },
  restaurant: {
    id: (parent: restaurantModel) => {
      return parent._id.toString();
    },
    full_direccion: (parent: restaurantModel) => {
      return parent.direccion + ", " + parent.ciudad + ", " + parent.pais;
    },
    weather: async (parent: restaurantModel): Promise<string> => {
      const apiKey = Deno.env.get("Api_Key");
      if (!apiKey) throw new Error(" Error falta api key");
      let url = `https://api.api-ninjas.com/v1/city?name=${parent.ciudad}`;
      let data = await fetch(url, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });
      console.log(data.status, data.statusText);
      if (data.status !== 200) throw new Error("Error api geolocalizacion");
      const response = await data.json();
      const { latitude } = response[0];
      const { longitude } = response[0];
      url = `https://api.api-ninjas.com/v1/weather?lat=${latitude}&lon=${longitude}`;

      data = await fetch(url, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });
      console.log("latitud, ", latitude, "logitud", longitude);
      console.log(data.status, data.statusText);
      if (data.status !== 200) throw new Error("Error api weather");
      const response2: APIWeather = await data.json();
      return (
        "Temperatura: " +
        response2.temp +
        ". Sensacion termica:" +
        response2.feels_like
      );
    },
    hora_local: async (parent: restaurantModel): Promise<string> => {
      const apiKey = Deno.env.get("Api_Key");
      if (!apiKey) throw new Error(" Error falta api key");
      let url = `https://api.api-ninjas.com/v1/geocoding?city=${parent.ciudad}&country=${parent.pais}`;
      let data = await fetch(url, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });
      if (data.status !== 200) throw new Error("Error api geolocalizacion");
      const response = await data.json();
      const { latitude, longitude } = response[0];
      url = `https://api.api-ninjas.com/v1/worldtime?lat=${latitude}&lon=${longitude}`;

      data = await fetch(url, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });
      if (data.status !== 200) throw new Error("Error api tiempo");
      const response2: APITime = await data.json();
      const hora = response2.hour;
      const minutos = response2.minute;

      return hora + ":" + minutos;
    },
  },
};
