const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(express.json());

const TOKEN = process.env.DEMACHINE_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIyNywiZXhwIjoxNzkyNjg5NDY1fQ.lmvtBtcohKBdcLKF0HwbZIfiCVi7b1__RWXAci6FVFg';

app.post('/api/escanear', async (req,res)=>{
  try{
    let codigo = (req.body.codigo || 'a').toString().trim();
    if(!codigo) codigo='a';
    console.log('BUSCANDO MBR REAL:', codigo);
    
    const url = 'https://mbr.demachine.co/api/products/search';
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'Origin': 'https://estock-mobile.demachine.co',
        'Referer': 'https://estock-mobile.demachine.co/',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({ str: codigo, color: "", talla: "", error: "" })
    });
    
    const texto = await resp.text();
    console.log('RESPUESTA MBR:', texto.substring(0,500));
    
    let json;
    try { json = JSON.parse(texto); } 
    catch(e){ 
      return res.json({ 
        codigo, 
        total:0, 
        http: resp.status, 
        error_parse: e.message,
        respuesta_html: texto.substring(0,2000),
        productos: [] 
      }); 
    }
    
    res.json({
      codigo,
      total: json.data ? json.data.length : 0,
      http: resp.status,
      productos: json.data || [],
      raw: json
    });
    
  }catch(err){ 
    console.log('ERROR:', err);
    res.status(500).json({error: err.message, stack: err.stack}) 
  }
});

app.get('/', (req,res)=>{
  res.send(`<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>STOCKOS V10.2</title>
<style>body{font-family:Arial;background:#0f172a;color:#fff;padding:15px}.card{background:#1e293b;padding:20px;border-radius:15px;max-width:700px;margin:auto}input{width:100%;padding:16px;border-radius:10px;border:2px solid #22c55e;margin:15px 0;font-size:18px;background:#0f172a;color:#fff;box-sizing:border-box}button{width:100%;padding:16px;background:#22c55e;color:#000;font-weight:bold;border:none;border-radius:10px;font-size:18px;margin:5px 0}#res{background:#000;padding:12px;border-radius:10px;min-height:400px;max-height:80vh;overflow:auto;font-size:12px;white-space:pre-wrap}.prod{background:#1e293b;margin:6px 0;padding:10px;border-radius:8px;border-left:4px solid #22c55e}</style></head><body>
<div class="card">
<h2 style="color:#22c55e;text-align:center">STOCKOS V10.2 - MAXIMA REAL DIAGNOSTICO</h2>
<input id="codigo" placeholder="Escribe referencia o deja vacio" value="a">
<button onclick="escanear()">ESCANEAR MAXIMA REAL</button>
<button onclick="cargarTodo()" style="background:#fff">CARGAR TODO EL INVENTARIO</button>
<div id="res">Listo...</div>
</div>
<script>
async function escanear(){
  let c=document.getElementById('codigo').value.trim()||'a';
  let div=document.getElementById('res');
  div.innerHTML='BUSCANDO ['+c+'] en MBR REAL...';
  try{
    let r=await fetch('/api/escanear',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({codigo:c})});
    let j=await r.json();
    console.log(j);
    let html='<b style=color:#22c55e>HTTP: '+j.http+' | TOTAL: '+(j.total||0)+'</b><br><br>';
    if(j.respuesta_html){
      html+='<b style=color:orange>MBR devolvio HTML (token vencido o bloqueado):</b><br><div style=background:#300;padding:10px;overflow:auto>'+j.respuesta_html.substring(0,3000)+'</div><br>';
      html+='<b>SOLUCION: Necesitamos nuevo TOKEN de demachine.co</b>';
    } else if(j.productos && j.productos.length){
      j.productos.forEach(p=>{
        html+='<div class=prod><b>'+ (p.reference||p.name||'REF') +'</b><br>'+ (p.name||'') +'<br>Color: '+(p.color||'-')+' Talla: '+(p.size||p.talla||'-')+'<br>Stock: <b style=color:#22c55e>'+(p.stock??0)+'</b> | Bodega: '+(p.warehouse||'-')+'</div>';
      });
    } else {
      html+='Sin productos. JSON: '+JSON.stringify(j).substring(0,3000);
    }
    div.innerHTML=html;
  }catch(e){ div.innerHTML='Error JS: '+e.message; }
}
function cargarTodo(){ document.getElementById('codigo').value='a'; escanear(); }
</script></body></html>`);
});
app.listen(PORT, ()=>console.log('V10.2 LISTO '+PORT));
