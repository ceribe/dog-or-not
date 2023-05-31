const AzureTables = require("@azure/data-tables");

module.exports = async function (context, req) {
  const client = AzureTables.TableClient.fromConnectionString(
    process.env.CONNSTRING,
    process.env.PHOTO_TABLE
  );
  let rows = [];

  const entitiesIter = client.listEntities();
  for await (const entity of entitiesIter) {
    rows.push({
      fileName: entity.fileName,
      link: entity.link,
      status: entity.status,
    });
  }
  context.res = {
    body: { data: rows },
  };
};
