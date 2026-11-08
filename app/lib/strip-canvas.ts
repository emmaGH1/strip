import { appPath } from "@agent-native/core/client/api-path";
import uiFontUrl from "@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-500-normal.woff2?url";
import titleFontUrl from "@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff2?url";

import "@fontsource/comic-neue/700.css";
import textFontUrl from "@fontsource/comic-neue/files/comic-neue-latin-700-normal.woff2?url";

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
      ["neutral", "happy", "panic", "skeptical", "thinking"]
        .map((expression) =>
          ["standing", "leaning", "panic", "relieved", "arms-crossed"].map(
            (pose) => `${name}-${expression}-${pose}`,
          ),
        )
        .flat(),
    );
    // Historical records retain the original fixed-body assets; never restage a lock on read.
    names.push(
      ...["ari", "sam"].flatMap((name) =>
        ["neutral", "happy", "panic", "skeptical", "thinking"].map(
          (expression) => `${name}-${expression}`,
        ),
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
    const [textFont, titleFont, uiFont] = await Promise.all([
      dataUrl(textFontUrl),
      dataUrl(titleFontUrl),
      dataUrl(uiFontUrl),
      document.fonts.load('700 28px "Comic Neue"'),
      document.fonts.ready,
    ]);
    return {
      peeps,
      textFont: textFont!,
      titleFont: titleFont!,
      uiFont: uiFont!,
    };
  })());
}
export function textMeasurer(): (
  text: string,
  size: number,
  comic?: boolean,
) => number {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) throw new Error("This browser cannot measure comic text.");
  return (text, size, comic = false) => {
    context.font = comic
      ? `700 ${size}px "Comic Neue", sans-serif`
      : `800 ${size}px "Bricolage Grotesque", Arial, sans-serif`;
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
