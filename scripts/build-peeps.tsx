import { mkdir, writeFile } from "node:fs/promises";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PeepModule from "react-peeps";

import { archetypes } from "../shared/casting.js";

const Peep = ((PeepModule as unknown as { default?: typeof PeepModule })
  .default ?? PeepModule) as typeof PeepModule;
const expressions = {
  neutral: { face: "Calm", body: "ShirtBW" },
  happy: { face: "SmileBig", body: "EasingBW" },
  panic: { face: "Fear", body: "RoboDanceBW" },
  skeptical: { face: "Suspicious", body: "CrossedArmsBW" },
  thinking: { face: "Concerned", body: "PointingFingerBW" },
} as const;
const poses = {
  standing: "ShirtBW",
  leaning: "PointingFingerBW",
  panic: "RoboDanceBW",
  relieved: "EasingBW",
  "arms-crossed": "CrossedArmsBW",
  sitting: "ClosedLegBW",
} as const;
await mkdir("public/peeps", { recursive: true });
for (const [name, parts] of Object.entries({
  ari: { hair: "ShortVolumed", accessory: undefined, facialHair: undefined },
  sam: { hair: "Bun", accessory: undefined, facialHair: undefined },
  ...archetypes,
} as const)) {
  for (const [expression, props] of Object.entries(expressions)) {
    const variants = {
      ...poses,
      ...(name !== "ari" && name !== "sam" ? { "": props.body } : {}),
    };
    for (const [pose, body] of Object.entries(variants)) {
      const svg = renderToStaticMarkup(
        <Peep
          hair={parts.hair}
          {...(parts.accessory ? { accessory: parts.accessory } : {})}
          {...(parts.facialHair ? { facialHair: parts.facialHair } : {})}
          face={props.face}
          body={body}
          strokeColor="#24211F"
          backgroundColor="#FFFDF8"
          viewBox={{ x: "-150", y: "0", width: "1400", height: "1700" }}
        />,
      ).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
      // observed-write-ok: deterministic build artifacts; no domain mutation or provider side effect.
      await writeFile(
        `public/peeps/${name}-${expression}${pose ? `-${pose}` : ""}.svg`,
        svg,
      );
    }
  }
}
console.log(
  "Wrote 410 bundled Open Peeps variants (10 archetypes + legacy cast, including recasts of historical poses). No image generation.",
);
