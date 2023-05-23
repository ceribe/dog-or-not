const { BlobServiceClient } = require("@azure/storage-blob");

const refreshListButton = document.getElementById("refresh-list");
const selectButton = document.getElementById("select-button");
const fileInput = document.getElementById("file-input");

const website = "https://dogornotdbsa.blob.core.windows.net/"
const blobSasUrl = website + "?sv=2017-11-09\u0026ss=bqtf\u0026srt=sco\u0026sp=rwac\u0026se=2024-03-21T00:00:00Z\u0026st=2023-03-21T00:00:00Z\u0026spr=https\u0026sig=QkZhuVmi7L076GuA2tP8lHy9nbC3kvZxB7hnRbz%2F8tM%3D";
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