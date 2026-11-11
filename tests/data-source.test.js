import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fetchSheet,sourceDescription} from '../dist/data-source.js';
const csv=await readFile(new URL('../docs/questions-template.csv',import.meta.url),'utf8');
test('Google fetch validates remote data, records origin and bypasses stale HTTP cache',async()=>{
 let requested;
 const result=await fetchSheet('https://docs.google.com/spreadsheets/d/example/edit#gid=2',async(url,options)=>{requested={url,options};return {ok:true,text:async()=>csv};});
 assert.equal(requested.url,'https://docs.google.com/spreadsheets/d/example/export?format=csv&gid=2');
 assert.equal(requested.options.cache,'no-store');assert.equal(requested.options.credentials,'omit');
 assert.equal(result.questions.length,48);assert.equal(result.meta.kind,'google');assert.equal(result.meta.url,requested.url);assert.ok(Date.parse(result.meta.loadedAt));
});
test('Network and invalid CSV errors are surfaced rather than treated as demo data',async()=>{
 await assert.rejects(fetchSheet('https://docs.google.com/spreadsheets/d/example/edit',async()=>({ok:false,status:403})),/403/);
 await assert.rejects(fetchSheet('https://docs.google.com/spreadsheets/d/example/edit',async()=>({ok:true,text:async()=>'<html>Google login</html>'})),/столбцы/);
});
test('UI distinguishes demo, imported CSV, Google cache, failure and loading',()=>{
 assert.equal(sourceDescription(null,null).kind,'demo');
 assert.equal(sourceDescription([{}],{kind:'csv'}).kind,'csv');
 assert.equal(sourceDescription([{}],{kind:'google'},false,'offline').kind,'google');
 assert.match(sourceDescription([{}],{kind:'google'},false,'offline').title,/сохранённая копия/);
 assert.equal(sourceDescription(null,null,false,'offline').kind,'error');
 assert.equal(sourceDescription(null,null,true).kind,'loading');
});
