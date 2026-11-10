// Make the same composition with the existing free local Kokoro draft narration.
// Both beds are spectrally carved and level-ducked by the official skill analysis.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(resolve(root, 'index.html'), 'utf8');
const voice = '<audio id="narration" class="clip" src="assets/draft-vo/film-voice.wav" data-start="0" data-duration="93.6" data-track-index="6" data-volume="1"></audio>';
writeFileSync(resolve(root,'voice.source'), src.replace('</div><script>window.__timelines', voice+'</div><script>window.__timelines'));
const skill = process.env.STRIP_CARVE_SCRIPT || '/data/home/.agents/skills/hyperframes-audio/scripts/carve.mjs';
for (const bed of ['music-bed','music-framework']) {
  execFileSync(process.execPath,[skill,'--comp',resolve(root,'voice.source'),'--bed',bed,'--voice','narration','--strength','0.8'],{stdio:'inherit'});
}
console.log('Prepared voice.source (copy to index.html only for the voice render). The voice is synthetic Kokoro am_michael, NOT the founder.');
