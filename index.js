const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const mainFile = './talker.json';
const verifyEmpty = async (req, res, next) => {
  const data = await fs.readFile(mainFile);
  const parsedData = JSON.parse(data);
  if (parsedData === []) return res.status(200).json([]);
  next();
};

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', verifyEmpty, async (req, res) => {
  const data = await fs.readFile(mainFile);
  const parsedData = JSON.parse(data);
  res.status(200).json(parsedData);
});

app.listen(PORT, () => {
  console.log('Online');
});
