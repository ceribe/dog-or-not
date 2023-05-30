const { EmailClient } = require("@azure/communication-email");
const AzureTables = require("@azure/data-tables");

module.exports = async function (context, message) {
  const emailList = readEmailList();
  const connectionString = process.env.COMMUNICATION_SERVICE_CONNECTION_STRING;
  const client = new EmailClient(connectionString);

  const messagesToSend = {
    senderAddress: "DoNotReply@26c7cf19-7907-42f3-8aa1-7d8b4603cf81.azurecomm.net",
    content: {
      subject: "Check out this doggo!",
      plainText: message,
    },
    recipients: {
      to: 
      emailList.map((email) => {
        return {
          address: email,
          displayName: email,
        };
      }),
    },
  };

  try {
    await client.beginSend(messagesToSend);
  } catch (error) {
    context.log(error);
  }
};

function readEmailList() {
  const client = AzureTables.TableClient.fromConnectionString(
    process.env.CONNSTRING,
    process.env.USERS_TABLE
  );
  let emailList = [];

  const entitiesIter = client.listEntities();
  for await (const entity of entitiesIter) {
    emailList.push(entity.rowKey);
  }
  return emailList;
}
