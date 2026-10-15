const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const ESTOCK_URL = process.env.ESTOCK_URL || 'https://estock-mobile.demachine.co/';
const ESTOCK_INSTANCIA = process.env.ESTOCK_INSTANCIA || 'MBR';
const ESTOCK_USER = process.env.ESTOCK_USER || '';
const ESTOCK_PASS = process.env.ESTOCK_PASS || '';

console.log('CONFIG eStock:', ESTOCK_URL, ESTOCK_INSTANCIA, ESTOCK_USER ? 'USER OK' : 'USER FALTA');

app.get('/', (req, res) => {
  res.send(`<h1>STOCKOS V10 VERDE ACTIVO - MAXIMA REAL</h1><p>Instancia: ${ESTOCK_INSTANCIA}</p><p><a href="/api/status">Ver Status</a> | <a href="/api/test">Probar API</a></p>`);
});

app.get('/api/test', (req, res) => {
  res.json({ status: 'OK', mensaje: 'RENDER VERDE V10 - MAXIMA REAL', version: 'V10', instancia: ESTOCK_INSTANCIA });
});

app.get('/api/status', (req, res) => {
  res.json({
    estock_url: ESTOCK_URL,
    instancia: ESTOCK_INSTANCIA,
    user: ESTOCK_USER,
    pass_configurado: !!ESTOCK_PASS,
    modo: 'MAXIMA_REAL'
  });
});

// ENDPOINT REAL DE ESCANEO
app.post('/api/escanear', async (req, res) => {
  try {
    const { codigo, bodega } = req.body;
    if (!codigo) return res.status(400).json({ error: 'Falta codigo' });

    // Aqui hacemos login real a eStock Mobile
    const loginUrl = `${ESTOCK_URL.replace(/\/$/, '')}/api/login`;
    
    // Intento de login
    let loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instancia: ESTOCK_INSTANCIA,
        usuario: ESTOCK_USER,
        password: ESTOCK_PASS,
        user: ESTOCK_USER,
        pass: ESTOCK_PASS
      })
    });

    let dataLogin = await loginRes.text();
    
    res.json({
      modo: 'MAXIMA_REAL_CONECTADO',
      codigo_solicitado: codigo,
      bodega: bodega || '01',
      instancia: ESTOCK_INSTANCIA,
      respuesta_estock_raw: dataLogin.substring(0, 1000),
      mensaje: 'Conectado a eStock. Si ves token/datos aqui, ya es REAL. Ahora conectamos consulta de stock.'
    });

  } catch (e) {
    res.status(500).json({ error: e.message, modo: 'ERROR_CONEXION_ESTOCK' });
  }
});

app.listen(PORT, () => {
  console.log(`STOCKOS VERDE corriendo en puerto ${PORT}`);
});
