import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import {
  BlinkCropCheck,
  type BlinkCropReport
} from "../../../../features/two-d-viewer/components/BlinkCropCheck";

export const metadata: Metadata = {
  title: "Blink Crop Check | Tsurara Studio",
  robots: { index: false, follow: false }
};

const reportPath = path.join(
  process.cwd(),
  "public/assets/tsurara/reports/blink-crop-report.json"
);

function loadReport(): BlinkCropReport | null {
  try {
    return JSON.parse(readFileSync(reportPath, "utf8")) as BlinkCropReport;
  } catch {
    return null;
  }
}

export default function BlinkCropCheckPage() {
  return <BlinkCropCheck report={loadReport()} />;
}
