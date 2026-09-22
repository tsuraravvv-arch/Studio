import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseFile } from "music-metadata";
import records from "./songs.json";
export type Song = typeof records[number] & { duration: number };
export const songs = records;
export const assetFile = (url: string) => path.join(process.cwd(), "docs", url);
export async function getSongs(): Promise<Song[]> {
  return Promise.all(songs.map(async song => {
    const metadata = await parseFile(assetFile(song.audio));
    return { ...song, duration: metadata.format.duration ?? 0 };
  }));
}
export const readMusicText = (url: string) => readFile(assetFile(url), "utf8");
export function isPreparing(text: string) {
  const paragraphs = text.split(/\r?\n/).map(line => line.trim()).filter(line => line && !/^\\?#{1,6}\s/.test(line));
  return !paragraphs.length || paragraphs.every(line => line.includes("準備中"));
}
