const { BlobServiceClient } = require("@azure/storage-blob");

const refreshListButton = document.getElementById("refresh-list");
const selectButton = document.getElementById("select-button");
const fileInput = document.getElementById("file-input");

const website = "https://doggosharedbsa.blob.core.windows.net/"
const sasToken = "?sv=2017-11-09\u0026ss=bqtf\u0026srt=sco\u0026sp=rwac\u0026se=2024-03-21T00:00:00Z\u0026st=2023-03-21T00:00:00Z\u0026spr=https\u0026sig=RGonmZso6RTPekfznldsxn1QwqoG87IV%2BU%2FWCt5EXEo%3D";
const blobSasUrl = website + sasToken;
const blobServiceClient = new BlobServiceClient(blobSasUrl);
const containerClient = blobServiceClient.getContainerClient("photos");
const uploadFiles = async () => {
    try {
        const promises = [];
        for (const file of fileInput.files) {
            const blockBlobClient = containerClient.getBlockBlobClient(file.name);
            promises.push(blockBlobClient.uploadBrowserData(file));
        }
        await Promise.all(promises);
        alert("File(s) uploaded :)");
    }
    catch (error) {
        alert(error.message);
    }
}

selectButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", uploadFiles);