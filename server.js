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

app.get('/api/status', (req,res)=>{
  res.json({
    estock_url: ESTOCK_URL,
    instancia: ESTOCK_INSTANCIA,
    user: ESTOCK_USER,
    pass_configurado: !!ESTOCK_PASS,
    modo: 'MAXIMA_REAL_V10'
  })
});

app.get('/api/test', (req,res)=>{
  res.json({status:'OK', mensaje:'V10 MAXIMA REAL', instancia: ESTOCK_INSTANCIA})
});

app.post('/api/escanear', async (req,res)=>{
  try{
    const {codigo} = req.body;
    // Aqui luego conectamos el fetch REAL a eStock
    res.json({
      codigo: codigo,
      instancia: ESTOCK_INSTANCIA,
      usuario: ESTOCK_USER,
      stock: 'CONECTANDO A ESTOCK REAL...',
      mensaje: `Buscando ${codigo} en MAXIMA MBR`,
      modo: 'MAXIMA_REAL'
    });
  }catch(e){
    res.status(500).json({error:e.message})
  }
});

app.get('/', (req,res)=>{
  res.send(`<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>STOCKOS V10</title>
<style>
body{font-family:Arial;background:#0f172a;color:#fff;padding:20px;margin:0}
.card{background:#1e293b;padding:20px;border-radius:15px;max-width:500px;margin:auto;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.verde{color:#22c55e;font-weight:bold;font-size:26px;text-align:center;margin-bottom:10px}
.sub{color:#94a3b8;text-align:center;margin-bottom:20px}
input{width:100%;padding:16px;border-radius:10px;border:none;margin:10px 0;font-size:18px;box-sizing:border-box}
button{width:100%;padding:16px;background:#22c55e;color:#000;font-weight:bold;border:none;border-radius:10px;font-size:19px;cursor:pointer}
button:active{transform:scale(.98)}
#res{margin-top:18px;background:#000;padding:15px;border-radius:10px;min-height:60px;white-space:pre-wrap;word-break:break-all}
.badge{background:#22c55e;color:#000;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold}
</style>
</head>
<body>
<div class="card">
<div class="verde">STOCKOS V10 - MAXIMA REAL</div>
<div class="sub">Instancia: ${ESTOCK_INSTANCIA} | Usuario: ${ESTOCK_USER} <br><span class="badge">LIVE</span></div>
<input id="codigo" placeholder="Escanea código EAN / REF">
<button onclick="escanear()">ESCANEAR MAXIMA REAL</button>
<div id="res">Listo para escanear...</div>
</div>
<script>
async function escanear(){
  let c=document.getElementById('codigo').value.trim();
  if(!c) return alert('Pon código');
  document.getElementById('res').innerHTML='Buscando '+c+' en MBR...';
  try{
    let r=await fetch('/api/escanear',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({codigo:c})});
    let j=await r.json();
    document.getElementById('res').innerHTML=JSON.stringify(j,null,2);
  }catch(e){
    document.getElementById('res').innerHTML='Error: '+e.message;
  }
}
document.getElementById('codigo').addEventListener('keypress',function(e){if(e.key==='Enter') escanear()});
</script>
</body>
</html>`);
});

app.listen(PORT, ()=>{console.log('STOCKOS V10 VERDE MAXIMA REAL en puerto '+PORT)});
