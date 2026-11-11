import {questionsFromCSV,sheetURL} from './engine.js';
export async function fetchSheet(input, fetcher=fetch) {
 const url=sheetURL(input);
 const response=await fetcher(url,{signal:AbortSignal.timeout(15000),credentials:'omit',cache:'no-store'});
 if(!response.ok) throw Error(`Google вернул ошибку ${response.status}. Проверьте публикацию таблицы как CSV.`);
 const text=await response.text();
 if(text.length>4_000_000) throw Error('Файл слишком большой: максимум 4 МБ.');
 const questions=questionsFromCSV(text);
 return {questions,meta:{kind:'google',url,loadedAt:new Date().toISOString()}};
}
export function sourceDescription(bank,meta,loading=false,error='') {
 if(loading)return {title:'Обновление из Google Таблицы…',detail:'Получаем и проверяем CSV. Дождитесь завершения.',kind:'loading'};
 if(bank&&meta?.kind==='google')return {title:error?'Google Таблица · сохранённая копия':'Вопросы из Google Таблицы',detail:error?'Не удалось обновить. Используется последняя загруженная копия: '+error:'Источник: публичный CSV Google. Копия вопросов хранится в этом браузере.',kind:'google'};
 if(error)return {title:'Google Таблица недоступна',detail:error+' Подключите доступный источник. Тесты временно недоступны.',kind:'error'};
 if(bank)return {title:'Вопросы из CSV-файла',detail:'Файл импортирован вручную. Это локальная копия, без связи с Google.',kind:'csv'};
 return {title:'Демо · встроенные 48 вопросов',detail:'Источник: файл questions.js в репозитории. Google Таблица ещё не подключена.',kind:'demo'};
}
