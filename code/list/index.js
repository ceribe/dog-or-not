const AzureTables = require("@azure/data-tables");

module.exports = async function (context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  const client = AzureTables.TableClient.fromConnectionString(
    process.env.CONNSTRING,
    process.env.TABLE
  );
  let responseMessage = "Connected to " + process.env.TABLE;

  // const testEntity = {
  //     partitionKey: "P1",
  //     rowKey: "R1" + Math.random().toString(36).substring(2, 5),
  //     foo: "foo",
  //     bar: 123
  // };
  // await client.createEntity(testEntity).catch((err) => {
  //     context.log("error creating entity: " + err);
  // });

  const entitiesIter = client.listEntities();
  for await (const entity of entitiesIter) {
    responseMessage += "\n" + entity.partitionKey + "-" + entity.rowKey;
  }
  context.res = {
    // status: 200, /* Defaults to 200 */
    body: responseMessage,
  };
};
