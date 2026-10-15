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
const DEMACHINE_TOKEN = process.env.DEMACHINE_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIyNywiZXhwIjoxNzkyNjg5NDY1fQ.lmvtBtcohKBdcLKF0HwbZIfiCVi7b1__RWXAci6FVFg';
const DEMACHINE_API = 'https://mbr.demachine.co/api/products/search';

app.get('/api/status', (req,res)=>{
  res.json({
    estock_url: ESTOCK_URL,
    instancia: ESTOCK_INSTANCIA,
    user: ESTOCK_USER,
    pass_configurado: !!ESTOCK_PASS,
    token_configurado: !!DEMACHINE_TOKEN,
    modo: 'MAXIMA_REAL_V10_CONECTADO'
  })
});

app.get('/api/test', (req,res)=>{
  res.json({status:'OK', mensaje:'V10 MAXIMA REAL CON DEMACHINE', instancia: ESTOCK_INSTANCIA})
});

app.post('/api/escanear', async (req,res)=>{
  try{
    const {codigo} = req.body;
    if(!codigo) return res.json({error:'codigo vacio'});
    
    console.log(`Buscando REAL: ${codigo} en DEMACHINE MBR...`);

    const r = await fetch(DEMACHINE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEMACHINE_TOKEN}`,
        'Origin': 'https://estock-mobile.demachine.co'
      },
      body: JSON.stringify({
        str: codigo,
        color: "",
        talla: "",
        error: ""
      })
    });

    const data = await r.json();
    
    res.json({
      codigo: codigo,
      instancia: ESTOCK_INSTANCIA,
      fuente: 'DEMACHINE MBR REAL',
      total_encontrados: data.data ? data.data.length : 0,
      productos: data.data || [],
      modo: 'MAXIMA_REAL_CONECTADO'
    });

  }catch(e){
    console.error(e);
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
#res{margin-top:18px;background:#000;padding:15px;border-radius:10px;min-height:60px;white-space:pre-wrap;word-break:break-all;font-size:13px}
.badge{background:#22c55e;color:#000;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold}
.prod{background:#111827;margin:8px 0;padding:10px;border-radius:8px;border-left:4px solid #22c55e}
</style>
</head>
<body>
<div class="card">
<div class="verde">STOCKOS V10 - MAXIMA REAL</div>
<div class="sub">Instancia: ${ESTOCK_INSTANCIA} | MBR REAL<br><span class="badge">CONECTADO A DEMACHINE</span></div>
<input id="codigo" placeholder="Escanea código EAN / REF / NIKE">
<button onclick="escanear()">ESCANEAR MAXIMA REAL</button>
<div id="res">Listo para escanear...</div>
</div>
<script>
async function escanear(){
  let c=document.getElementById('codigo').value.trim();
  if(!c) return alert('Pon código');
  document.getElementById('res').innerHTML='Buscando '+c+' en DEMACHINE MBR REAL...';
  try{
    let r=await fetch('/api/escanear',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({codigo:c})});
    let j=await r.json();
    let html = '<b>Código:</b> '+j.codigo+'<br><b>Encontrados:</b> '+(j.total_encontrados||0)+'<br><br>';
    if(j.productos && j.productos.length>0){
      j.productos.forEach(p=>{
        html += '<div class=prod><b>'+ (p.name||p.reference||'') +'</b><br>Ref: '+(p.reference||'')+'<br>Color: '+(p.color||'')+' Talla: '+(p.size||'')+'<br>Stock: <b style=color:#22c55e>'+ (p.stock||0) +'</b> Precio: <b>$'+(p.price||p.pvp||'--')+'</b></div>';
      });
    } else {
      html += 'Sin resultados. JSON: '+JSON.stringify(j).substring(0,500);
    }
    document.getElementById('res').innerHTML=html;
  }catch(e){
    document.getElementById('res').innerHTML='Error: '+e.message;
  }
}
document.getElementById('codigo').addEventListener('keypress',function(e){if(e.key==='Enter') escanear()});
</script>
</body>
</html>`);
});

app.listen(PORT, ()=>{console.log('STOCKOS V10 VERDE MAXIMA REAL CONECTADO en puerto '+PORT)});
