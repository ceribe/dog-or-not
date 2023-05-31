const { BlobServiceClient } = require("@azure/storage-blob");

const selectButton = document.getElementById("select-button");
const fileInput = document.getElementById("file-input");
const registerButton = document.getElementById("register-button");
const emailInput = document.getElementById("email-input");
const fileTable = document.getElementById("file-table");

const blobEndpoint = "https://doggosharedbsa.blob.core.windows.net/";
const sasToken =
  "??sv=2017-11-09\u0026ss=bqtf\u0026srt=sco\u0026sp=rwac\u0026se=2024-03-21T00:00:00Z\u0026st=2023-03-21T00:00:00Z\u0026spr=https\u0026sig=OV55iE0cd0PnfcfXrga%2FXIjCTxBjsvFOiIV8gpCUcx4%3D";
const blobSasUrl = blobEndpoint + sasToken;
const blobServiceClient = new BlobServiceClient(blobSasUrl);
const containerClient = blobServiceClient.getContainerClient("photos");

const statusMappings = {
  dog: "🐕",
  "not dog": "❌",
  pending: "⏳",
};

// This should be a cloud function, because this way the key is exposed and it gives users the ability to overwrite the images.s
// If it was a could function triggered by a post request, the file name would be chosen on the server side and problem
// would be solved.
const uploadFiles = async () => {
  try {
    const promises = [];
    for (const file of fileInput.files) {
      const blockBlobClient = containerClient.getBlockBlobClient(file.name);
      promises.push(blockBlobClient.uploadBrowserData(file));
    }
    await Promise.all(promises);
    alert("File(s) uploaded :)");
  } catch (error) {
    alert(error.message);
  }
};

const registerUser = async () => {
  const endpoint = "https://doggo-share.azurewebsites.net/api/register_user";
  const email = emailInput.value;
  await fetch(endpoint + "?email=" + email);
  emailInput.value = "";
};

const refreshList = async () => {
  const endpoint = "https://doggo-share.azurewebsites.net/api/list";
  const response = await fetch(endpoint);
  const data = (await response.json()).data;
  fileTable.innerHTML = "";
  data.forEach((file) => {
    const row = fileTable.insertRow();

    const link = row.insertCell();
    link.innerHTML = `<a href=${file.link}>${file.fileName}</a>`;

    const status = row.insertCell();
    status.innerHTML = statusMappings[file.status];
  });
};

selectButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", uploadFiles);
registerButton.addEventListener("click", registerUser);

refreshList();
setInterval(refreshList, 5000);
