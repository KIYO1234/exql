const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema");

const app = express();

app.use("/graphql", graphqlHTTP({
  // dev環境で使うGUIツールを使う設定
  graphiql: true,
  schema,
}));

const port = 4000;

app.listen(port, () => {
  console.log(`🚀 Express server listening on ${port}`);
});