import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3001/tools/x-carousel-splitter/');
 const images=await page.evaluate(()=>[60,120,180].map(blue=>{const c=document.createElement('canvas');c.width=1448;c.height=1086;const ctx=c.getContext('2d');for(let x=0;x<c.width;x++){ctx.fillStyle=`rgb(${x%256},${Math.floor(x/256)*30},${blue})`;ctx.fillRect(x,0,1,c.height);}return c.toDataURL().split(',')[1];}));
 await page.locator('input[type=file]').setInputFiles(images.map((b,i)=>({name:`color-${i}.png`,mimeType:'image/png',buffer:Buffer.from(b,'base64')})));
 await page.waitForFunction(()=>document.querySelectorAll('.xcs-source-card').length===3);
 const slider=page.getByLabel('ズーム',{exact:true});
 await slider.focus();await slider.press('ArrowRight');await slider.press('ArrowRight');
 await page.getByRole('checkbox',{name:'すべての画像に適用',exact:true}).check();
 async function checkAligned(label){
  const pixels=[];
  for(let i=0;i<3;i++){
   await page.locator('.xcs-source-select').nth(i).click();await page.waitForTimeout(70);
   pixels.push(await page.locator('.xcs-editor canvas').evaluate(c=>{const p=c.getContext('2d').getImageData(0,Math.floor(c.height/2),c.width,1).data;return Array.from(p).filter((_,i)=>i%4<2);}));
  }
  assert.deepEqual(pixels[0],pixels[1],label+': image 2');assert.deepEqual(pixels[0],pixels[2],label+': image 3');
 }
 await checkAligned('check after individual zoom');
 await slider.focus();await slider.press('ArrowRight');await checkAligned('slider');
 const frame=page.getByLabel('画像編集キャンバス。ドラッグで位置を調整できます。');await frame.scrollIntoViewIfNeeded();const b=await frame.boundingBox();
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+40,b.y+b.height/2+25,{steps:5});await page.mouse.up();await checkAligned('pan');
 await frame.hover();await page.mouse.wheel(0,-100);await page.waitForTimeout(150);await checkAligned('wheel');
 await page.getByRole('button',{name:'拡大',exact:true}).click();await checkAligned('plus');

 // Start with three untouched placements, enable linking, then drag the actual slider.
 await page.getByRole('button',{name:'リセット',exact:true}).click();
 const all=page.getByRole('checkbox',{name:'すべての画像に適用',exact:true});await all.uncheck();await all.check();
 await slider.scrollIntoViewIfNeeded();const sb=await slider.boundingBox();
 const prior=await slider.inputValue();await page.mouse.move(sb.x+2,sb.y+sb.height/2);await page.mouse.down();await page.mouse.move(sb.x+sb.width*0.3,sb.y+sb.height/2,{steps:12});await page.mouse.up();assert.notEqual(await slider.inputValue(),prior);await checkAligned('pointer slider from fresh placements');
 // Compare actual exported pixels against the live composition after linked edits.
 await page.getByLabel('分割枚数',{exact:true}).fill('3');await page.waitForTimeout(100);
 const expected=await page.locator('.xcs-live-preview canvas').evaluate(c=>Array.from(c.getContext('2d').getImageData(0,540,1920,1).data));
 await page.getByRole('button',{name:'分割する',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.xcs-save-all-button').disabled);
 const downloads=[];page.on('download',d=>downloads.push(d));await page.getByRole('button',{name:'すべて保存',exact:true}).click();
 for(let i=0;i<30&&downloads.length<3;i++)await page.waitForTimeout(100);assert.equal(downloads.length,3);
 const {readFile}=await import('node:fs/promises');
 for(let i=0;i<3;i++){
  const bytes=await readFile(await downloads[i].path());
  const actual=await page.evaluate(async bytes=>{const img=await createImageBitmap(new Blob([new Uint8Array(bytes)]));const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return Array.from(ctx.getImageData(0,540,c.width,1).data);},[...bytes]);
  assert.deepEqual(actual,expected.slice(i*640*4,(i+1)*640*4));
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: three identical-size color variants: enable after editing, slider, pan, wheel, plus all aligned pixel by pixel.');
}finally{await browser.close();}

