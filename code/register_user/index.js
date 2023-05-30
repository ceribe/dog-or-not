const AzureTables = require("@azure/data-tables");

module.exports = async function (context, req) {
  const client = AzureTables.TableClient.fromConnectionString(
    process.env.CONNSTRING,
    process.env.USERS_TABLE
  );
  const email = req.query.email;
  const newUser = {
      partitionKey: "P1",
      rowKey: email,
  };

  await client.createEntity(newUser).catch((err) => {
      context.log("error creating new user: " + err);
  });

  let responseMessage = "";
  const entitiesIter = client.listEntities();
  for await (const entity of entitiesIter) {
    responseMessage += "\n" + entity.partitionKey + "-" + entity.rowKey;
  }

  context.res = {
    body: responseMessage,//":)",
  };
};
