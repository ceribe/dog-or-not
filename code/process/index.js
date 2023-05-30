const AzureTables = require("@azure/data-tables");
const { CognitiveServicesCredentials } = require("@azure/ms-rest-azure-js");
const {
  ComputerVisionClient,
} = require("@azure/cognitiveservices-computervision");

module.exports = async function (context, myBlob) {
  const credentials = new CognitiveServicesCredentials(process.env.VISION_KEY);
  const client = new ComputerVisionClient(
    credentials,
    process.env.VISION_ENDPOINT
  );
  await client
    .analyzeImageInStream(myBlob, { visualFeatures: ["Categories"] })
    .then((result) => {
      context.log(result);
    })
    .catch((err) => {
      context.log(err);
    });
};
