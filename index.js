const express = require('express');
const DB = require('./db');
const cors = require('cors');
require('dotenv').config();
const { Parser } = require('@json2csv/plainjs');

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.post('/getCollections', async (req, res) => {
  const { mongoUri, dbName } = req.body;
  try {
    const { db } = await DB(mongoUri, dbName);
    const data = await db.listCollections().toArray();
    const collections = data.map((collection) => collection.name);
    return res.send({ collections });
  } catch (error) {
    return res
      .status(500)
      .json({ data: `connection to db failed ERROR_MESSAGE:${error}` });
  }
});

app.post('/runQuery', async (req, res) => {
  const {
    query,
    selected_db: { mongoUri, dbName },
  } = await req.body;

  try {
    if (!mongoUri) {
      return res.status(500).json({ message: 'no mongoUri found' });
    }

    let finalQuery = '';
    const { db } = await DB(mongoUri, dbName);

    //handling empty query case
    if (!query.trim()) {
      return res
        .status(500)
        .json({ message: 'empty query cannot be executed' });
    }

    //handling ; ending case
    if (query.endsWith(';')) {
      return res.status(500).json({ message: 'query can not end with ";"' });
    }

    //handle starts with db.getCollection
    if (!query.startsWith('db.collection')) {
      return res.status(500).json({
        message:
          'query should start with "db.collection" example "db.collection("user").find()"',
      });
    }

    if (query.includes('ISODate')) {
      return res.status(500).json({
        message: 'replace "ISODate" with "new Date"',
      });
    }

    finalQuery = query.trim();
    const data = await eval(`${finalQuery}.toArray()`);

    if (!data.length) {
      return res.status(500).send({ message: 'no documents found' });
    }

    return res.json({ data });
  } catch (error) {
    return res.status(500).json({
      message: `some error occurred while executing ERROR_MESSAGE:${error}`,
    });
  }
});

app.post('/createCsv', async (req, res) => {
  const { mongoUri, dbName, query } = req.body;

  console.log(req.body);

  try {
    if (!mongoUri) {
      return res.status(500).json({ message: 'no mongoUri found' });
    }

    let finalQuery = '';
    const { db } = await DB(mongoUri, dbName);

    //handling empty query case
    if (!query.trim()) {
      return res
        .status(500)
        .json({ message: 'empty query cannot be executed' });
    }

    //handling ; ending case
    if (query.endsWith(';')) {
      return res.status(500).json({ message: 'query can not end with ";"' });
    }

    //handle starts with db.getCollection
    if (!query.startsWith('db.collection')) {
      return res.status(500).json({
        message:
          'query should start with "db.collection" example "db.collection("user").find()"',
      });
    }

    finalQuery = query.trim();
    const data = await eval(`${finalQuery}.toArray()`);
    const parser = new Parser({ header: true });
    const csvData = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Disposition', 'attachment;filename=data.csv');
    res.statusCode = 200; // OK
    res.end(csvData);
  } catch (error) {
    return res.status(500).json({
      message: `some error occurred while executing ERROR_MESSAGE:${error}`,
    });
  }
});

app.listen(9000, () => console.log('running on port 9000'));
