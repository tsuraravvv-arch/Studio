import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { parseFile } from "music-metadata";
const songs=JSON.parse(await readFile('src/features/music/songs.json','utf8'));
const seen=new Set();
const escape=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
for(const song of songs){
 assert.match(song.id,/^s-\d{3}$/);assert(!seen.has(song.id));seen.add(song.id);
 for(const key of ['cover','audio','lyrics','caption','article']){assert(song[key].includes(song.id));await access('docs'+song[key]);await access('public'+song[key]);}
 const metadata=await parseFile('docs'+song.audio);assert(metadata.format.duration>0);
 const detail=await readFile(`docs/music/${song.id}/index.html`,'utf8');
 assert(detail.includes(escape(song.title)));assert(detail.includes(song.cover));
 const caption=await readFile('docs'+song.caption,'utf8');assert(detail.includes(escape(caption)),'Caption must preserve the original text');
 const article=await readFile('docs'+song.article,'utf8');
 const lines=article.split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!/^\\?#{1,6}\s/.test(line));
 if(!lines.length||lines.every(line=>line.includes('準備中')))assert(detail.includes('楽曲紹介は準備中です。')); 
 for(const key of ['lyrics','caption']) assert.deepEqual(await readFile('docs'+song[key]),await readFile('public'+song[key]));
 console.log(`${song.id}: assets, metadata, lyrics, caption and detail OK`);
}
