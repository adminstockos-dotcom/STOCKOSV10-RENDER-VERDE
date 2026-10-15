const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json({limit:'50mb'}));
app.use(express.static(path.join(__dirname,'public')));

const DEMACHINE_BASE = 'https://mbr.demachine.co';
let DEMACHINE_TOKEN = process.env.DEMACHINE_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIyNywiZXhwIjoxNzkyNjkyMzk4fQ.Aut8OGm_jdZN_EDHVJn2nEy1hNx6rJRcMmrSqn2RTIs';

async function searchDemachine(query, page=1, perPage=30){
  const url = `${DEMACHINE_BASE}/api/product/index?Page=${page}&maxPerPage=${perPage}&search=${encodeURIComponent(query)}&warehouse=BODEGA`;
  const res = await axios.get(url, {
    headers: { 'Authorization': `Bearer ${DEMACHINE_TOKEN}`, 'Accept':'application/json' },
    timeout: 20000
  });
  const data = res.data;
  let results = data?.data?.results || [];
  const mapped = results.map(r => ({
    nombre: r.product,
    codigo: r.code,
    marca: r.brand,
    tipo: r.product_type,
    color: r.color,
    talla: r.size,
    precio: r.price,
    stock: r.quantity,
    imagen: r.image_pre ? DEMACHINE_BASE + r.image_pre : '',
  }));
  return { http: res.status, total: data.data?.info?.count || mapped.length, pages: data.data?.info?.pages || 1, products: mapped };
}

app.get('/api/search', async (req,res)=>{
  const q = req.query.q || '';
  const result = await searchDemachine(q, 1, 50);
  res.json(result);
});

app.get('/api/inventario-completo', async (req,res)=>{
  let all = [];
  for(let p=1;p<=5;p++){
    const r = await searchDemachine('', p, 100);
    all = all.concat(r.products);
    if(r.products.length < 100) break;
  }
  res.json({total: all.length, products: all});
});

app.get('*', (req,res)=> res.sendFile(path.join(__dirname,'public','index.html')));
const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log('V10.3 LIVE'));
