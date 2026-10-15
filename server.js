const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(express.json());

const ESTOCK_INSTANCIA = process.env.ESTOCK_INSTANCIA || 'MBR';
const DEMACHINE_TOKEN = process.env.DEMACHINE_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIyNywiZXhwIjoxNzkyNjg5NDY1fQ.lmvtBtcohKBdcLKF0HwbZIfiCVi7b1__RWXAci6FVFg';
const DEMACHINE_API = 'https://mbr.demachine.co/api/products/search';

app.get('/api/status', (req,res)=>{ res.json({instancia: ESTOCK_INSTANCIA, token: !!DEMACHINE_TOKEN, modo:'V10.1 FIX'}) });
app.get('/api/test', (req,res)=>{ res.json({status:'OK'}) });

app.post('/api/escanear', async (req,res)=>{
  try{
    let {codigo} = req.body;
    codigo = (codigo || '').toString().trim();
    if(!codigo) codigo = 'a'; // si viene vacio trae todo
    
    console.log(`Buscando REAL: [${codigo}]`);
    const r = await fetch(DEMACHINE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEMACHINE_TOKEN}`,
        'Origin': 'https://estock-mobile.demachine.co'
      },
      body: JSON.stringify({ str: codigo, color: "", talla: "", error: "" })
    });
    const text = await r.text();
    let data;
    try{ data = JSON.parse(text); } catch { data = { raw: text } }
    
    res.json({
      codigo: codigo,
      http_status: r.status,
      total_encontrados: data.data ? data.data.length : 0,
      productos: data.data ? data.data.slice(0,100) : [],
      full: data
    });
  }catch(e){ res.status(500).json({error:e.message}) }
});

app.get('/', (req,res)=>{
  res.send(`<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>STOCKOS V10.1</title>
<style>
body{font-family:Arial;background:#0f172a;color:#fff;padding:15px;margin:0}
.card{background:#1e293b;padding:20px;border-radius:15px;max-width:600px;margin:auto}
.verde{color:#22c55e;font-weight:bold;font-size:24px;text-align:center}
input{width:100%;padding:16px;border-radius:10px;border:2px solid #22c55e;margin:15px 0;font-size:18px;box-sizing:border-box;background:#0f172a;color:#fff}
button{width:100%;padding:16px;background:#22c55e;color:#000;font-weight:bold;border:none;border-radius:10px;font-size:18px;cursor:pointer;margin:5px 0}
#res{margin-top:15px;background:#000;padding:12px;border-radius:10px;min-height:300px;max-height:70vh;overflow:auto;font-size:12px;white-space:pre-wrap}
.prod{background:#1e293b;margin:6px 0;padding:10px;border-radius:8px;border-left:4px solid #22c55e}
</style></head><body>
<div class="card">
<div class="verde">STOCKOS V10.1 FIX - MAXIMA REAL</div>
<div style="text-align:center;color:#94a3b8;font-size:12px;margin:5px">MBR REAL CONECTADO - Si no escribes nada trae TODO</div>
<input id="codigo" placeholder="Escribe NIKE, REF, o deja vacío y dale ESCANEAR" value="">
<button onclick="escanear()">ESCANEAR MAXIMA REAL</button>
<button onclick="cargarTodo()" style="background:#fff;color:#000">CARGAR TODO EL INVENTARIO MBR</button>
<div id="res">Listo. Escribe algo y dale al botón verde...</div>
</div>
<script>
async function escanear(){
  let c=document.getElementById('codigo').value.trim();
  let div=document.getElementById('res');
  if(!c) c='a';
  div.innerHTML='BUSCANDO ['+c+'] en DEMACHINE MBR REAL... espera 3 seg...';
  try{
    let r=await fetch('/api/escanear',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({codigo:c})});
    let j=await r.json();
    console.log(j);
    if(j.error){ div.innerHTML='ERROR: '+j.error; return; }
    let html = '<b style=color:#22c55e>ENCONTRADOS: '+(j.total_encontrados||0)+' | HTTP: '+j.http_status+'</b><br><br>';
    if(j.productos && j.productos.length>0){
      j.productos.forEach(p=>{
        html += '<div class=prod><b>'+ (p.reference||p.name||'SIN NOMBRE') +'</b><br><small>'+ (p.name||'') +'</small><br>Color: '+(p.color||'-')+' Talla: '+(p.size||p.talla||'-')+'<br>Stock: <b style=color:#22c55e>'+(p.stock ?? p.cantidad ?? 0)+'</b> | Bodega: '+(p.warehouse||p.bodega||'-')+'<br>Precio: $'+(p.price||p.pvp||p.precio||'--')+'</div>';
      });
    } else {
      html += 'Sin productos. Respuesta completa:<br>'+JSON.stringify(j.full||j).substring(0,2000);
    }
    div.innerHTML=html;
  }catch(e){ div.innerHTML='Error JS: '+e.message; }
}
function cargarTodo(){ document.getElementById('codigo').value='a'; escanear(); }
document.getElementById('codigo').addEventListener('keypress',function(e){if(e.key==='Enter') escanear()});
</script></body></html>`);
});
app.listen(PORT, ()=>{console.log('V10.1 FIX en '+PORT)});
