const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(require('cors')());
app.use(express.json({limit:'50mb'}));

const BASE = 'https://mbr.demachine.co';
const TOKEN = process.env.DEMACHINE_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIyNywiZXhwIjoxNzkyNjkyMzk4fQ.Aut8OGm_jdZN_EDHVJn2nEy1hNx6rJRcMmrSqn2RTIs';

async function searchDemachine(q,page,perPage){
  const url = `${BASE}/api/product/index?Page=${page}&maxPerPage=${perPage}&search=${encodeURIComponent(q)}&warehouse=BODEGA`;
  const r = await fetch(url,{headers:{'Authorization':`Bearer ${TOKEN}`}});
  const d = await r.json();
  const results = d?.data?.results||[];
  return results.map(x=>({nombre:x.product,codigo:x.code,marca:x.brand,tipo:x.product_type,color:x.color,talla:x.size,precio:x.price,stock:x.quantity,imagen:x.image_pre?BASE+x.image_pre:(x.image?BASE+x.image:'')}));
}

app.get('/api/search', async(req,res)=>{
  try{ const prods = await searchDemachine(req.query.q||'',1,50); res.json({products:prods,total:prods.length}); }catch(e){res.status(500).json({error:e.message})}
});
app.get('/api/inventario-completo', async(req,res)=>{
  try{ let all=[]; for(let p=1;p<=5;p++){ const prods=await searchDemachine('',p,100); all=all.concat(prods); if(prods.length<100) break; } res.json({products:all,total:all.length}); }catch(e){res.status(500).json({error:e.message})}
});

// FRONTEND - SERVIR INDEX
app.use(express.static(__dirname));
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'index.html')));
app.get('*', (req,res)=> {
  const indexPath = path.join(__dirname,'index.html');
  if(fs.existsSync(indexPath)) return res.sendFile(indexPath);
  res.send(`<h1>STOCKOS V10.3 LIVE</h1><p>index.html no encontrado en ${__dirname}</p><p>Archivos: ${fs.readdirSync(__dirname).join(', ')}</p>`);
});

const PORT = process.env.PORT||10000;
app.listen(PORT,()=>console.log('LIVE V10.3 FINAL'));
