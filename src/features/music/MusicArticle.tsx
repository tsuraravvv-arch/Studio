import Markdown, { defaultUrlTransform } from "react-markdown";
export function isPreparing(text: string) {
 const paragraphs=text.split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!/^\\?#{1,6}\s/.test(line));
 return !paragraphs.length||paragraphs.every(line=>line.includes("準備中"));
}
export function MusicArticle({text,id}:{text:string;id:string}) {
 const base=process.env.NEXT_PUBLIC_BASE_PATH??"";
 return isPreparing(text)?<p>楽曲紹介は準備中です。</p>:<Markdown skipHtml urlTransform={url=>{
  const safe=defaultUrlTransform(url);if(!safe)return "";
  if(/^(https?:|mailto:|#)/i.test(safe))return safe;
  return safe.startsWith("/")?base+safe:`${base}/assets/music/articles/${id}/${safe}`;
 }}>{text}</Markdown>;
}
