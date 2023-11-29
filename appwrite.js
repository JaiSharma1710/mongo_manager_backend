const { Client, Storage, InputFile, ID } = require('node-appwrite');

const uploadFileToAppwrite = async (csvData) => {
  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APP_WRITE_PROJECT_ID)
    .setKey(process.env.APP_WRITE_KEY);

  const storage = new Storage(client);
  const fileData = await storage.createFile(
    process.env.APP_WRITE_BUCKET_ID,
    ID.unique(),
    InputFile.fromPlainText(csvData, 'data.csv'),
  );
  return fileData;
};

const downloadFileFromAppwrite = async (fileId) => {
  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APP_WRITE_PROJECT_ID)
    .setKey(process.env.APP_WRITE_KEY);

  const storage = new Storage(client);

  const result = await storage.getFileDownload(
    process.env.APP_WRITE_BUCKET_ID,
    fileId,
  );
  return result;
};

module.exports = { uploadFileToAppwrite, downloadFileFromAppwrite };
