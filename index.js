const express = require('express');
const bodyParser = require('body-parser');
const people = require('./talker.json');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', (req, res, next) => {
  if (people === '[]') {
    return res.status(200).send([]);
  }

  next();
}, 
(req, res) => {
  res.status(200).json(people);
});

app.listen(PORT, () => {
  console.log('Online');
});
