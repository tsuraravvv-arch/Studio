import { Lato, Lora, Noto_Sans_JP } from "next/font/google";

// Permanent Studio typography; never applied to the existing standalone tools.
const latin = Lato({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-studio-latin" });
const japanese = Noto_Sans_JP({ weight: ["400", "500"], display: "swap", preload: false, variable: "--font-studio-japanese" });
const heading = Lora({ subsets: ["latin"], weight: ["400", "500"], display: "swap", variable: "--font-studio-heading" });
export const studioFonts = `${latin.variable} ${japanese.variable} ${heading.variable}`;
