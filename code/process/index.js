const AzureTables = require("@azure/data-tables");
const { QueueClient, QueueServiceClient } = require("@azure/storage-queue");
const { CognitiveServicesCredentials } = require("@azure/ms-rest-azure-js");
const {
  ComputerVisionClient,
} = require("@azure/cognitiveservices-computervision");

module.exports = async function (context, myBlob) {
  const fileName = context.bindingData.name;
  const link = context.bindingData.uri;

  const client = AzureTables.TableClient.fromConnectionString(
    process.env.CONNSTRING,
    process.env.PHOTO_TABLE
  );

  const uniqueName = fileName + Math.random().toString(36).substring(2, 5);

  await saveToTable(context, client, fileName, link, uniqueName);
  const isDog = await analyzePicture(context, myBlob);
  await updateStatus(context, client, uniqueName, isDog ? "dog" : "not dog");
  if (isDog) await triggerSendEmailFunction(link, context);
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
      } catch (err) {
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

async function triggerSendEmailFunction(link, context) {
  const queueServiceClient = QueueServiceClient.fromConnectionString(
    process.env.CONNSTRING
  );

  const queueClient = queueServiceClient.getQueueClient(process.env.QUEUE_NAME);

  const object = {
    link: link,
  };

  context.log("Sending message to queue: " + JSON.stringify(object));
  const sendMessageResponse = await queueClient.sendMessage(
    Buffer.from(JSON.stringify(object)).toString("base64")
  );

  context.log(
    `Sent message successfully, service assigned message Id: ${sendMessageResponse.messageId}, service assigned request Id: ${sendMessageResponse.requestId}`
  );
}
