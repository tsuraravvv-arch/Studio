// Run against a local dev server; optionally set PLAYWRIGHT_MODULE and CHROMIUM_PATH.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
try {
 const page = await browser.newPage({ viewport: {width:1440,height:1000}, acceptDownloads:true });
 const errors=[]; page.on('pageerror', e=>errors.push(e.message));
 page.on('console', m=>{if(m.type()==='error') errors.push(m.text());});
 await page.addInitScript(() => {
  const nativeCreate=URL.createObjectURL.bind(URL), names=new Map();
  URL.createObjectURL=blob=>{ const url=nativeCreate(blob); names.set(url,blob.name); return url; };
  const NativeImage=window.Image;
  window.Image=class extends NativeImage {
   set src(url) { if(names.get(url)?.startsWith('slow')) setTimeout(()=>{super.src=url;},400); else super.src=url; }
   get src(){return super.src;}
  };
 });
 await page.goto(`${process.env.TEST_BASE_URL || 'http://localhost:3000'}/tools/x-carousel-splitter/`);
 const save=page.getByRole('button',{name:'すべて保存',exact:true}), split=page.getByRole('button',{name:'分割する',exact:true});
 const input=page.locator('input[type=file]'), count=page.getByLabel('分割枚数',{exact:true}), thumbs=page.locator('.xcs-source-card');
 assert.equal(await save.isDisabled(),true);
 assert.equal(await page.locator('.xcs-results').count(),0);
 const files=await page.evaluate(()=>[50,100,150].map(b=>{
  const c=document.createElement('canvas'); c.width=1920;c.height=1080;const ctx=c.getContext('2d');
  for(let x=0;x<1920;x++){ctx.fillStyle=`rgb(${x%256},${Math.floor(x/256)},${b})`;ctx.fillRect(x,0,1,1080);}
  return c.toDataURL().split(',')[1];
 }));
 const file=(i,name)=>({name,mimeType:'image/png',buffer:Buffer.from(files[i],'base64')});
 async function waitSources(n){await page.waitForFunction(n=>document.querySelectorAll('.xcs-source-card').length===n,n);}
 async function preview(order,n){
  await page.waitForTimeout(80);
  await page.locator('.xcs-live-preview canvas').evaluate((c,{order,n})=>{
   const data=c.getContext('2d').getImageData(0,0,1920,1).data;
   for(let i=0;i<n;i++) for(let x=Math.round(i*1920/n);x<Math.round((i+1)*1920/n);x++) {
    if(data[x*4]!==x%256||data[x*4+1]!==Math.floor(x/256)||data[x*4+2]!==order[i%order.length]) throw Error(`preview pixel ${x}, slice ${i}`);
   }
  },{order,n});
 }
 async function output(order,n){
  await count.fill(String(n)); await preview(order,n); await split.click();
  await page.waitForFunction(()=>!document.querySelector('.xcs-save-all-button').disabled);
  const downloads=[]; const listener=d=>downloads.push(d);page.on('download',listener);
  await save.click();
  for(let i=0;i<100&&downloads.length<n;i++) await page.waitForTimeout(100);
  await page.waitForTimeout(250);page.off('download',listener);
  assert.equal(downloads.length,n);
  for(let i=0;i<n;i++){
   assert.equal(downloads[i].suggestedFilename(),`carousel-${String(i+1).padStart(2,'0')}.png`);
   const bytes=await readFile(await downloads[i].path());
   await page.evaluate(async({bytes,i,n,order})=>{
    const img=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/png'}));
    const start=Math.round(i*1920/n), width=Math.round((i+1)*1920/n)-start;
    if(img.width!==width||img.height!==1080) throw Error('dimensions');
    const c=document.createElement('canvas');c.width=width;c.height=1080;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
    for(const y of [0,540,1079]) {const data=ctx.getImageData(0,y,width,1).data;
     for(let x=0;x<width;x++)if(data[x*4]!==((start+x)%256)||data[x*4+1]!==Math.floor((start+x)/256)||data[x*4+2]!==order[i%order.length]||data[x*4+3]!==255)throw Error(`output pixel ${start+x}, y ${y}`);
    }img.close();
   },{bytes:[...bytes],i,n,order});
  }
 }
 await input.setInputFiles(file(0,'single-日本語.png'));await waitSources(1);
 await output([50],7);await output([50],19);
 await page.getByRole('button',{name:'画像1を削除',exact:true}).click();assert.equal(await save.isDisabled(),true);
 // A slow first file, a fast second, and an independently selected third batch.
 await input.setInputFiles([file(0,'slow-blue.png'),file(1,'fast-red.png')]);
 await input.setInputFiles(file(2,'green.png'));await waitSources(3);
 assert.deepEqual(await page.locator('.xcs-source-name').allTextContents(),['slow-blue.png','fast-red.png','green.png']);
 await output([50,100,150],20);
 await output([50,100,150],2);
 await page.getByRole('button',{name:'画像3を削除',exact:true}).click();assert.equal(await save.isDisabled(),true);
 await output([50,100],20);
 await page.getByRole('button',{name:'画像2を編集: fast-red.png',exact:true}).click();assert.equal(await save.isEnabled(),true);
 await page.getByRole('button',{name:'画像2を前へ',exact:true}).click();assert.equal(await save.isDisabled(),true);
 await output([100,50],20);
 // Selection preserves result; editing invalidates and transforms follow stable IDs.
 await page.getByRole('button',{name:'拡大',exact:true}).click();assert.equal(await save.isDisabled(),true);
 const zoom=await page.getByLabel('ズーム',{exact:true}).inputValue();
 const editor=page.getByLabel('画像編集キャンバス。ドラッグで位置を調整できます。');
 await editor.scrollIntoViewIfNeeded(); const box=await editor.boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+30,box.y+box.height/2+15,{steps:5});await page.mouse.up();
 assert.equal(await page.locator('.xcs-editor canvas').count(),1);
 const before=await page.locator('.xcs-editor canvas').evaluateAll(cs=>cs.map(c=>c.toDataURL()));
 await thumbs.nth(0).dragTo(thumbs.nth(1));
 assert.deepEqual(await page.locator('.xcs-source-name').allTextContents(),['slow-blue.png','fast-red.png']);
 assert.equal(await page.getByLabel('ズーム',{exact:true}).inputValue(),zoom);
 assert.deepEqual(await page.locator('.xcs-editor canvas').evaluateAll(cs=>cs.map(c=>c.toDataURL())),before);
 await page.getByRole('button',{name:'枠に合わせる',exact:true}).click();await preview([50,100],20);
 await split.click();await page.waitForFunction(()=>!document.querySelector('.xcs-save-all-button').disabled);
 await count.fill('7');assert.equal(await save.isDisabled(),true);
 // Mobile layout and alternative reorder controls.
 await page.setViewportSize({width:375,height:900});
 await page.getByRole('button',{name:'画像2を前へ',exact:true}).click();await count.fill('20');await preview([100,50],20);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const a=await split.boundingBox(),b=await save.boundingBox();assert.equal(a.width,b.width);assert.equal(a.height,b.height);assert.ok(b.y>a.y);
 await page.locator('.xcs-workspace').screenshot({path:join(tmpdir(),'carousel-multi-mobile.png')});
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('.xcs-workspace').screenshot({path:join(tmpdir(),'carousel-multi-desktop.png')});

 // Encoding is asynchronous: editing while it runs must discard its result.
 await page.evaluate(()=>{
  const original=HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob=function(callback,...args){original.call(this,blob=>setTimeout(()=>callback(blob),30),...args);};
 });
 await split.click();await page.getByRole('button',{name:'拡大',exact:true}).click();
 await page.waitForFunction(()=>!document.querySelector('.xcs-primary-button').disabled);
 assert.equal(await save.isDisabled(),true);
 await page.getByRole('button',{name:'枠に合わせる',exact:true}).click();

 // All-image editing applies to three sources; toggling scope alone preserves output.
 await input.setInputFiles(file(2,'third.png'));await waitSources(3);
 await split.click();await page.waitForFunction(()=>!document.querySelector('.xcs-save-all-button').disabled);
 const all=page.getByRole('checkbox',{name:'すべての画像に適用',exact:true});
 await all.check();assert.equal(await save.isEnabled(),true);
 await page.getByRole('button',{name:'拡大',exact:true}).click();assert.equal(await save.isDisabled(),true);
 for(let i=0;i<3;i++){
  await page.locator('.xcs-source-select').nth(i).click();
  assert.ok(Math.abs(Number(await page.getByLabel('ズーム',{exact:true}).inputValue())-1.2)<0.01);
 }
 const crop=page.getByLabel('画像編集キャンバス。ドラッグで位置を調整できます。');
 const previous=[];
 for(let i=0;i<3;i++){await page.locator('.xcs-source-select').nth(i).click();await page.waitForTimeout(40);previous.push(await page.locator('.xcs-editor canvas').evaluate(c=>c.toDataURL()));}
 await crop.scrollIntoViewIfNeeded();const rect=await crop.boundingBox();
 await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();await page.mouse.move(rect.x+rect.width/2+30,rect.y+rect.height/2,{steps:4});await page.mouse.up();
 for(let i=0;i<3;i++){await page.locator('.xcs-source-select').nth(i).click();await page.waitForTimeout(40);assert.notEqual(await page.locator('.xcs-editor canvas').evaluate(c=>c.toDataURL()),previous[i]);}
 await page.getByRole('button',{name:'100%',exact:true}).click();
 for(let i=0;i<3;i++){await page.locator('.xcs-source-select').nth(i).click();assert.equal(Number(await page.getByLabel('ズーム',{exact:true}).inputValue()),1);}
 await page.getByRole('button',{name:'拡大',exact:true}).click();await page.getByRole('button',{name:'リセット',exact:true}).click();
 for(let i=0;i<3;i++){await page.locator('.xcs-source-select').nth(i).click();assert.equal(Number(await page.getByLabel('ズーム',{exact:true}).inputValue()),1);}
 await all.uncheck();await page.getByRole('button',{name:'拡大',exact:true}).click();
 await page.locator('.xcs-source-select').nth(0).click();assert.equal(Number(await page.getByLabel('ズーム',{exact:true}).inputValue()),1);
 await page.setViewportSize({width:375,height:900});await all.check();assert.equal(await all.isChecked(),true);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 // A literal blue/red example, also exercising JPEG and WebP input.
 while(await thumbs.count()) await page.getByRole('button',{name:'画像1を削除',exact:true}).click();
 const solid=await page.evaluate(()=>['image/jpeg','image/webp'].map((type,i)=>{
  const c=document.createElement('canvas');c.width=1920;c.height=1080;const ctx=c.getContext('2d');ctx.fillStyle=i?'red':'blue';ctx.fillRect(0,0,1920,1080);return c.toDataURL(type).split(',')[1];
 }));
 await input.setInputFiles(solid.map((data,i)=>({name:i?'red.webp':'blue.jpg',mimeType:i?'image/webp':'image/jpeg',buffer:Buffer.from(data,'base64')})));await waitSources(2);
 await page.waitForTimeout(100);
 await page.locator('.xcs-live-preview canvas').evaluate(c=>{
  const ctx=c.getContext('2d');for(let i=0;i<20;i++){const p=ctx.getImageData(i*96+48,540,1,1).data;if(p[i%2?0:2]<250||p[i%2?2:0]>5)throw Error('blue/red assignment');}
 });
 assert.deepEqual(errors,[]);
 console.log('PASS: PNG pixel contents/dimensions/names; 1/2/3 sources; 7/19/20 parts; delayed batch ordering; preview/reversed exports; DnD + mobile reorder; pan/zoom persistence; invalidation; selection; layout; no page errors.');
} finally {await browser.close();}
