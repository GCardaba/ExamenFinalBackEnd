export const schema = `#graphql 
type restaurant {
    id: ID!,
    nombre: String!,
    full_direccion: String!,
    weather: String!,
    hora_local: String!

}
input addRestaurantInput {
    nombre: String!,
    direccion: String!,
    ciudad: String!,
    telefono: String!
}

input getRestaurantInput {
    id: ID!
}
input deleteRestaurantInput {
    id: ID!
}

type Query {
    getRestaurant(input: getRestaurantInput!): restaurant!
    getRestaurants: [restaurant!]!
}

type Mutation {
    addRestaurant(input: addRestaurantInput):restaurant!
    deleteRestaurant(input: deleteRestaurantInput): Boolean!

}
`;
