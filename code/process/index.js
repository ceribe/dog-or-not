const AzureTables = require("@azure/data-tables");
const { CognitiveServicesCredentials } = require("@azure/ms-rest-azure-js");
const {
  ComputerVisionClient,
} = require("@azure/cognitiveservices-computervision");

module.exports = async function (context, myBlob) {
  const fileName = context.bindingData.name;
  const link = context.bindingData.uri;

  const client = AzureTables.TableClient.fromConnectionString(
    process.env.CONNSTRING,
    process.env.TABLE
  );

  const uniqueName = fileName + Math.random().toString(36).substring(2, 5);

  await saveToTable(context, client, fileName, link, uniqueName);
  const isDog = await analyzePicture(context, myBlob);
  await updateStatus(context, client, uniqueName, isDog ? "dog" : "not dog");
  // Trigger cloud function that will send an email
};

async function saveToTable(context, client, fileName, link, uniqueName) {
  const testEntity = {
    partitionKey: "P1",
    rowKey: uniqueName,
    fileName: fileName,
    link: link,
    status: "pending",
  };

  await client.createEntity(testEntity).catch((err) => {
    context.log("error creating entity: " + err);
  });
}

async function analyzePicture(context, blob) {
  const credentials = new CognitiveServicesCredentials(process.env.VISION_KEY);
  const client = new ComputerVisionClient(
    credentials,
    process.env.VISION_ENDPOINT
    );
    let isDog = false;
    await client
    .analyzeImageInStream(blob, { visualFeatures: ["Categories"] })
    .then((result) => {
      context.log(result);
      try {
        isDog = result.categories.some((category) => {
          return category.name === "animal_dog";
        });
      }
      catch (err) {
        context.log(err);
      }
    })
    .catch((err) => {
      context.log(err);
    });
    return isDog;
}

async function updateStatus(context, client, uniqueName, status) {
  const entity = {
    partitionKey: "P1",
    rowKey: uniqueName,
    status: status,
  };

  await client.updateEntity(entity).catch((err) => {
    context.log("error updating entity: " + err);
  });
}