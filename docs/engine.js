export const TOPICS = [
 {id:'basics',name:'Основы языка',icon:'{ }',desc:'Типы данных, переменные и операторы',color:'violet'},
 {id:'flow',name:'Управление потоком',icon:'↳',desc:'Условия, циклы и методы',color:'blue'},
 {id:'oop',name:'Объектная модель',icon:'◇',desc:'Классы, наследование и интерфейсы',color:'pink'},
 {id:'collections',name:'Коллекции и LINQ',icon:'[ ]',desc:'Данные, запросы и преобразования',color:'green'},
 {id:'errors',name:'Исключения и ресурсы',icon:'!',desc:'Обработка ошибок и работа с файлами',color:'orange'},
 {id:'async',name:'Асинхронность',icon:'⇄',desc:'Task, async / await и параллелизм',color:'cyan'}
];
export function parseCSV(text) {
 const rows=[]; let row=[],value='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else if(!quoted&&value!=='')throw Error('Кавычки внутри поля CSV');else quoted=!quoted;}else if(c===','&&!quoted){row.push(value);value='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);if(row.some(x=>x.trim()))rows.push(row);row=[];value='';}else value+=c;}
 if(quoted)throw Error('Не закрыты кавычки CSV');row.push(value);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
export function questionsFromCSV(text){
 const rows=parseCSV(text.replace(/^\uFEFF/,''));const header=rows.shift()?.map(x=>x.trim());const required=['id','topic','difficulty','question','a','b','c','d','correct','explanation'];
 if(!header||required.some(x=>!header.includes(x)))throw Error('Нужны столбцы: '+required.join(', '));
 const ids=new Set();const result=rows.map((r,i)=>{const v=Object.fromEntries(header.map((k,j)=>[k,(r[j]||'').trim()]));const q={id:v.id,topic:v.topic,difficulty:Number(v.difficulty),question:v.question,options:[v.a,v.b,v.c,v.d],correct:Number(v.correct)-1,explanation:v.explanation,code:v.code||''};
 if(!q.id||ids.has(q.id)||!TOPICS.some(t=>t.id===q.topic)||![1,2,3].includes(q.difficulty)||!q.question||q.options.some(x=>!x)||!['1','2','3','4'].includes(v.correct)||!q.explanation)throw Error('Ошибка в строке '+(i+2)+': проверьте ID, тему, сложность, варианты и номер ответа.');ids.add(q.id);return q;});
 if(!result.length)throw Error('В таблице нет вопросов');if(result.length>2000)throw Error('Максимум 2000 вопросов');return result;
}
export function selectNext(pool,used,level,random=Math.random){const left=pool.filter(q=>!used.includes(q.id));if(!left.length)return null;const distance=Math.min(...left.map(q=>Math.abs(q.difficulty-level)));const candidates=left.filter(q=>Math.abs(q.difficulty-level)===distance);return candidates[Math.floor(random()*candidates.length)];}
export function nextLevel(level,correct){return Math.max(1,Math.min(3,level+(correct?1:-1)));}
export function grade(percent){return percent>=85?5:percent>=65?4:percent>=45?3:2;}
export function sheetURL(input){const u=new URL(input);if(u.protocol!=='https:'||u.hostname!=='docs.google.com')throw Error('Укажите HTTPS-ссылку на docs.google.com');if(!/^\/spreadsheets\/(d|d\/e)\//.test(u.pathname))throw Error('Нужна ссылка на Google Таблицу');if(u.pathname.includes('/d/e/')){u.pathname=u.pathname.replace(/\/pubhtml$/,'/pub');u.searchParams.set('output','csv');}else{const id=u.pathname.match(/\/d\/([^/]+)/)?.[1];if(!id)throw Error('Не найден ID таблицы');const gid=u.searchParams.get('gid')||new URLSearchParams(u.hash.slice(1)).get('gid')||'0';return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/export?format=csv&gid=${encodeURIComponent(gid)}`;}u.hash='';return u.href;}
