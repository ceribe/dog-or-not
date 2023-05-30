const { EmailClient } = require("@azure/communication-email");
const AzureTables = require("@azure/data-tables");

module.exports = async function (context, queueItem) {
  context.log("===========CAPIBARA0=============");
  context.log("=====================" + queueItem.link);
  const client = AzureTables.TableClient.fromConnectionString(
    process.env.CONNSTRING,
    process.env.USERS_TABLE
  );
  let emailList = [];
  const entitiesIter = client.listEntities();
  context.log("===========CAPIBARA1=============");

  for await (const entity of entitiesIter) {
    emailList.push(entity.rowKey);
  }
  context.log("===========CAPIBARA2=============" + emailList.length);
  const connectionString = process.env.COMMUNICATION_SERVICE_CONNECTION_STRING;
  const emailClient = new EmailClient(connectionString);
  context.log("===========CAPIBARA3=============")
  const messagesToSend = {
    senderAddress: "DoNotReply@26c7cf19-7907-42f3-8aa1-7d8b4603cf81.azurecomm.net",
    content: {
      subject: "Check out this cool doggo!",
      plainText: queueItem.link,
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
  context.log("===========CAPIBARA4=============")

  try {
    await emailClient.beginSend(messagesToSend);
  } catch (error) {
    context.log(error);
  }
  context.log("===========CAPIBARA5=============")
};
