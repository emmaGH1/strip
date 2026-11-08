import { appPath } from "@agent-native/core/client/api-path";
import textFontUrl from "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?url";
import titleFontUrl from "@fontsource/bangers/files/bangers-latin-400-normal.woff2?url";

import type { SceneAssets } from "../../shared/render-strip";

async function dataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Could not load local artwork (${response.status}).`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error("Could not prepare artwork for export."));
    reader.readAsDataURL(blob);
  });
}
let assetsPromise: Promise<SceneAssets> | undefined;
export function loadSceneAssets(): Promise<SceneAssets> {
  return (assetsPromise ??= (async () => {
    const names = ["ari", "sam"].flatMap((name) =>
      ["neutral", "happy", "panic", "skeptical", "thinking"].map(
        (expression) => `${name}-${expression}`,
      ),
    );
    const peeps = Object.fromEntries(
      await Promise.all(
        names.map(async (name) => [
          name,
          await dataUrl(appPath(`/peeps/${name}.svg`)),
        ]),
      ),
    );
    const [textFont, titleFont] = await Promise.all([
      dataUrl(textFontUrl),
      dataUrl(titleFontUrl),
      document.fonts.ready,
    ]);
    return { peeps, textFont: textFont!, titleFont: titleFont! };
  })());
}
export function textMeasurer(): (text: string, size: number) => number {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) throw new Error("This browser cannot measure comic text.");
  return (text, size) => {
    context.font = `500 ${size}px "DM Sans Variable", Arial, sans-serif`;
    return context.measureText(text).width;
  };
}
export async function exportPng(svg: string): Promise<Blob> {
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("PNG export is unavailable in this browser.");
    ctx.drawImage(image, 0, 0);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("PNG encoding failed.")),
        "image/png",
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
