const AzureTables = require("@azure/data-tables");

module.exports = async function (context, req) {
  context.log("Registering new user");
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
  context.log("Created new user: " + email);
  context.res = {
    body: ":)",
  };
};
