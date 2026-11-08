import { mkdir, writeFile } from "node:fs/promises";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PeepModule from "react-peeps";

const Peep = ((PeepModule as unknown as { default?: typeof PeepModule })
  .default ?? PeepModule) as typeof PeepModule;
const expressions = {
  neutral: { face: "Calm", body: "ShirtBW" },
  happy: { face: "SmileBig", body: "EasingBW" },
  panic: { face: "Fear", body: "RoboDanceBW" },
  skeptical: { face: "Suspicious", body: "CrossedArmsBW" },
  thinking: { face: "Concerned", body: "PointingFingerBW" },
} as const;
await mkdir("public/peeps", { recursive: true });
for (const [name, hair] of [
  ["ari", "ShortVolumed"],
  ["sam", "Bun"],
] as const) {
  for (const [expression, props] of Object.entries(expressions)) {
    const svg = renderToStaticMarkup(
      <Peep
        hair={hair}
        face={props.face}
        body={name === "ari" ? "ShirtBW" : "CrossedArmsBW"}
        strokeColor="#24211F"
        backgroundColor="#FFFDF8"
        viewBox={{ x: "0", y: "0", width: "850", height: "1200" }}
      />,
    ).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
    // observed-write-ok: deterministic build artifacts; no domain mutation or provider side effect.
    await writeFile(`public/peeps/${name}-${expression}.svg`, svg);
  }
}
console.log("Wrote 10 local Open Peeps variants. No image generation.");
