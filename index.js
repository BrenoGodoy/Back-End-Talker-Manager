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

// Middlewares PeopleToAdd

const verifyPeopleToAdd1 = (req, res, next) => {
  const { authorization } = req.headers;
  const { name } = req.body;

  if (!authorization) return res.status(401).json({ message: 'Token não encontrado' });
  if (authorization.length !== 16) return res.status(401).json({ message: 'Token inválido' });
  if (!name) return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' }); 
  }
  next();
};

const verifyPeopleToAdd2 = (req, res, next) => {
  const { age, talk } = req.body;

  if (!age) return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  if (Number(age) <= 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }
  if (!talk) return res.status(400).json({ message: 'O campo "talk" é obrigatório' }); 
  if (!talk.watchedAt) {
    return res.status(400)
    .json({ message: 'O campo "watchedAt" é obrigatório' });
  }
  next();
};

const verifyPeopleToAdd3 = (req, res, next) => {
  const { talk } = req.body;
  const regex = new RegExp(/\w\w\/\w\w\/\w\w\w\w/);

  console.log(regex.test(talk.watchedAt));
  if (!regex.test(talk.watchedAt)) {
    return res.status(400)
    .json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }
  if (talk.rate === undefined) {
    return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  }
  if (talk.rate < 1 || talk.rate > 5) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  next();
};

// fim dos Middlewares PeopleToAdd

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

app.post('/talker', 
[verifyPeopleToAdd1, verifyPeopleToAdd2, verifyPeopleToAdd3], async (req, res) => {
  const { name, age, talk } = req.body;
  const data = await fs.readFile(mainFile);
  const parsedData = JSON.parse(data);

  const id = parsedData.length + 1;
  const peopleToAdd = { id, name, age, talk };
  const newData = [...parsedData, peopleToAdd];
  await fs.writeFile('./talker.json', JSON.stringify(newData));
  res.status(201).json(peopleToAdd); 
});

app.put('/talker/:id', 
[verifyPeopleToAdd1, verifyPeopleToAdd2, verifyPeopleToAdd3], async (req, res) => {
  const { id } = req.params;
  const { name, age, talk } = req.body;
  const data = await fs.readFile(mainFile);
  const parsedData = JSON.parse(data);
  const peopleIndex = parsedData.findIndex((p) => p.id === Number(id));
  const peopleId = peopleIndex + 1;

  parsedData[peopleIndex] = { id: peopleId, name, age, talk };
  await fs.writeFile('./talker.json', JSON.stringify(parsedData));
  res.status(200).json(parsedData[peopleIndex]);
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
