const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req,res)=>{
  if(fs.existsSync(path.join(__dirname,'public','index.html'))){
    res.sendFile(path.join(__dirname,'public','index.html'));
  } else {
    res.send('<h1>Grimmjow Pair Running - Add public/index.html</h1>');
  }
});

app.get('/pair', async (req,res)=>{
 let num = req.query.number?.replace(/[^0-9]/g,'');
 if(!num) return res.json({error:"دخل الرقم مع رمز البلد 212..."});
 try{
  const { state, saveCreds } = await useMultiFileAuthState('./session_'+num);
  const sock = makeWASocket({
   auth: state,
   logger: pino({level:"silent"}),
   browser: ["Ubuntu","Chrome","20.0.04"]
  });
  sock.ev.on('creds.update', saveCreds);
  if(!sock.authState.creds.registered){
   await new Promise(r=>setTimeout(r,1500));
   let code = await sock.requestPairingCode(num);
   return res.json({code: code});
  } else {
   return res.json({message:"already"});
  }
 } catch(e){
  return res.json({error: e.message});
 }
});

app.listen(process.env.PORT || 3000, ()=> console.log("Running"));
