const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(require('cors')());
app.use(express.json({limit:'50mb'}));

const BASE = 'https://mbr.demachine.co';
const TOKEN = (process.env.DEMACHINE_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIyNywiZXhwIjoxNzkyNjkyMzk4fQ.Aut8OGm_jdZN_EDHVJn2nEy1hNx6rJRcMmrSqn2RTIs').trim();

async function fetchDemachine(query='', page=1, perPage=100){
  // Intenta 3 URLs diferentes
  const urls = [
    `${BASE}/api/product/index?Page=${page}&maxPerPage=${perPage}&search=${encodeURIComponent(query)}&warehouse=BODEGA`,
    `${BASE}/api/product/index?Page=${page}&maxPerPage=${perPage}&search=${encodeURIComponent(query)}`,
    `${BASE}/api/product/index?page=${page}&limit=${perPage}&search=${encodeURIComponent(query)}`
  ];
  for(let url of urls){
    try{
      const r = await fetch(url,{headers:{'Authorization':`Bearer ${TOKEN}`,'Accept':'application/json'}});
      const text = await r.text();
      let d; try{ d=JSON.parse(text); }catch(e){ continue; }
      const results = d?.data?.results || d?.results || d?.data || [];
      if(Array.isArray(results) && results.length>0){
        console.log('OK con URL:', url, 'count', results.length);
        return results.map(x=>({nombre:x.product||x.name,codigo:x.code,marca:x.brand,tipo:x.product_type,color:x.color,talla:x.size,precio:x.price,stock:x.quantity,imagen:x.image_pre?BASE+x.image_pre:(x.image?BASE+x.image:'')}));
      }
      if(d?.data?.info?.count>0 && results.length===0){
        // a veces results está en otro lado
        const alt = d.data.results||[];
        if(alt.length>0) return alt.map(x=>({nombre:x.product,codigo:x.code,marca:x.brand,tipo:x.product_type,color:x.color,talla:x.size,precio:x.price,stock:x.quantity,imagen:x.image_pre?BASE+x.image_pre:(x.image?BASE+x.image:'')}));
      }
    }catch(e){ console.log('Error URL', url, e.message); }
  }
  return [];
}

app.get('/api/search', async(req,res)=>{
  try{ const prods = await fetchDemachine(req.query.q||'',1,50); res.json({products:prods,total:prods.length}); }catch(e){res.status(500).json({error:e.message})}
});
app.get('/api/inventario-completo', async(req,res)=>{
  try{
    let all=[];
    for(let p=1;p<=10;p++){
      const prods = await fetchDemachine('',p,100);
      if(prods.length===0) break;
      all=all.concat(prods);
      if(prods.length<100) break;
    }
    console.log('TOTAL FINAL', all.length);
    res.json({products:all,total:all.length});
  }catch(e){res.status(500).json({error:e.message})}
});

app.get('/api/debug', async(req,res)=>{
  const url = `${BASE}/api/product/index?Page=1&maxPerPage=5&search=&warehouse=BODEGA`;
  const r = await fetch(url,{headers:{'Authorization':`Bearer ${TOKEN}`}});
  const txt = await r.text();
  res.send(`URL: ${url}<br>TOKEN: ${TOKEN.substring(0,20)}...<br>Status: ${r.status}<br>Body: ${txt.substring(0,2000)}`);
});

app.use(express.static(__dirname));
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'index.html')));
app.get('*', (req,res)=> res.sendFile(path.join(__dirname,'index.html')));

const PORT = process.env.PORT||10000;
app.listen(PORT,()=>console.log('V10.4 LIVE'));
