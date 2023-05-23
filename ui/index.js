const { BlobServiceClient } = require("@azure/storage-blob");

const createContainerButton = document.getElementById("create-container-button");
const deleteContainerButton = document.getElementById("delete-container-button");
const selectButton = document.getElementById("select-button");
const fileInput = document.getElementById("file-input");
const listButton = document.getElementById("list-button");
const deleteButton = document.getElementById("delete-button");
const status = document.getElementById("status");
const fileList = document.getElementById("file-list");

const reportStatus = message => {
    status.innerHTML += `${message}<br/>`;
    status.scrollTop = status.scrollHeight;
}

const website = "https://dogornotdbsa.blob.core.windows.net/"
const blobSasUrl = website + "?sv=2022-07-29\u0026ss=bqtf\u0026srt=sco\u0026sp=rwac\u0026se=2024-03-21T00:00:00Z\u0026st=2023-03-21T00:00:00Z\u0026spr=https\u0026sig=LNC6QDK7zodSqJbrHEdmRPNOnzEJps5aUwMYLJuq3Ts%3D";
const blobServiceClient = new BlobServiceClient(blobSasUrl);
const containerClient = blobServiceClient.getContainerClient("photos");
const uploadFiles = async () => {
    try {
        reportStatus("Uploading files...");
        const promises = [];
        for (const file of fileInput.files) {
            const blockBlobClient = containerClient.getBlockBlobClient(file.name);
            promises.push(blockBlobClient.uploadBrowserData(file));
        }
        await Promise.all(promises);
        reportStatus("Done.");
        listFiles();
    }
    catch (error) {
            reportStatus(error.message);
    }
}

selectButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", uploadFiles);