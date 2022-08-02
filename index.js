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
  if (!parsedData) return res.status(200).json([]);
  next();
};

const verifyId = async (req, res, next) => {
  const { id } = req.params;
  const data = await fs.readFile(mainFile);
  const parsedData = JSON.parse(data);
  const people = parsedData.find((p) => p.id === Number(id));

  if (!people) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
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

app.get('/talker/:id', verifyId, async (req, res) => {
  const { id } = req.params;
  const data = await fs.readFile(mainFile);
  const parsedData = JSON.parse(data);
  const people = parsedData.find((p) => p.id === Number(id));
  res.status(200).json(people);
});

app.listen(PORT, () => {
  console.log('Online');
});
