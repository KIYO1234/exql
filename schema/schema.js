const graphql = require("graphql");
const _ = require("lodash");
const axios = require("axios");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
} = graphql;

const users = [
  { id: "23", firstName: "Bill", age: 20 },
  { id: "49", firstName: "Mike", age: 34 },
];

const companies = [
  { id: "1234", name: "SONY", builtAt: 1950 },
  { id: "4321", name: "Panasonic", builtAt: 1939 },
];

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    builtAt: { type: GraphQLInt },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        console.log(parent);
        return axios
          .get(`http://localhost:8080/companies/${parent.id}/users`)
          .then((res) => res.data);
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parent, args) {
        return axios
          .get(`http://localhost:8080/companies/${parent.companyId}`)
          .then((res) => res.data);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:8080/users/${args.id}`)
          .then((res) => {
            console.log(res.data);
            return res.data;
          });
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve() {
        return axios.get("http://localhost:8080/users").then((res) => {
          console.log(res);
          return res.data;
        });
      },
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return axios
          .get(`http://localhost:8080/companies/${args.id}`)
          .then((res) => {
            return res.data;
          });
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString },
      },
      resolve(parent, { firstName, age }) {
        return axios
          .post("http://localhost:8080/users", { firstName, age })
          .then((res) => {
            console.log(res);
            return res.data;
          });
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        console.log(args.id);
        return axios
          .delete(`http://localhost:8080/users/${args.id}`)
          .then((res) => res.data);
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },
      resolve(parent, args) {
        return axios
          .patch(`http://localhost:8080/users/${args.id}`, args)
          .then((res) => res.data);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
