const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwKey = 'fdadfdsafasgiujq-498ut';
const cors = require('cors');
const { Payment, MercadoPagoConfig } = require('mercadopago');

app.use(express.json());
app.use(cors());

const client = new MercadoPagoConfig({
  accessToken:
    'APP_USR-5142954928151152-080412-f0ae0dde25cad8b7689e7318abed1e2f-529572815',
});

const payment = new Payment(client);

mongoose
  .connect('mongodb://localhost:27017/TestMercadoPago')
  .then()
  .catch((err) => console.log(err));

const user = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', user);

app.get('/', (req, res) => {
  res.send('oi');
});

app.post('/user', async (req, res) => {
  let { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400), res.send('Algum parametro esta vazio.');

  try {
    const user = await User.findOne({ email });
    if (user) return res.status(400), res.send('Email já cadastrado.');

    password = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password });
    await newUser.save();

    return res.status(200), res.send('Usuário criado com sucesso!');
  } catch (err) {
    return res.status(500), res.send('Erro interno');
  }
});

app.delete('/user/:email', async (req, res) => {
  try {
    await User.findOneAndDelete({ email: req.params.email });
    return res.status(200), res.send('Usuário deletado.');
  } catch (err) {
    return res.status(500), res.send('Erro interno.');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404), res.send('Email nao cadastrado');

  const passValid = await bcrypt.compare(password, user.password);
  if (!passValid) return res.status(400), res.send('Senha incorreta');

  const token = jwt.sign({ email }, jwKey, { expiresIn: '24h' });

  return res.status(200), res.send(token);
});

app.post('/payment', async (req, res) => {
  const { email, cpf, amount, description } = req.body;

  payment
    .create({
      body: {
        transaction_amount: parseFloat(amount),
        description: description,
        payment_method_id: 'pix',
        notification_url: 'http://192.241.128.162:8000/not',
        payer: {
          email: email,
          identification: {
            type: 'CPF',
            number: cpf,
          },
        },
      },
      requestOptions: { idempotencyKey: Date.now() },
    })
    .then((result) => res.send(result))
    .catch((error) => res.send(error));
});

app.post('/not', (req, res) => {
  const id = req.query.id;

  setTimeout(() => {
    const filtro = {
      'order.id': id,
    };

    payment
      .search({ qs: filtro })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }, 20000);

  res.send('Ok');
});

module.exports = app;
