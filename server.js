// Golden Leaf Survivors multiplayer server. No npm install needed (Node 18+).
// Serves index.html and relays player positions over WebSocket at /ws?room=CODE
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000,MAX=16,rooms=new Map();let nid=1;
const server=http.createServer((req,res)=>{
  if(req.url==='/'||req.url.startsWith('/index.html')){
    fs.readFile(path.join(__dirname,'index.html'),(e,d)=>{
      if(e){res.writeHead(404);return res.end('index.html not found')}
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(d)});
  }else if(req.url==='/health'){res.end('ok')}
  else{res.writeHead(404);res.end('not found')}
});
function send(sock,data,op){
  const p=Buffer.isBuffer(data)?data:Buffer.from(data);let h;
  if(p.length<126)h=Buffer.from([128|(op||1),p.length]);
  else{h=Buffer.alloc(4);h[0]=128|(op||1);h[1]=126;h.writeUInt16BE(p.length,2)}
  try{sock.write(Buffer.concat([h,p]))}catch(e){}
}
server.on('upgrade',(req,sock)=>{
  const u=new URL(req.url,'http://x');
  if(u.pathname!=='/ws'||String(req.headers.upgrade).toLowerCase()!=='websocket'){sock.destroy();return}
  const code=(u.searchParams.get('room')||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12);
  if(!code){sock.destroy();return}
  let room=rooms.get(code);if(!room){room=new Map();rooms.set(code,room)}
  if(room.size>=MAX){sock.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');sock.destroy();return}
  const acc=crypto.createHash('sha1').update(req.headers['sec-websocket-key']+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+acc+'\r\n\r\n');
  const me={id:'p'+(nid++),pr:{}};room.set(sock,me);let buf=Buffer.alloc(0);
  sock.on('data',d=>{
    buf=Buffer.concat([buf,d]);if(buf.length>20000){sock.destroy();return}
    while(buf.length>=2){
      const op=buf[0]&15,masked=buf[1]&128;let len=buf[1]&127,off=2;
      if(len===126){if(buf.length<4)return;len=buf.readUInt16BE(2);off=4}else if(len===127){sock.destroy();return}
      if(buf.length<off+(masked?4:0)+len)return;
      const mask=masked?buf.slice(off,off+4):null;off+=masked?4:0;
      const pay=Buffer.from(buf.slice(off,off+len));if(mask)for(let i=0;i<len;i++)pay[i]^=mask[i&3];
      buf=buf.slice(off+len);
      if(op===8){sock.end();return}
      if(op===9){send(sock,pay,10);continue}
      if(op===1){try{const o=JSON.parse(pay.toString());if(o.t==='p'&&o.d&&typeof o.d==='object')me.pr=o.d}catch(e){}}
    }
  });
  const drop=()=>{room.delete(sock);if(!room.size)rooms.delete(code)};
  sock.on('close',drop);sock.on('error',drop);
});
setInterval(()=>{
  for(const room of rooms.values())for(const [sock] of room){
    const snap={};for(const [s2,o] of room)if(s2!==sock)snap[o.id]=o.pr;
    const txt=JSON.stringify({t:'s',d:snap});if(Buffer.byteLength(txt)<65000)send(sock,txt);
  }
},100);
server.listen(PORT,()=>console.log('Golden Leaf Survivors server running: http://localhost:'+PORT));
