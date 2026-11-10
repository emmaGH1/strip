#!/usr/bin/env python3
"""Build compositions/captions.html (word-by-word captions with the red-dot cursor)
from the approved narration text and per-segment local-voice transcripts.

Usage: python3 tools/build-captions.py <transcript-dir>
  transcript-dir holds w1.json .. w7.json (HyperFrames transcribe output per segment).
Also writes assets/vo/vo-mix.wav placement list (tools/vo-placement.json).
"""
import json, re, sys, difflib, html, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TR = sys.argv[1]

# Segment VO start times (absolute seconds in the film). Keep in sync with index.html.
SEG_START = {1: 0.6, 2: 14.0, 3: 22.0, 4: 38.0, 5: 61.6, 6: 70.6, 7: 97.4}
FILM_END = 104.0

NARRATION = {
    1: "You know release notes. Your team ships something good, somebody writes it up carefully, and then almost nobody reads it. We kept thinking, there has to be a better way to tell people what you built.",
    2: "So we made Strip. It turns one product update into a four-panel comic, and you make it together with an agent.",
    3: "Let me show you with a real one. I paste the release note, and before it draws anything, the agent pitches me three different ways to tell the story, each with its own cast of characters. I pick the one I like, and it drafts the whole strip.",
    4: "Anything outlined in blue is the agent's proposal. This line, I want to write myself. So I change it, and I stamp it as mine. Now watch what happens when I ask for something funnier. It rewrites the panel around my line, and leaves mine exactly the way I wrote it. And that's not a polite request in a prompt. The app itself refuses the edit.",
    5: "From here, I keep what I like, erase what I don't, pick an ending, and export a comic that's ready to post.",
    6: "Strip is built on Agent-Native, from Builder.io, and that's what makes all of this possible. Every edit is one shared action, so the buttons I press and the tools the agent uses are exactly the same thing. That also means my other agents can join in. Here's Claude Code, dropping a new strip straight into my library, and still being told no when it reaches for my line.",
    7: "Your agent pencils. You hold the pen. That's Strip.",
}

# Colour tags: blue = the agent acts, red = MINE / refusal. Matched as phrases (case-insensitive).
BLUE = ["the agent pitches me", "it drafts the whole strip", "outlined in blue", "the agent's proposal",
        "it rewrites the panel", "the tools the agent uses", "my other agents", "Claude Code", "Your agent pencils",
        "together with an agent", "dropping a new strip"]
RED = ["I stamp it as mine", "around my line", "leaves mine exactly the way I wrote it", "refuses the edit",
       "being told no", "reaches for my line", "You hold the pen"]

# Layout mode per segment: hero (big, centred or left), band (bottom band)
MODE = {1: "hero-left", 2: "band-ink", 3: "band", 4: "band", 5: "band", 6: "band-ink", 7: "hero-center"}
MAXW = {"hero-left": 6, "hero-center": 4, "band": 8, "band-ink": 8}


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))


def align(nar_words, tr_words):
    """Return [(start,end)] per narration word, using transcript times where words match."""
    a = [norm(w) for w in nar_words]
    b = [norm(w["text"]) for w in tr_words]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    times = [None] * len(a)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                times[i1 + k] = (tr_words[j1 + k]["start"], tr_words[j1 + k]["end"])
        elif tag == "replace" and (i2 - i1) == (j2 - j1):
            for k in range(i2 - i1):
                times[i1 + k] = (tr_words[j1 + k]["start"], tr_words[j1 + k]["end"])
        elif tag == "replace":
            # spread the transcript span across the narration words
            s = tr_words[j1]["start"]; e = tr_words[j2 - 1]["end"]
            n = i2 - i1
            for k in range(n):
                times[i1 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)
    # interpolate the rest
    last_end = 0.0
    for i in range(len(times)):
        if times[i] is None:
            # find next known
            j = i
            while j < len(times) and times[j] is None:
                j += 1
            nxt = times[j][0] if j < len(times) else (tr_words[-1]["end"] if tr_words else last_end + 0.3)
            n = j - i
            for k in range(n):
                times[i + k] = (last_end + (nxt - last_end) * k / n, last_end + (nxt - last_end) * (k + 1) / n)
            i = j
        last_end = times[i][1]
    return times


def tag_words(text, words):
    tags = ["ink"] * len(words)
    low = " ".join(norm(w) for w in words)
    starts = []
    pos = 0
    for w in words:
        starts.append(pos)
        pos += len(norm(w)) + 1
    for colour, phrases in (("blue", BLUE), ("red", RED)):
        for ph in phrases:
            phn = " ".join(norm(w) for w in ph.split())
            idx = low.find(phn)
            while idx != -1:
                for wi, s in enumerate(starts):
                    if s >= idx and s < idx + len(phn):
                        tags[wi] = colour
                idx = low.find(phn, idx + 1)
    return tags


groups = []  # {mode, words:[{text,start,end,tag}], seg}
placement = []
for seg in range(1, 8):
    tr = json.load(open(os.path.join(TR, f"w{seg}.json")))
    tr = [w for w in tr if norm(w["text"])]
    nar = NARRATION[seg].split()
    times = align(nar, tr)
    tags = tag_words(NARRATION[seg], nar)
    off = SEG_START[seg]
    placement.append({"seg": seg, "start": off})
    mode = MODE[seg]
    maxw = MAXW[mode]
    STOP = {"a","the","i","in","and","to","my","of","with","is","it","can","an","for","so","when","that's","are","into","what","be","has"}
    def split_clause(ws):
        if len(ws) <= maxw: return [ws]
        n = len(ws); k = (n + 1) // 2
        best = k
        for cand in sorted(range(2, n - 1), key=lambda c: abs(c - k)):
            if norm(ws[cand - 1]["text"]) not in STOP:
                best = cand; break
        return split_clause(ws[:best]) + split_clause(ws[best:])
    clause = []
    for i, w in enumerate(nar):
        clause.append({"text": w, "start": round(off + times[i][0], 3), "end": round(off + times[i][1], 3), "tag": tags[i]})
        if w[-1] in ".,?!":
            for part in split_clause(clause): groups.append({"mode": mode, "seg": seg, "words": part})
            clause = []
    if clause:
        for part in split_clause(clause): groups.append({"mode": mode, "seg": seg, "words": part})

# merge tiny groups (1 word) into previous when same segment
merged = []
for g in groups:
    if merged and len(g["words"]) == 1 and merged[-1]["seg"] == g["seg"] and len(merged[-1]["words"]) < MAXW[g["mode"]] + 1:
        merged[-1]["words"] += g["words"]
    else:
        merged.append(g)
groups = merged

# group windows
for i, g in enumerate(groups):
    g["start"] = max(0.1, g["words"][0]["start"] - 0.06)
    nxt = groups[i + 1]["words"][0]["start"] - 0.06 if i + 1 < len(groups) else FILM_END
    hold = g["words"][-1]["end"] + 1.4
    g["end"] = round(min(nxt, hold), 3)
    g["start"] = round(g["start"], 3)

# ---- emit HTML ----
parts = []
for gi, g in enumerate(groups):
    spans = []
    for wi, w in enumerate(g["words"]):
        nxt_start = g["words"][wi + 1]["start"] if wi + 1 < len(g["words"]) else g["end"]
        spans.append(
            f'<span class="w {w["tag"]}" id="cw{gi}_{wi}" data-ws="{w["start"]}" data-we="{w["end"]}" data-wn="{nxt_start}">'
            f'<span class="wt">{html.escape(w["text"])}</span><span class="dot" id="cd{gi}_{wi}"></span></span>'
        )
    parts.append(
        f'<div class="cg {g["mode"]}" id="cg{gi}" data-start="{g["start"]}" data-duration="{round(g["end"]-g["start"],3)}" '
        f'data-track-index="0" data-layout-allow-overflow>' + " ".join(spans) + "</div>"
    )

body = "\n".join(parts)

html_out = f"""<template>
  <style>
    @font-face {{ font-family: "Bricolage"; font-weight: 800; src: url("assets/fonts/bricolage-grotesque-latin-800-normal.woff2") format("woff2"); }}
    @font-face {{ font-family: "Bricolage"; font-weight: 700; src: url("assets/fonts/bricolage-grotesque-latin-700-normal.woff2") format("woff2"); }}
    @font-face {{ font-family: "Bricolage"; font-weight: 500; src: url("assets/fonts/bricolage-grotesque-latin-500-normal.woff2") format("woff2"); }}
    #captions {{ position: absolute; inset: 0; overflow: visible; pointer-events: none;
      --ink: #1A1714; --paper: #F4EFE6; --red: #D2432F; --blue: #3B6FD8; --butter: #E7B85A; }}
    .cg {{ position: absolute; left: 0; right: 0; font-family: "Bricolage", sans-serif; font-weight: 800;
      letter-spacing: -0.03em; line-height: 1.08; text-align: center; white-space: nowrap; overflow: visible; }}
    .cg.hero-left {{ top: 350px; left: 150px; right: auto; width: 1180px; text-align: left; font-size: 84px; white-space: normal; color: var(--paper); }}
    .cg.hero-center {{ top: 450px; font-size: 92px; color: var(--paper); }}
    .cg.band {{ bottom: 58px; font-size: 44px; font-weight: 700; letter-spacing: -0.02em; color: var(--paper); }}
    .cg.band-ink {{ bottom: 70px; font-size: 46px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink); }}
    .w {{ position: relative; display: inline-block; opacity: 0; }}
    .w .wt {{ display: inline-block; }}
    .w.blue .wt {{ color: var(--blue); }}
    .w.red .wt {{ color: var(--red); }}
    .hero-left .w.blue .wt, .hero-center .w.blue .wt {{ color: #7FA3F0; }}
    .hero-left .w.red .wt, .hero-center .w.red .wt {{ color: #F06A56; }}
    .dot {{ position: absolute; right: -0.42em; bottom: 0.1em; width: 0.26em; height: 0.26em; border-radius: 50%; background: var(--red); opacity: 0; }}
    .band .dot, .band-ink .dot {{ width: 0.3em; height: 0.3em; right: -0.46em; bottom: 0.08em; }}
  </style>
  <div id="captions" data-composition-id="captions" data-width="1920" data-height="1080" data-layout-allow-overflow>
{body}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
      const groups = document.querySelectorAll("#captions .cg");
      groups.forEach((g) => {{
        const gs = parseFloat(g.dataset.start), gd = parseFloat(g.dataset.duration), ge = gs + gd;
        const hero = g.classList.contains("hero-left") || g.classList.contains("hero-center");
        tl.set(g, {{ opacity: 1 }}, gs);
        const words = g.querySelectorAll(".w");
        words.forEach((w) => {{
          const ws = Math.max(gs, parseFloat(w.dataset.ws)), wn = parseFloat(w.dataset.wn);
          const wt = w.querySelector(".wt"), dot = w.querySelector(".dot");
          tl.fromTo(w, {{ opacity: 0 }}, {{ opacity: 1, duration: 0.14, ease: "power2.out" }}, ws);
          tl.fromTo(wt, {{ y: hero ? 26 : 14, rotate: hero ? -2 : 0, scale: hero ? 0.92 : 0.96 }},
            {{ y: 0, rotate: 0, scale: 1, duration: 0.3, ease: "back.out(2.2)" }}, ws);
          // the red dot sits after the latest word, lands with a punch, then jumps on
          const dEnd = Math.min(wn, ge) - 0.001;
          if (dEnd > ws) {{
            tl.fromTo(dot, {{ opacity: 1, scale: 1.9 }}, {{ scale: 1, duration: 0.22, ease: "back.out(3)" }}, ws + 0.03);
            tl.set(dot, {{ opacity: 0 }}, dEnd);
          }}
        }});
        tl.to(g, {{ opacity: 0, duration: 0.14, ease: "power2.in" }}, ge - 0.14);
        tl.set(g, {{ opacity: 0, visibility: "hidden" }}, ge);
      }});
      window.__timelines["captions"] = tl;
    }})();
  </script>
</template>
"""
open(os.path.join(ROOT, "compositions", "captions.html"), "w").write(html_out)
json.dump({"groups": groups, "placement": placement}, open(os.path.join(ROOT, "tools", "caption-groups.json"), "w"), indent=1)
print("groups", len(groups), "last end", groups[-1]["end"])
for g in groups:
    print(f'{g["start"]:7.2f}-{g["end"]:7.2f} {g["mode"]:11s}', " ".join(w["text"] for w in g["words"]))
