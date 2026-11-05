import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
 try{
  const url=new URL(req.url,'http://localhost');
  let requested=decodeURIComponent(url.pathname);
  if(requested==='/')requested='/index.html';
  const file=path.resolve(root,'.'+requested);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const content=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
  res.end(req.method==='HEAD'?undefined:content);
 }catch(error){res.writeHead(error instanceof URIError?400:404);res.end('Not found');}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Порт 3000 занят. Остановите другой сервер и повторите запуск.':error.message);process.exitCode=1;});
server.listen(3000,'127.0.0.1',()=>console.log('C# Lab: http://127.0.0.1:3000\nОстановить сервер: Ctrl+C'));
