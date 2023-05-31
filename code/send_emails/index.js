const { EmailClient } = require("@azure/communication-email");
const AzureTables = require("@azure/data-tables");

module.exports = async function (context, queueItem) {
  context.log("Sending emails with " + queueItem.link);
  const client = AzureTables.TableClient.fromConnectionString(
    process.env.CONNSTRING,
    process.env.USERS_TABLE
  );
  let emailList = [];
  const entitiesIter = client.listEntities();

  for await (const entity of entitiesIter) {
    emailList.push(entity.rowKey);
  }
  const connectionString = process.env.COMMUNICATION_SERVICE_CONNECTION_STRING;
  const emailClient = new EmailClient(connectionString);
  const messagesToSend = {
    senderAddress:
      "DoNotReply@700c52de-bbed-4ce4-a2de-6089512bc9c5.azurecomm.net",
    content: {
      subject: "Check out this cool doggo!",
      plainText: queueItem.link,
    },
    recipients: {
      to: emailList.map((email) => {
        return {
          address: email,
          displayName: email,
        };
      }),
    },
  };

  try {
    await emailClient.beginSend(messagesToSend);
  } catch (error) {
    context.log(error);
  }
  context.log("Sent emails with " + queueItem.link);
};
