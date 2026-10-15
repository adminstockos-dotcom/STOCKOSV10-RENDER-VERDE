const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('<h1>STOCKOS V10 VERDE ACTIVO</h1><p>Deploy OK - 15/10/2026</p><a href="/api/test">Probar API</a>');
});

app.get('/api/test', (req, res) => {
  res.json({ status: 'OK', mensaje: 'RENDER VERDE', version: 'V10' });
});

app.listen(PORT, () => {
  console.log('STOCKOS VERDE corriendo en puerto ' + PORT);
});
