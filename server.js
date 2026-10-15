const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(express.json());

const DEMACHINE_TOKEN = process.env.DEMACHINE_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIyNywiZXhwIjoxNzkyNjg5NDY1fQ.lmvtBtcohKBdcLKF0HwbZIfiCVi7b1__RWXAci6FVFg';
const DEMACHINE_API = 'https://mbr.demachine.co/api/products/search';

app.post('/api/escanear', async (req,res)=>{
  try{
    let {codigo} = req.body;
    codigo = (codigo || 'a').toString().trim();
    if(!codigo) codigo = 'a';
    console.log('BUSCANDO REAL MBR:', codigo);
    const r = await fetch(DEMACHINE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEMACHINE_TOKEN}`,
        'Origin': 'https://estock-mobile.demachine.co'
      },
      body: JSON.stringify({ str: codigo, color: "", talla: "", error: "" })
    });
    const data = await r.json();
    res.json({
      codigo,
      total: data.data ? data.data.length : 0,
      http: r.status,
      productos: data.data || []
    });
  }catch(e){ res.status(500).json({error:e.message}) }
});

app.get('/', (req,res)=>{
  res.send(`<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>STOCKOS V10.1 FIX</title>
<style>body{font-family:Arial;background:#0f172a;color:#fff;padding:15px} .card{background:#1e293b;padding:20px;border-radius:15px;max-width:600px;margin:auto} input{width:100%;padding:16px;border-radius:10px;border:2px solid #22c55e;margin:15px 0;font-size:18px;background:#0f172a;color:#fff;box-sizing:border-box} button{width:100%;padding:16px;background:#22c55e;color:#000;font-weight:bold;border:none;border-radius:10px;font-size:18px;margin:5px 0} #res{background:#000;padding:12px;border-radius:10px;min-height:300px;max-height:70vh;overflow:auto;font-size:12px;white-space:pre-wrap} .prod{background:#1e293b;margin:6px 0;padding:10px;border-radius:8px;border-left:4px solid #22c55e}</style></head><body>
<div class="card">
<h2 style="color:#22c55e;text-align:center">STOCKOS V10.1 FIX - MAXIMA REAL</h2>
<input id="codigo" placeholder="Escribe referencia o deja vacio y dale ESCANEAR" value="">
<button onclick="escanear()">ESCANEAR MAXIMA REAL</button>
<button onclick="cargarTodo()" style="background:#fff">CARGAR TODO EL INVENTARIO</button>
<div id="res">Listo. Dale a CARGAR TODO...</div>
</div>
<script>
async function escanear(){
  let c=document.getElementById('codigo').value.trim()||'a';
  let div=document.getElementById('res');
  div.innerHTML='BUSCANDO ['+c+']...';
  try{
    let r=await fetch('/api/escanear',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({codigo:c})});
    let j=await r.json();
    let html='<b style=color:#22c55e>ENCONTRADOS: '+(j.total||0)+' | HTTP: '+j.http+'</b><br><br>';
    if(j.productos && j.productos.length){
      j.productos.forEach(p=>{
        html+='<div class=prod><b>'+ (p.reference||p.name||'REF') +'</b><br>'+ (p.name||'') +'<br>Color: '+(p.color||'-')+' Talla: '+(p.size||p.talla||'-')+'<br>Stock: <b style=color:#22c55e>'+(p.stock??0)+'</b> | Bodega: '+(p.warehouse||'-')+'<br>Precio: '+(p.price||p.pvp||'--')+'</div>';
      });
    } else {
      html+='Sin datos. Respuesta: '+JSON.stringify(j).substring(0,1500);
    }
    div.innerHTML=html;
  }catch(e){ div.innerHTML='Error: '+e.message; }
}
function cargarTodo(){ document.getElementById('codigo').value='a'; escanear(); }
</script></body></html>`);
});
app.listen(PORT, ()=>console.log('V10.1 FIX LISTO en '+PORT));
