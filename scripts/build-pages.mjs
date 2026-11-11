import {readdir,copyFile,writeFile} from 'node:fs/promises';
const dist=new URL('../dist/',import.meta.url),docs=new URL('../docs/',import.meta.url);
for(const file of await readdir(dist)){await copyFile(new URL(file,dist),new URL(file,docs));}
await writeFile(new URL('.nojekyll',docs),'');
console.log('GitHub Pages ready: docs/ (branch main)');
