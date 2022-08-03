const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const mainFile = './talker.json';

// midllewares e funções
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

const verifyLogin = async (req, res, next) => {
  const validateEmail = (email) => {
    // Utilização do newRegex: https://stackabuse.com/validate-email-addresses-with-regular-expressions-in-javascript/
    const regex = new RegExp('[a-z0-9]+@[a-z]+[a-z]{2,3}');
    return regex.test(email);
  };

  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  } if (!validateEmail(email)) {
      return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  } if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  } if (password.length <= 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  next();
};

// https://www.delftstack.com/pt/howto/javascript/javascript-random-string/
const generateRandomString = (num) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result1 = '';
  const charactersLength = characters.length;
  for (let i = 0; i < num; i += 1) {
      result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result1;
};

// Começo das chamadas aos métodos
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

app.post('/login', verifyLogin, (req, res) => {
  const { email, password } = req.body;
  const login = { email, password };
  console.log(login);
  const token = generateRandomString(16);
  res.status(200).json({ token });
});

app.listen(PORT, () => {
  console.log('Online');
});
