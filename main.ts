import { ApolloServer } from "@apollo/server";
import { schema } from "./schema.ts";
import { MongoClient } from "mongodb";
import { restaurantModel } from "./types.ts";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if (!MONGO_URL) throw new Error("Error MONGO_URL");

const mongoClient = new MongoClient(MONGO_URL!);
await mongoClient.connect();

console.info("Connected to MongoDB");

const mongoDB = mongoClient.db("examenFinalDB");
const contextRestaurants = mongoDB.collection<restaurantModel>("Restaurante");

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  context: async () => ({ contextRestaurants }),
  listen: { port: 8000 },
});

console.info(`Server ready at url: ${url}`);
