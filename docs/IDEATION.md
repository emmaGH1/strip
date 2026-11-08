# Agent-Native hackathon ideation

Status: exploration only; no concept or scope approved. Mode: collaborative.
Human input: open field. Time budget, API budget, and personal domain advantages not supplied. All product names below are working descriptors, not cleared brands.

## 0. Predicted crowded zone (before framework research)

Ban list: these ideas, close variants, and names cannot be finalists.

1. TaskPilot — agent task manager.
2. InboxZero — email triage and reply agent.
3. CalendarCopilot — meeting scheduler.
4. ResearchFlow — web research dashboard.
5. DocChat — upload documents and ask questions.
6. DataPilot — CSV analytics chatbot.
7. SlideCraft — presentation generator.
8. ContentStudio — social media content/calendar agent.
9. DevPilot — coding/project agent dashboard.
10. BugBuddy — issue triage and bug fixer.
11. SalesPilot — lead scoring and outreach CRM.
12. SupportDesk — customer-support ticket agent.
13. ShopGenie — shopping comparison assistant.
14. TravelMate — itinerary planner.
15. BudgetBuddy — personal finance advisor.
16. StudyBuddy — AI tutor and flashcards.
17. ApplyAI — resume tailoring and job applications.
18. MealMind — meal planner and grocery list.
19. FitCoach — fitness planning agent.
20. MeetingMind — meeting summaries and action items.
21. DesignPilot — website/UI generator.
22. FormFlow — form filling and back-office automation.
23. ContractLens — contract summarization/risk chat.
24. AgentBoard — multi-agent orchestration dashboard.
25. WorkflowCanvas — generic agent workflow builder.
26. LaunchPad — startup idea and business-plan generator.
27. KnowledgeGarden — notes/second-brain agent.
28. ClipCraft — AI video clipping and editing.
29. PropertyPilot — real-estate listing assistant.
30. GrantFinder — grant discovery and application writer.

## Process

Framework primitive research → unmodified random seeds → ten raw directions → mutation → collision research → provisional finalists. Judging is applied only after divergence/mutation. Research links and uncertainty will be recorded below. No search result constitutes proof of uniqueness.

## 1. Raw draw and divergence

Command: `python3 /data/home/.pi/agent/skills/hackathon-playbook/novelty/draw.py docs/PRIMITIVES.md --n 10`. One draw, no card swapping. Deck unfair inputs are prompts from the playbook, not independently verified current credentials or customer access.

1. Cocoa cut-test grader × deaf okada rider × consumed-not-resolved feedback × user cannot read × geology background. **Pictorial lot witness:** a courier carries a cocoa sample whose bean classifications are recorded as image tiles; recognizing a disagreement does not close it. Expert bottleneck: recognizing the significance and representativeness of cut surfaces, not transporting beans. Buyer/cooperative pays for a defensible receiving record. Phone replaces copying observations into a notebook, not a grader. Agent last: aggregate human labels and route ambiguous samples. Geology connection is sample provenance/representativeness, not a claim that geology qualifies someone to grade cocoa.
2. Aso-ebi coordinator × older landlord × anchored review × physical output × Pidgin. **Fabric collection receipt:** tie quantity, dye-lot and size disagreements to a person's order; produce a printable collection slip only after resolution. Bottleneck: reconciling which promises belong to which person. Organizer pays. Phone replaces cross-checking notebook and WhatsApp. Agent last: identify unresolved collection exceptions. Safe direction, likely crowded; do not turn into a generic payment dashboard.
3. Sommelier × traditional ruler × live sync × expert earns more × Nigerian market knowledge. **Paired sample hearing:** two traders record sensory judgments on the same anonymous commodity samples; an expert sells a signed reconciliation of which evidence they agree on. Bottleneck: interpreting a contested quality claim. Phone replaces duplicated sample notes. Agent last: group evidence and preserve dissent; never infer taste from a photograph or settle land rights.
4. Midwife × China importer × exact-call approval × two simultaneous users × comic creators. **Chapter reveal rehearsal:** borrow timing/reading signs as a metaphor, not medical software. Creator and editor inspect when each character learns a secret before an imported/localized chapter goes public. Expert bottleneck: seeing how a premature reveal breaks later scenes. Studio pays to avoid re-lettering. Phone replaces checking every prior panel. Agent last: propose knowledge-state changes with panel evidence and approval. Unusual direction; no image generation needed.
5. Referee × generator repairman × shared typed actions × annual use × crypto community knowledge. **Annual handover challenge:** outgoing community officers and incoming officers adjudicate each claimed generator service/part using evidence-linked maintenance entries before the annual handover. Bottleneck: recognizing unsupported repair claims. Community pays. Phone replaces matching scattered receipts. Agent last: propose evidence requests. Risk: turns into generic maintenance/accounting; keep as raw only.
6. Mine surveyor × USDC freelancer × anchored review × street network effect × phone/VPS builder. **Street borehole evidence board:** residents compare contractors' borehole scope and nearby voluntarily shared records, while an expert separates observed depths from promises. Bottleneck: reading scope omissions and knowing what a nearby bore log cannot prove. Buyer pays for review. Phone replaces transcribing quotes into a technical checklist. Agent last: normalize explicit claims, pin missing evidence, and draft clarification questions. No groundwater prediction; never imply neighboring success guarantees water.
7. Clinic interpreter × small miner × live sync × under ten seconds × Pidgin. **Pit-shift phrase cards:** worker and supervisor confirm a technical observation with icon + Pidgin + English; specialist maintains the approved vocabulary. Bottleneck: semantic equivalence rather than translation alone. Cooperative pays. Phone replaces an ambiguous verbal handoff. Agent last: map utterance to a human-confirmed card. Safety-critical reliance makes this a poor hackathon release; no emergency instructions.
8. Poultry listener × phone-only builder × shared access policy × WhatsApp-only × Pidgin. **Voice flock observation relay:** farmer sends an observation; vet gets a scoped structured history and asks for missing evidence. Bottleneck: vet interpretation, not automatic disease diagnosis. Farmer/vet practice pays. Phone replaces re-interviewing the farmer. Agent last: extract observations and route them. WhatsApp provisioning and clinical risk are significant; do not promise sound-based disease detection.
9. Bone setter × union treasurer × selected-object context × audio-only × crypto community knowledge. **Audible reconciliation challenge:** use the metaphor of a misaligned joint to walk through one selected ledger discrepancy with evidence and confirmations. Bottleneck: recognizing which entries represent the same obligation. Union pays. Phone replaces reading an inaccessible spreadsheet. Agent last: explain candidate matches. Too close to banned finance assistants; exclude from finalists.
10. Palm oil grader × Pidgin-reading farmer × consumed-not-resolved feedback × noncash payment × crypto community knowledge. **Quality evidence exchange:** buyer contributes a sample judgment to unlock a peer-reviewed lot comparison. Bottleneck: knowing whether a suspicion is supported by a test. Cooperative pays in contributed observations, not a token economy. Phone replaces a fragmented quality record. Agent last: surface disagreement and request evidence. Cannot detect adulteration by camera; lab/qualified expert findings stay external.

Archetypes represented: provenance/quality workstation, physical collection receipt, paired expert review, narrative simulation, handover adjudication, technical quote clarification, rapid semantic confirmation, asynchronous professional intake, accessible reconciliation, reciprocal evidence exchange. Safe raw directions: 2 and 6. Contrarian: 3 and 10. Different interaction models: 1, 4, 7, 9. Questioning the obvious brief: 10 makes the agent preserve uncertainty rather than pronounce an answer.

## 2. Mutation (before judging)

- **Borehole scope rehearsal (6 + sample rigor from 1):** remove the street map from the first slice. Turn quote comparison into an editable depth diagram: quoted bore depth, explicitly specified casing, pump, development and testing, each backed by a source or marked unspecified. Changing an interpretation visibly changes the open-question list, not a fabricated success score. Human expertise guides the agent; neighboring data is not necessary.
- **Character-knowledge rehearsal (4 + anchored dissent from 3):** remove generic story generation and visual character matching. Track who knows a specific secret at each panel, and distinguish reader knowledge from character knowledge. Move a reveal and rehearse the consequences; the creator can mark an apparent inconsistency intentional, which survives re-analysis.
- **Cocoa disagreement desk (1 + 3 + 10):** remove automatic grading and noncash incentives. Two humans classify a small cut-test sample; the interface exposes disputed beans and lot-level consequences. The agent does the arithmetic and evidence organization, not taste/smell/lab certification. Consuming feedback never silently resolves a dispute.
- **Fabric collection exceptions (2 + 10):** keep the physical receipt and disputed dye-lot evidence. Reject provisionally: adjacent aso-ebi order/payment products likely dominate, and the novel wedge is smaller than the complete product burden.

## 3. Collision research

Method: public web searches via Yahoo Search; Google returned a redirect page, DuckDuckGo challenged automation, Brave returned 429, and Bing HTML produced irrelevant results. Search quality is uneven; irrelevant results are not evidence of absence. Search-engine AI summaries are not treated as source evidence. Direct pages/READMEs were fetched when possible. No customer validation, exhaustive competitive review, or trademark clearance performed.

Queries executed, with reproducible search links:

### Borehole scope rehearsal

- `borehole drilling quotation software compare casing depth quotes`
- `water well estimate comparison homeowner software borehole scope`
- `borehole drilling quote comparison app Nigeria scope omissions`
- `site:github.com borehole quotation comparison`; `site:github.com "borehole" "quote"`
- `site:devpost.com/software "borehole"`
- `site:producthunt.com borehole drilling software`
- `site:x.com borehole quote software`
- Exact descriptor: `"borehole scope rehearsal"`
- Search entry: https://search.yahoo.com/search?p=borehole+drilling+quote+comparison+app+Nigeria+scope+omissions
- Closest directly read adjacent source: https://www.thewell.guide/cost-guides/well-drilling-cost — homeowner drilling costs and importance of included/excluded scope. Its numerical cost claims were not independently verified and will not become demo facts.
- Nigeria calculator surfaced in search: https://nigeriabuildingcost.ng/borehole-calculator (search result only).
- Generic quote comparator surfaced: https://github.com/Harish2930/quotation-comparison (search result only).
- PH surfaced spatial documentation tools rather than buyer-side scope review, including https://www.producthunt.com/products/sizeless (search result only).
- No convincing exact Devpost or X match surfaced; returned results were often irrelevant. No exact-descriptor product surfaced. This is limited negative evidence, not uniqueness proof.
- Specific wedge retained: buyer-side evidence-backed visualization of what a quote actually promises, with unknowns kept unknown and expert-correctable interpretations. Not groundwater prediction, a price oracle, a generic document chat, or contractor CRM.

### Character-knowledge rehearsal

- `story character knowledge tracking secret reveal continuity software`
- `fiction who knows what secret continuity editor software`
- `webtoon comic continuity checker software retcon`
- `comic panel spoiler reveal order editor reader character knowledge`
- `site:github.com story character knowledge secret continuity`
- `site:devpost.com/software "character" "knowledge" "story"`
- `site:producthunt.com character knowledge story continuity`; `site:producthunt.com "continuity" "writers"`
- `site:x.com story character knowledge continuity software`
- Exact descriptor: `"character knowledge rehearsal"`
- Search entry: https://search.yahoo.com/search?p=story+character+knowledge+tracking+secret+reveal+continuity+software
- Strong collision: Inkloom article titled “How to Track Character Knowledge in a Novel” surfaced at https://www.inkloom.ai/how-to-track-character-knowledge ; direct fetch was 404, so features beyond the snippet are unverified.
- https://novelcontinuity.com surfaced as a manuscript continuity tracker; direct fetch was 406.
- Directly read README: https://github.com/LAHutchins91/continuity-mcp — story bible, approved scenes, locks, checkpoints, continuity audits. A generic canon assistant is killed.
- Devpost surfaced https://devpost.com/software/storyroom-q41hev and a WebNovel Knowledge Graph project. These are adjacent story-memory/graph concepts, identified from snippets only.
- Visual identity checker surfaced: https://llamagen.ai/tools/character-continuity-checker (search result only).
- Panel reader surfaced: https://reader.onepanel.app/spoiler-free-manga-reader (search result only).
- X surfaced continuity-bible prompts and video-character consistency products; PH results were noisy and did not establish a close exact match.
- Specific wedge retained: a comic editor's counterfactual reveal-order rehearsal. Separate reader knowledge from character knowledge at panel granularity; moving a reveal produces an evidence-linked change list, while explicit author intent can override a warning. Not a story bible, novel generator, visual identity checker, or passive continuity report. Conditional originality pass only: this wedge needs validation, not a claim to a new category.

### Cocoa disagreement desk

- `cocoa cut test grading software disagreement human review`
- `cocoa bean cut test digital quality app`
- `cocoa buyer seller disputed cut test software`
- `site:github.com cocoa cut test grading`
- `site:devpost.com/software "cocoa" "grading"`
- `site:producthunt.com cocoa grading`
- `site:x.com cocoa cut test app`
- Exact descriptor: `"cocoa disagreement desk"`
- Search entry: https://search.yahoo.com/search?p=cocoa+buyer+seller+disputed+cut+test+software
- Directly read: https://www.qvisions.eu — QOCOA already offers cut-test classification, editable/versioned results, digital protocols and shareable reports. Therefore automatic grading plus editable report is killed, not called novel. Product claims of accuracy/compliance are its own claims, not independently verified.
- Directly read README: https://github.com/renliee/cocoa_grader — KakaoLens already has lot-level fermentation composition, unclassified counts, draft/final review, revisions and reports. Generic human-reviewed grading is killed.
- GitHub also surfaced https://github.com/ramsis235/mcc02-cocoa-bean-grading (search result only).
- Devpost surfaced adjacent onion grading https://devpost.com/software/gradion-imfuv0 rather than exact two-party cocoa dispute review. PH and X searches were mostly irrelevant; no negative uniqueness conclusion is justified.
- Specific wedge retained: two independent human judgments on the same sample, unresolved disagreements represented explicitly, bounded scenario totals while contested, and a joint-approved exception record. No vision model training or automatic quality certification. Conditional originality pass; customer demand is unproven.

### Previous event/gallery check and rejected fourth candidate

- Searched `Builder.io Agent Native hackathon previous winners gallery` and `site:devpost.com "Agent-Native" hackathon Builder`. Results surfaced the current event and its winners-announcement listing, not a verified previous-edition gallery. Do not imply historical entries were exhaustively checked.
- A broad combined Devpost query was also run but judged too noisy; individual candidate queries above supersede it.
- Fabric collection exceptions was dropped before convergence: too close to routine group-order and payment workflows, with no compelling proprietary input. It did not advance to a researched finalist.

## 4. Candidate briefs (post-collision)

All effort ranges assume one focused experienced builder, paid-model access already available, a single bounded example, no native app, no external messaging/OAuth integration, and a real agent. These are estimates, not commitments. As of machine clock 2026-11-08 06:47 UTC, approximately 49 hours remain until the published deadline; actual human availability is unknown. Demo recording and integration risk must have reserved time.

### A — Borehole scope rehearsal (working descriptor)

- Primary user: a homeowner or residents' representative comparing two water-borehole quotes with a reviewing geologist.
- Painful moment: the lower headline number is not a like-for-like scope, and omitted specifications look like included work.
- Current workaround: WhatsApp clarifications, a geologist's verbal advice, manual line-item comparison.
- Core action: turn supplied quote text into source-backed scope objects, then inspect/correct those interpretations and request the missing specifics.
- Before/after: opaque quotes → editable depth/scope schematic with explicit inclusions, exclusions, unknowns and an exportable clarification brief.
- Framework role: shared `update-scope-item` and `request-clarification` capabilities, selected-object context, anchored feedback, action audit/history. UI corrections and agent follow-up operate on the same records. These are product capabilities under consideration, not an architecture commitment.
- Demo moment: in an illustrative quote, drilling depth is specified but casing quantity is not. The agent leaves casing extent unknown. The human selects it, adds a contractor clarification, and the agent updates the visual and remaining questions without inventing subsurface geology or a safe design.
- Why it could score: concrete expensive decision; visible human correction changes actual useful work; narrow domain differentiates from boilerplate agents.
- Technical risk: extracting units, quantities and exclusions incorrectly; text-first input with direct source spans is the smaller safe version.
- Product risk: infrequent purchasing and willingness to pay; expert signoff and real quote examples are not secured.
- Likely effort: first useful slice 5–8 focused hours; bounded demo-ready prototype 16–24 hours, plus recording buffer. No maps, OCR, regional pricing model or groundwater model.
- Demo strength: good if the missing-scope story is made understandable immediately.
- Not a wrapper: quote interpretations are editable state with geometry and unresolved evidence, not just prose advice.
- Unfair input: playbook-listed geology background and local market context; human should confirm current relevance. Phone/VPS experience helps delivery but is not a market moat.
- Collision: narrower buyer-side technical scope review versus generic comparison/calculators; moderate confidence only.

### B — Character-knowledge rehearsal (working descriptor)

- Primary user: a webtoon creator/editor preparing a reveal-heavy episode.
- Painful moment: moving a panel or changing dialogue makes someone react to information they have not received, or accidentally reveals the twist to the reader early.
- Current workaround: reread chapters, story bibles, editor notes and mental tracking.
- Core action: rehearse moving a reveal across an ordered strip and review exactly whose knowledge changes, with cited panels and editable author-intent exceptions.
- Before/after: a rearranged strip with hidden causal errors → a reviewed panel order and a small approved change set.
- Framework role: common panel/reveal actions, selected-panel context, anchored comments, versions and explicit application of proposed edits.
- Demo moment: drag a confession later; an earlier reaction is flagged. Mark that character's knowledge as deliberately acquired off-panel, supply the note, and have the agent repair only the remaining consequence. The reader and characters have separate knowledge tracks.
- Why it could score: intuitive visual cause-and-effect, creative domain, strong human judgment rather than generic generation.
- Technical risk: reliable knowledge inference; use a short licensed/original script with user-confirmable structured reveals, not arbitrary long-image OCR.
- Product risk: helpfulness beyond what a writer's existing continuity tool provides. Reader-versus-character and counterfactual editing must be central or it fails the novelty gate.
- Likely effort: first slice 5–8 hours; bounded demo-ready prototype 18–26 focused hours, plus original comic assets and recording. Avoid full comic editor, generated art, complete novel import or collaboration infrastructure.
- Demo strength: strongest immediate visual story of the three; art/fixture preparation costs time.
- Not a wrapper: editable ordered panels and explicit knowledge/intent state drive a counterfactual rehearsal.
- Unfair input: playbook-listed webtoon/comic project experience; no claimed creator customers.
- Collision: broad continuity tools are close; conditional pass only for panel-level reveal rehearsal, not general continuity tracking.

### C — Cocoa disagreement desk (working descriptor)

- Primary user: a cooperative seller and buyer disagreeing over a delivered cocoa lot's cut-test observations.
- Painful moment: a disputed handful of beans affects the acceptance discussion but a single final grade erases whose judgment is contested.
- Current workaround: handwritten counts, photos in chat, repeat inspection and trusted-expert adjudication.
- Core action: compare two independent human labels per photographed sample, request specific missing evidence, and jointly approve the exception record.
- Before/after: competing summaries → an itemized disagreement board, deterministic count scenarios and an approved shared record or an honest unresolved hold.
- Framework role: object-anchored review, consumed-versus-resolved feedback, access-scoped common actions, exact-call finalization approval and history. An agent cannot resolve a disagreement merely by reading it.
- Demo moment: two reviewers disagree on selected beans. The agent groups the contested observations, calculates the resulting range under an explicitly illustrative acceptance rule, and drafts a sample-specific evidence request. A human resolution narrows the range; the remaining disputed items stay visibly open.
- Why it could score: strong human-in-control story with a distinctive physical evidence workspace.
- Technical risk: obtaining suitable licensed images and realistic expert-checked labels; no computer-vision certification or scientific thresholds invented by the agent.
- Product risk: without actual graders, this risks becoming a stylized comments app. Realistic buyer/seller workflow and permission boundaries need validation.
- Likely effort: first slice 4–7 hours; bounded demo-ready prototype 16–24 focused hours, plus sample-asset preparation and recording. No image classification training, escrow, blockchain, commodity prices or lab integration.
- Demo strength: tactile and distinctive, but requires more explanation than comic panels.
- Not a wrapper: two-party disagreement is durable structured state; agent organizes evidence while deterministic code calculates counts.
- Unfair input: Nigerian informal-market understanding plus sample-provenance mindset; no assertion of professional cocoa expertise. This is the weakest domain-access advantage.
- Collision: QOCOA and KakaoLens already cover much of adjacent workflow; conditional pass only for independent two-party dispute/evidence reconciliation.

## 5. Convergence

Novelty gate precedes usefulness scoring:

- A: provisional pass. A general quotation comparator is obvious; the source-backed, unknown-preserving borehole scope schematic grounded in geology is the actual candidate.
- B: conditional pass. A story bible or continuity checker is too obvious and already exists. Only the interactive reader-versus-character reveal-order rehearsal advances.
- C: conditional pass. Cocoa grading and editable results already exist. Only independent disputed judgments with a persistent unresolved state advance. Weakest validated domain input.
- None is claimed unique. If an exact competing workflow is found or the human lacks the proposed unfair input, revisit the gate rather than rationalize a clone.

Qualitative comparison (estimates, not measured scores):

- A: high usefulness/judging fit and sponsor depth; moderate-high distinctiveness; medium demo clarity; medium feasibility. First slice relatively fast; phone UI moderate; one persistent app database and model provider, no heavy infrastructure. Best balance if geology experience is relevant and one realistic quote fixture is obtainable.
- B: high design/demo potential and sponsor depth; moderate originality after the narrow wedge; medium feasibility and usefulness confidence. Ordered-panel editor is harder on mobile, and original visual assets add burden. Similar backend footprint to A. Could win on presentation, but nearby continuity tools make positioning crucial.
- C: high execution potential and collaboration fit; moderate originality after the narrow wedge; least demand/domain confidence. Grid interactions are mobile-friendly, true independent reviewers need permissions, and obtaining credible sample data is a risk. Similar backend footprint, with potentially more multi-user testing.

All three can fit the approximately 49-hour wall-clock window only as sharply bounded prototypes with sufficient focused builder time. No finish promise is possible without the human's available hours/API budget. Reduce scope rather than fake outputs.

Provisional recommendation: A, borehole scope rehearsal, for a concrete underserved decision with a defensible geology-informed angle. B is the stronger creative/demo alternative. C is the more unusual evidence-workflow alternative but the least validated business choice. Wait for the human to pick or reject; no architecture, implementation plan, app code, spending, deployment or submission is authorized.

Research artifacts: `docs/PRIMITIVES.md` and this file. No integrations implemented or tested, no users interviewed, and no product built.

## 6. Critique and convergence pass (Claude Opus, 2026-11-08 06:57 UTC)

One critique pass, per the playbook. Nothing here is approved; the human decides.

### Gaps in sections 0–5

- **Rubric was never recorded.** The official page weights Usefulness & Execution at 40% ("clear problem, complete working experience"), then Creativity & Design 20%, Innovation 20%, and Cleverness / Use of Agent-Native 20%. The required submission is a working Agent-Native app plus a **public Clips demo**. Deadline: **Nov 9 2026, 11:59 PM PT (= Nov 10, 07:59 UTC)**, about 49 h from this pass. Execution beats novelty: whatever we choose must be explainable in about 10 seconds by a US dev-tools judge.
- **Templates weren't checked.** The `BuilderIO/agent-native` repo ships `analytics, assets, brain, calendar, chat, clips, community, content, crm, design, dispatch, factory, forms, mail, plan, slides, tasks, videos`. So voice/recording (clips) and a canvas (design) already exist to borrow from, which changes the effort estimates.
- **A (quote reading) has a weak demo payoff.** The climax is "the agent drafts a clarification question", and a judge will see it as document Q&A over a quote, close to the banned DocChat/ContractLens. The geology advantage is barely used: anyone can read a quote.
- **C (cocoa)**: I agree it's the weakest. There's no data, no graders, it needs two-party permissions, and the doc itself flags the lack of domain access. **Drop.**

### Mutation: A becomes a drilling-day witness (recommended #1)

- Move the product from **before** drilling (reading a quote) to **during** drilling (verifying the work). The quote is only the input that sets the expected spec.
- User: the person paying, often family abroad (deck card "diaspora child managing a parent's money"), plus a relative or caretaker on site with a phone.
- Mechanism: the on-site person logs rods, casing pipes, cuttings changes, water strike, and pump-test readings by tap or by **Pidgin voice note**. The agent turns each one into a typed event. Deterministic code computes depth (rods × measured rod length) and the casing count. Live sync redraws a to-scale bore column against the quoted spec, shown as a ghost outline. Payment milestones need exact-call human approval, with the evidence summary attached.
- Demo moment: the driller says "we don reach 60 metres", but the rod log adds up to 54 m. The agent flags the gap and holds the "drilling complete" milestone. The owner abroad sees it live, asks for one more rod or approves with a note, and the audit trail becomes the as-built record.
- Primitives used: shared typed actions (UI tap and agent from voice), live sync across two surfaces, selected-object context (tap a casing segment and ask), exact-call approval, action audit trail, history.
- Collision check (standard web search, limited): NGO/RWSN guidance treats on-site supervision (sample logging, casing checks) as essential ([RWSN](https://rwsn.blog/2018/09/04/borehole-drilling-in-malawi/), [Concern](https://admin.concern.net/sites/default/files/documents/2022-09/Guidance%20Note%20-%20Borehole%20Drilling%20Supervision%20-%20Concern%20Worldwide%202015.pdf)). Logging apps exist for professionals (acQuire, LetsGeo, TabLogs, GoCanvas forms). I found no homeowner or diaspora verification app. This is limited negative evidence, not a uniqueness claim.
- **Needs human confirmation**: whether rod/casing counting matches real Nigerian rig practice (rod lengths, how casing is delivered), and which details should be configurable rather than assumed. No groundwater prediction and no invented standard lengths.
- Demo data is a seeded, simulated drilling day, labeled as such.

### B tightened: comic reveal rehearsal (#2)

- Core artifact: a **knowledge matrix** with rows for Reader plus each character, columns for panels, and cells showing knows / doesn't know for one secret. "Learns" events drive it deterministically.
- The agent: extracts learns events and knowledge-presuming lines from a short original script, and when a reveal moves, it re-checks only the affected lines and proposes dialogue edits as diffs the human approves. "Intentional" marks persist (consumed, not resolved).
- Skip a full drag-and-drop comic editor. Use a horizontal strip of text/sketch panels with one draggable reveal.
- Open question for the human: what are "canon" and "mnemo"? If canon is already a story-continuity tool, it's either a strong unfair input or a repeat of past work. Also check the official rules on pre-existing code (building window opened Oct 27).

### Ranking

1. Drilling-day witness: highest usefulness, real geology and Pidgin unfair inputs, a crisp "agent catches it, human decides" moment, and broad primitive use.
2. Comic reveal rehearsal: best for the Most Creative category, a visual cause-and-effect demo, and higher collision risk.
Dropped: cocoa desk, and the quote-only borehole version (folded into #1).
Suggest switching to **sprint mode** given about 49 h.

## 7. Fresh directions, not drawn from the novelty decks (Claude Opus, 2026-11-08)

Human feedback: sections 1–6 feel forced by the random draws and small-stakes. Want proper Agent-Native stack use and a high-grade demo. "canon" was not built; "mnemo" was built (disclose it if reused; rules allow pre-existing work only if disclosed).

Verified: the official rules confirm the deadline as Nov 9 2026, 11:59 PM PT (Nov 10, 07:59 UTC). Pre-existing work must be disclosed. A public repo or deploy is encouraged but not required. The Clips demo must be viewable without login.

Collision notes from this pass (standard web search, limited):
- Diaspora remote-construction monitoring is crowded: Urbex PRO, Vancus, BuildOVE, Track Your Build. The section 6 "drilling witness" has neighbours there.
- AI webtoon tools (LlamaGen, Anifusion) already advertise scroll pacing and "reveal moments" storyboarding, which weakens comic idea B further.
- Wedding-seating optimizers exist (SeatLogic, Wedding Seating Conflict Solver, TheWeddingPlanner.ai). No end-to-end plain-language-to-solver product surfaced.
- Landmark-directions geocoding: OSM in a ~4 km box around Oshodi returned only 12 tagged POIs (3 fuel stations, 9 shops, 0 places of worship). A cold-start demo would depend on a seeded gazetteer.

### F1 — Subsurface: messy drilling logs → editable cross-section (recommended)
- Job: hydrogeologists, geotech engineers, and NGOs siting boreholes or foundations must turn inconsistent driller logs into a picture of the ground. Today that's hand-drawn or done in expensive desktop tools (Leapfrog, RockWorks, Strater) with no co-editing agent.
- Agent: parses each log (text, scan, Pidgin voice note) into typed intervals and proposes layer correlations between holes, each with evidence and confidence. It re-correlates around human locks and proposes the next drilling location with an uncertainty band.
- Human: drags contacts, locks a correlation, and marks a layer as a lens or as continuous. Every edit is the same typed action the agent uses.
- Plain code does the interpolation and drawing. The agent proposes hypotheses but never controls the geometry by itself.
- Stack: shared actions, selected-stratum context, live sync, history and restore of interpretations, a geologist's correlation rules as an agent skill. Possible A2A to the Slides template for a client report (untested).
- Data: real public borehole logs (BGS/USGS; availability still to be verified), not invented geology.

### F2 — Owambe seating: family politics → typed constraints → solver
- Job: planners seating 300–500 guests where the constraints are social and arrive as voice notes.
- Agent: turns "keep Aunty X away from Uncle Y's table, Lagos cousins near the dance floor" into editable constraint chips. A deterministic solver places guests, and violations show live. Dragging a guest becomes a lock, and the solver re-plans around it.
- The lowest build risk and the clearest, funniest demo. The usefulness ceiling is lower.

### F3 — Landmark dispatch (wildcard)
- Lagos addresses are directions: the agent turns a Pidgin landmark description into candidate pins and a route card for the rider. Rider confirmations grow a shared gazetteer. Very legible problem. OSM coverage is thin and OkHi / Google address descriptors are adjacent, so it's a higher risk.

## 8. Real-world, ten-second-legibility pass (2026-11-08)

### Human correction and updated selection lens

Subsurface rejected: too much domain explanation for non-geologist judges. Owambe rejected: feels gimmicky. Earlier proposals are not approved fallbacks. Human wants real-world opportunity, buildability, immediate comprehension, and the Builder.io/Agent-Native stack at the core. Do not keep forcing a geology/comics/Nigeria angle to justify random cards. Canon was NOT built; Mnemo was built, but neither its capabilities nor permission to reuse it have been established.

An existing market is not disqualifying by itself; a feature-for-feature clone or generic AI wrapper is. The event's innovation rubric rewards meaningful human-agent workflow, not a claim that nobody has ever tackled a problem. Each candidate below must stand on a specific interaction/workflow difference and honest working output. All originality judgments are provisional. No customer demand has been validated.

Ten-second filter: a non-expert should understand the initial problem and useful output from one sentence. Buildability filter: the core outcome must not depend on bank/store/admin OAuth, a new proprietary dataset, a third party accepting our request, or an AI inference we cannot verify. Stack filter: human edits must change the agent's next action on shared state, not sit beside an unrelated generated answer.

### Fresh divergence and elimination

Raw opportunities explored before final ranking:

1. Campaign revision propagation: a client changes a commercial promise; repair all affected deliverables, not just find the old number.
2. Retail recall response: an official recall arrives; identify the affected stock/customer records and prepare the response.
3. Privacy-safe bug evidence: preserve reproducibility while removing customer identity across screenshots and diagnostic records.
4. General PDF redaction review: credible, useful, but an exact crowded product; do not advance on its own.
5. Screen-recording secret removal: immediately understandable, but multiple products already implement detection, tracking, review and verified export; do not advance as a full video editor.
6. Damaged-parcel claims assembly: clear monetary value; close existing claims-automation products and carrier-dependent outcomes weaken a short build.
7. Backorder rescue/allocation: real operational value but close backorder agents and inventory allocation suites surfaced; integration/stock-truth burden.
8. Home-care call-out repair: obvious high stakes, but scheduling providers already have AI call-off recovery; qualification, consent and travel constraints raise risk.
9. Ingredient-change menu impact: understandable and visual; close allergen management/change-control products and safety-critical verification burden.
10. Food-donation cancellation recovery: useful allocation problem, but donor/recipient access, availability truth and dispatch data are unproven.
11. Spreadsheet migration repair: easy useful output, but Flatfile, Dromo and OneSchema already target this; too generic without a specific domain advantage.
12. Lost-property proof-of-ownership: readable workflow, but existing matching/claim verification products and weak access to custodians.

Mutation:

- Campaign generation becomes **controlled revision execution** across existing deliverables. No generic social calendar, ideation or asset-generation studio.
- Standalone redaction becomes **cross-artifact diagnostic de-identification**: preserve request/error relationships while a human controls which identifiers remain useful. Not a generic bug fixer or a coding agent.
- Recall monitoring becomes **a source-cited response case for a small seller with existing lot records**, not a barcode consumer app, enterprise ERP or an inferred safety verdict.

### Research method and evidence boundaries

Public searches via Yahoo, including general wording, GitHub, Devpost, Product Hunt and X for all three narrowed areas. Some results were irrelevant; absent results are not uniqueness proof. Search-engine AI summaries were ignored as evidence. Direct documentation/README fetches are identified below. The current event and prior-gallery uncertainty from section 3 remain: no verified previous-edition gallery was found. Names here are descriptive labels, not selected product brands or cleared trademarks.

Framework documentation directly read this pass:

- https://www.agent-native.com/docs/template-content-developers/ — canonical Markdown documents; actions including pull-document, edit-document, update-document, export-document, comments, versions/restore, and Builder CMS sync. Confirms a real content editing/export surface, not that any integration has been run.
- https://www.agent-native.com/docs/template-slides-developers/ — granular slide actions, per-deck locking, selected-slide context, versions, standalone HTML and editable PPTX export. Browser edits use granular patch-deck operations; do NOT assume every browser save literally calls update-slide. Product coordination actions would need their own correct adapter and concurrency checks.
- https://www.agent-native.com/docs/template-slides-integrations/ — same-workspace discovery and authenticated A2A with shared config; separate deployments require explicit connection. Documentation-level feasibility only.
- https://www.agent-native.com/docs/template-clips-integrations/ — permission-scoped transcript and timestamped-frame access; public/private sharing rules apply. No permission to automatically access somebody's private clips is implied.
- https://www.agent-native.com/docs/recorder/ — redacted browser-local action/state/error record, two-minute window, explicit report destinations, no request/response body capture. It already strips common credentials; do not invent a secret leak from the built-in recorder. Remaining diagnostic usefulness/privacy concerns involve app-owned fields, supplied logs and screenshots.
- `template-content-integrations` was 404; use the verified Content developer guide, not an invented cross-app guide.

### G1 — Launch-change control (provisional first choice)

**Ten-second promise:** “The client changed the offer. Fix the landing copy, launch email and sales slides without overwriting approved work.”

- User: a small marketing agency or product marketer delivering a launch pack.
- Painful moment: a late commercial change invalidates claims spread across several formats; reviewers no longer know which versions are cleared.
- Workaround: manually search files, rewrite each one, exchange screenshots, and chase approvals.
- Core action: treat a requested change as a revision case; identify affected passages, propose format-appropriate diffs, honor protected passages, and apply approved revisions to real editable artifacts.
- Visible before/after: inconsistent launch pack → corrected, reviewable deliverables with a record of applied edits. The app must actually modify/export artifacts, not merely display recommendations.
- Illustrative demo: “The free plan is gone; the free trial stays.” The agent distinguishes the two across a document and deck. A human protects a quoted historical testimonial and edits one proposed sentence. The agent continues using that current state, without reintroducing rejected language. Approved document/slide revisions are opened and exported.
- Builder role: Content and Slides are potential actual artifact surfaces; shared typed change-case actions coordinate interpretation, review, application and export. Selection context scopes “keep this”; comments/history retain intent; concurrency guards reject stale proposals. A2A is justified only if the app truly coordinates separate app agents, not because another agent sounds impressive.
- Why AI matters: semantic distinction, context-sensitive rewrite and cross-format adaptation. A fixed price/date field alone is just templating and would not justify an agent.
- Why it could score: real complete output, immediately legible user correction, polished before/after and unusually direct use of the sponsor's editable apps.
- Main technical risk: standing up a real multi-app workspace and preserving concurrent document/slide edits. A first integration proof is required before committing to multi-app scope. No claim of atomic cross-app rollback: preflight, per-artifact revision records and resumable application would be necessary. These are risk observations, not an approved architecture.
- Main product risk: competes with established content operations/brand governance, and manual import can become an extra workflow. Native editable artifacts are the proposed difference, not “we do consistency checking.”
- Bounded feasibility estimate: 4–6 hours to prove one document and one deck can be read/edited/exported through the required surfaces; 20–28 focused hours for a polished bounded prototype if that works. Two artifact types first; no external Gmail/Notion/Google Slides login, campaign scheduler or image generation.
- Demo strength: excellent if the semantic mistake, human correction and changed real outputs all fit on screen. Phone operation is moderate due to side-by-side artifact review; a narrow review layout is feasible.
- Personal advantage: user's playbook-listed paid content/community work and actual launch/demo experience. No agency customers or access asserted.
- Competition: https://github.com/prateek9126/Inkloom-Guardian README was directly read. It ALREADY claims evidence-backed verification, cross-asset contradictions, human approvals, version snapshots and applied corrections. Generic brand governance is killed. https://air.inc/ai-content-operations-software and https://www.gradial.com/guides/ai-content-operations are adjacent established platforms surfaced by search. The narrow candidate is executing a client's approved change directly into native Content/Slides with protected edits and current-state handoff. This is differentiation to test, not verified market whitespace.
- Search examples: `AI marketing campaign change propagation update approved claims across landing page slides emails`; `content operations product fact change impact update campaign assets approval AI`; `site:github.com marketing campaign asset consistency`; `site:devpost.com campaign consistency assets claims change`; `site:producthunt.com marketing campaign consistency approval`; `site:x.com campaign consistency assets AI`.
- Exact descriptor search `"launch change room"` surfaced unrelated change-management material, not a product match. No product name chosen.

### G2 — Share-safe bug bundles (provisional second choice)

**Ten-second promise:** “Send a reproducible bug report without sending your customer's private data.”

- User: a support engineer, QA person or solo builder escalating a customer-specific bug to a vendor/public issue.
- Painful moment: useful evidence spans screenshots and logs; blindly masking every ID destroys the ability to follow the failing request, while missing a name or token leaks data.
- Workaround: edit screenshots, regex logs separately, manually reconstruct a report and check attachments.
- Core action: assemble a single evidence case, propose linked sensitive entities across artifacts, let the human keep required technical identifiers or apply consistent case-scoped aliases, then export a sanitized evidence pack.
- Before/after: unsafe or diagnostically useless evidence → a reviewed report plus transformed screenshot/log attachments and a decision manifest.
- Demo moment: the same customer is visible in a screenshot and diagnostic records. The agent proposes the linked removal/alias set. The human marks a request ID “needed to reproduce; retain.” That decision survives a second pass, related private fields are removed, and the exported report still links the same failed request to its error.
- Builder role: the built-in Recorder provides real structured action/context/error evidence for an opted-in Agent-Native app, not a fake integration. Shared entity/policy/region actions power both agent operations and direct visual editing. Selection gives precise meaning to “keep this ID.” Access and exact-argument approval control release of the bundle; history explains changes.
- Why AI matters: recommend context-sensitive privacy decisions and organize evidence into reproducible steps, rather than act as a regex with chat. Transformations/aliases/export must be deterministic code. The agent cannot promise it found all private information.
- Why it could score: obvious practical output, own workflow access, strong direct-manipulation correction, useful demonstration of a less-prominent Recorder primitive.
- Main technical risk: accurate text regions in a supplied screenshot and preserving useful correlations. Scope to a short text/JSON log plus one screenshot, manual region correction and known-field checks; no video, full HAR processing or arbitrary browser capture extension.
- Main product risk: existing redactors/bug-report tools cover much of this and manual review remains necessary. The workflow difference is linked disclosure decisions with preserved diagnostics, not OCR, secret detection or ZIP export alone.
- Security boundary: only fake/synthetic sensitive values for the public demo. Original attachments must never leak through the export. Diagnostics are not automatically safe simply because the framework redacts common credentials. Any actual leaked secret must be rotated; hiding it later is not revocation. No “100% safe” or certified-compliance claim.
- Bounded feasibility estimate: 3–5 focused hours to prove a real captured diagnostic report, one actual screenshot transformation and export; 16–24 hours for a bounded polished prototype, with OCR/model/privacy design still unproven. Local processing should handle obvious credentials before any optional provider call; real customer processing would need an explicit approved privacy design. Small backend footprint; image-region editing on mobile is moderate.
- Personal advantage: the user's direct experience building, debugging and preparing public demos. No need to invent inaccessible customer interviews or reuse Mnemo.
- Competition: https://github.com/ry0y4n/BugShield-Pack surfaced in search as a CLI packaging redacted logs/screenshots into GitHub issues. That is a strong collision; simple bundle generation is killed. https://github.com/cleanroom-ai/video-redaction README directly read: detection, temporal tracks, manual review and verified export already exist, with acknowledged limits. Its family includes standalone screenshot/log/PDF tools. Narrow candidate: a human-agent case workspace that preserves selected diagnostic relationships while propagating entity-scoped disclosure choices across formats and uses actual Agent-Native Recorder evidence. Conditional originality only.
- Other adjacent results: https://www.producthunt.com/products/flowlens-ai-native-bug-reports ; https://www.producthunt.com/products/datablur ; https://devpost.com/software/ozulon-privacy-studio ; https://devpost.com/software/reprosight-from-screenshot-to-verified-fix . These were snippets, not tested products.
- Search examples: `bug report screenshots HAR logs redaction consistent pseudonyms software`; `site:github.com bug report bundle screenshot log redaction`; `site:devpost.com bug report redaction screenshot logs`; `site:producthunt.com bug report sensitive data redaction`; `site:x.com bug report logs screenshots redaction`. General PDF and screen-video redaction were also searched in multiple phrasings and dropped as independent ideas due to close matches.
- Exact phrase `"recording privacy review"` was searched during the dropped video direction; no brand or clearance claim follows.

### G3 — Recall response desk (higher-risk wildcard)

**Ten-second promise:** “This product was recalled. Find the affected stock and customers, then prepare the response.”

- User: a small specialist retailer/food seller that ALREADY records lot/batch relationships between receipts, stock and orders.
- Painful moment: matching a free-text supplier/official notice to local product names and lots, then reconciling the response.
- Workaround: read notice, search inventory/order sheets, manually quarantine stock and draft messages.
- Core action: parse the notice into source-linked criteria; propose product aliases; have the human confirm ambiguous mappings; deterministically compute affected records; approve a quarantine record and response pack.
- Before/after: an external notice plus disconnected sheets → affected/uncertain records, a local hold register, draft notices and a response manifest. Export is real; sending/refunding is not claimed unless actually integrated.
- Demo moment: a near-identical product name is initially ambiguous. The human corrects the mapping using a lot label; the affected-order list changes and the response drafts are regenerated from the corrected state. Missing lot lineage remains “cannot determine,” never “unaffected.”
- Builder role: one validated action layer for notice criteria, mapping decisions, holds and response preparation, selected-order context, live refresh, traceable review and approval. Resource permissions matter because notices are public but customer records are not.
- Why AI matters: interpreting unstructured descriptions and alias suggestions, not deciding safety or inventing lot links. Exact lot matching and totals belong in deterministic code.
- Main technical risk: no universal barcode/product ID joins in notices. Must prove one bounded historical notice and local import schema. Public feeds are not a complete or necessarily timely safety service.
- Main product risk: many small stores do NOT track order-to-lot lineage. Without it, customer-level targeting is unjustified. This data dependency is why it is not the top recommendation.
- Bounded estimate: 4–6 hours for a real notice → imported rows → auditable response slice; 18–26 focused hours for a polished prototype. No Shopify OAuth, payment/refund processing, SMS or ERP. Mobile record review is relatively easy. Database/model/API access required, no geospatial or video infrastructure.
- Data probe actually executed: GET https://api.fda.gov/food/enforcement.json?limit=1 succeeded without a key and returned product_description, code_info, reason_for_recall, recall_number and status among other fields. The returned example F-0276-2017 is HISTORICAL and TERMINATED, not a current alert. Any demonstration with it must be labelled a historical exercise. Order/inventory fixtures would be explicitly synthetic, not real affected customers. This verifies feed access only, NOT matching, completeness, notification or a product integration.
- Personal advantage: informal retail workflow familiarity from the playbook, not privileged inventory access. Domain/data advantage is weaker than the first two.
- Competition: https://fiddle.io/solutions/lot-traceability directly read; it ALREADY offers forward/backward genealogy, affected-customer reports and recall workflows. https://www.recallinfolink.com is a close established recall-management platform. Narrow difference under consideration is a low-onboarding notice-to-response case workspace for existing CSV lot records, with human corrections visibly driving the response. Not a claim that these incumbents lack human review.
- Hackathon neighbors surfaced: https://devpost.com/software/recallcheck-j687xc (barcode/photo consumer lookup), https://devpost.com/software/supershield-ziw3tm (pharmacy/patient targeting), and https://github.com/tajadoru01/mdr_scan (medical-device recall extraction). Do not present “recall AI” as new.
- Search examples: `product recall small retailer identify affected orders lot customers software`; `FDA recall small business inventory lot customer notification software Recall InfoLink`; `site:github.com recall management FDA lot orders`; `site:devpost.com FDA recall`; `site:producthunt.com product recall management`; `site:x.com recall retailer software`. PH/X were mostly irrelevant, not proof of no competitor.
- No brand name chosen. “Recall” is already a widely used product name, including an unrelated PH knowledge app.

### Other close matches that informed rejection

- General redaction: https://www.redactable.com/ ; https://devpost.com/software/safedocs-bilingual-document-redaction-proof ; https://devpost.com/software/redactai ; https://www.producthunt.com/products/redacto . Too close to claim originality from human review/export alone.
- Parcel claims: https://www.claimit.ai/ and https://devpost.com/software/claim-ready-ai-claims-advocate-for-policyholders . No claim submission/approval service can be promised without a real integration.
- Backorders: https://www.opagtech.com/blog/backorder-recovery-ai-customer-promise-governance ; https://www.spendflo.com/agents/ai-backorder-management-agent . Strong adjacent workflow matches.
- Home-care call-offs: https://axiscare.com/press/axiscare-unveils-axi-assist/ . Scheduling alone is not a new workflow.
- Menu/allergen change control: https://www.kafoodle.com/products/allergen-management-software ; https://www.comandero.ai/en/resources/supplier-allergen-change-control . Strong adjacent products, higher safety burden.
- Data imports: https://dromo.io/blog/how-ai-is-transforming-data-imports-and-validation . Not a defensible generic finalist.

### Convergence and recommendation

These are candidate workflows, NOT validated businesses or approved scope. Each passes immediate legibility better than Subsurface. None is free of strong competitors. Novelty is conditional on the narrow workflow differences above; if reduced to a generic checker/redactor/monitor it fails the gate.

G1 is the provisional first choice: strongest direct fit to actual Builder content/slides capabilities and user's content work; excellent artifact-led demo; higher integration burden. G2 is provisional second: strongest own-workflow access and bounded useful export, less multi-app risk, but needs a sharply diagnostic (not generic masking) interaction. G3 has the clearest serious retail incident story but a harder pre-existing data requirement and weaker personal access.

Qualitative rubric fit: all can demonstrate usefulness through actual changed/exported work and innovation through a human correction controlling the agent's continuation. G1 has the strongest sponsor-app story and creative presentation opportunity; G2 highlights Recorder/context/resource permissions; G3 has high consequence but uncertain input readiness. No invented numerical winning scores or claims of user savings.

Effort ranges are rough estimates excluding account setup, user delays and final demo buffer; wall-clock deadline alone is not available build time. No account, budget, deployment or data-processing permission assumed. Nothing installed, scaffolded or built; only research documentation updated. Wait for the human to select, reject, or reshape. No architecture/implementation plan is approved.

## 9. Product-shape reset — raw exploration, not screened finalists

Human rejected ALL section 8 proposals: “none works. let's scrap and think from a fresh angle.” All earlier recommendations are shelved, not approved alternatives. Keep their records as research history; do not delete or build them.

Diagnosis: repeated inspect → flag → approve workflows made the concepts feel interchangeable. Fresh angle: constructive workbenches where shared human/agent state is the working medium, not an approval dashboard. Explore financial simulation, physical packing, and visual selection as genuinely different interaction models. Do not route automatically to another domain-specific evidence checker.

These three are RAW directions only. No new competitive search, user validation, numerical feasibility score, integration proof or architecture decision has been performed. They must pass collision and scope checks before being presented as final recommendations. They revisit established categories deliberately; do not claim a category is new simply because an agent is attached.

### R1 — Small-business cash-flow rehearsal

Ten-second promise: “Can I still pay everyone if my biggest client pays two weeks late?”

Working medium: a forward cash timeline, expected receipts, planned payments, editable assumptions, and scenario alternatives. Agent explores a shortfall using explicitly permitted levers; human fixes a payment date or protects payroll, and the agent revises only the remaining plan. Historical transactions are not moved or rewritten: scenario changes are separate from actuals and contractual obligations. Code computes all balances and constraint checks; the model does not invent money, future certainty, credit or authority to defer payments. Output is a saved scenario and a clear proposed payment/collection plan, not bank execution or financial guarantees.

Builder role under consideration: shared scenario operations, selected-event context, persistent human constraints and scenario history. No bank integrations necessary for the core; user-entered/imported illustrative records suffice. Difference from earlier banned personal-finance assistant: an operational business scenario simulator, not budgeting advice or a chat dashboard. Existing cash-flow planning tools are an obvious competitive risk and have NOT yet been checked this pass.

### R2 — Packing workbench for small sellers

Ten-second promise: “Pack these orders into suitable boxes without crushing or misplacing anything.”

Working medium: dimensioned items, available box types and a visible packing arrangement. Agent interprets packing instructions into confirmed constraints and proposes a plan; human rotates/repositions an item or fixes a box choice, and the next plan respects it. Deterministic geometry validates dimensions, intersections, weight and supported constraints. Do not claim a global optimum, actual carrier price, structural safety or accurate dimensions from a photograph. Output is a real printable packing plan/manifest, not a fake purchased shipping label.

Builder role under consideration: the same item-placement/constraint actions for direct editing and agent tools, selection context, plan versions, live updates. Bounded input can be a few measured items and known boxes without shipping integrations. Technical risks: credible handling of orientation, padding and non-geometric fragility constraints; a pretty 3D arrangement is not sufficient proof a package is sound. Existing cartonization products are likely; not competitively screened yet.

### R3 — Photo-selection workbench

Ten-second promise: “Turn a large shoot into a coherent shortlist without losing the shots I care about.”

Working medium: a contact sheet, groups of near-duplicates, keep/reject decisions and set-level coverage goals. Agent proposes a varied shortlist; human pins an imperfect but emotionally important image or rejects the agent's preferred style; subsequent suggestions preserve that intent. Output is an exported selection/contact sheet and selection manifest. Original files are not deleted or altered.

Builder role under consideration: shared selection/grouping actions, selected-image context, persistent pins and comparison/version state. No generative imagery or social-account integration is necessary. Vision/embedding costs, quality, licensed input assets and subjective usefulness remain unproven. Existing professional culling tools are a significant competitive risk. Difference from a generic gallery: selection is a collaborative set-level task, not just image tagging. Not claimed novel or selected.

Next gate: establish whether any of these constructive product shapes matches the human's taste before investing another broad competitive-research round. No recommendation or build authorization yet.

## 10. Status after round 5 (2026-11-08 08:42 UTC, ~47 h to deadline)

All candidates in sections 4–9 were rejected by the human. Rejection reasons given so far:
- Subsurface: too complex for non-geologists.
- Owambe: gimmick.
- Sections 8–9: "none works", with no specific reason.

Generating ideas blind is not converging. Next step: get the human's own criteria (who the user is, what kind of demo, what killed the previous ideas), then generate against those criteria. Time-box: lock a concept by ~10:30 UTC.

## 11. Criteria-led round (2026-11-08, after human answers)

Human criteria:
- User: a team at work, or an everyday person.
- Demo: "whoa, it built that with me" and fun/creative.
- Avoid: anything niche that needs explaining, and dashboards or checkers.

### S1 — Strip: turn any team update into a comic people actually read
- 10-second pitch: paste release notes or a policy change, and you and the agent build a 4-panel comic together, then post it to Slack.
- Characters come from a consistent, editable kit (Open Peeps; CC0 license to confirm), not image generation. Every element is a structured object: panel, character, pose, expression, balloon, line.
- The agent drafts the strip. The human drags a balloon, swaps a face, or rewrites the punchline. The agent continues around the locked edits ("make panel 3 funnier" uses selection context).
- Stack: shared typed actions for every scene edit, selection context, live sync for co-editing, versions and comments, PNG export.
- Neighbours: Creately comic maker, and AI comic generators (LlamaGen, AI Comic Factory, Pixa). Those mostly generate images or offer manual templates. Our angle is structured co-editing for team comms.
- Risk: the jokes and the visual quality of the composited characters.

### S2 — Jam: a shared piano roll with an AI bandmate
- 10-second pitch: describe a vibe, then you and the agent build a 15-second jingle on one piano roll. Drag notes, lock bars, and branch an "Afrobeats version".
- Code enforces key, scale and quantization. The agent writes notes through the same actions as the human. Selection context ("make these two bars sadder"), versions as branches to A/B, live multiplayer jamming. Playback with Tone.js, MIDI/WAV export.
- Neighbours: BeatFlow (LLM MIDI plus piano roll), co-compose (research), Melogen, CoComposer.ai.
- Risk: melody quality. Mitigations: code-enforced scale and rhythm, plus a curated drum-pattern library.

## 12. Strip — de-risking pass (2026-11-08 ~10:00 UTC; not yet approved)

The human likes Strip but has concerns about: risks, Agent-Native being at the centre, user control, how the UI and agent work together, and whether it can actually be funny.

**Funny by design, not by asking the model to "be funny":**
- Comedy formats as agent skills (e.g. expectation vs reality, the bug's point of view, "waited since 2019", rule of three).
- The agent proposes 3 punchlines and the human picks one.
- A team cast: teammates as recurring characters with one trait each.
- Running gags stored in agent memory, so the strips get funnier over time.
- Every bubble is linked to a release-note line, so the jokes never invent features.

**Agent-Native at the centre:**
- Strip, panel, character, balloon, cast and gag are SQL data.
- One set of `defineAction`s (write-balloon, set-expression, move-balloon, lock, propose-punchlines, pick-punchline, export) is used by both the UI and the agent.
- The selected panel or balloon is passed to the agent as context.
- Live sync for teammates and the agent.
- Anchored comments the agent answers.
- History with human/agent attribution, and restore.
- Stretch goal (prove early or cut): an MCP/HTTP entry so a developer in Claude Code can say "strip this changelog" and the strip appears for the team.

**User control:**
- Locks are enforced inside the action code; the agent cannot edit a locked element.
- Bigger rewrites arrive as proposals you accept or reject per panel.
- Attribution badges, undo and restore.
- The agent picks the semantics (beat, pose, expression, line). Code computes all coordinates. Humans drag to fine-tune.

**Assets:** Open Peeps is CC0, confirmed on openpeeps.com (bodies, poses, expressions as SVG). `react-peeps` exists on npm (MIT) but its last release was in 2021; fall back to raw SVGs if it doesn't fit.

**Risks and cuts:**
- Humour quality: formats, 3 options, team cast.
- Visual polish: fixed templates, early design pass.
- Framework learning curve: a day-1 spike proving one action works through UI, agent and live sync.
- Scope: 4-panel strips only, PNG export, no Slack OAuth, no image generation.
- Demo input: a real public changelog, ideally from Agent-Native's own repo.

## 13. Strip concept and demo review — recommendations, not approved scope

Review basis: sections 11–12 and the official event rubric already researched. No app, rendered artwork, real generation, comedy validation, concurrency behavior or export has been tested. This is a concept review, not an implementation audit or proof of competitive uniqueness.

### Verdict

Strip is worth a tightly bounded creative/integration proof. It matches the human's preference for a fun “it built that with me” experience and has a legitimate shared-object interface. It is not yet de-risked, and must not be pitched as a likely winner or proven way to make people read release notes. The 40% usefulness/execution criterion is the main exposure; creativity alone does not carry the rubric.

Sharpen the job to helping a product marketer/community manager turn one meaningful product change into a clear, shareable comic. Release notes remain the input wedge, not a requirement to compress an entire changelog into four unrelated jokes. Don't broaden into arbitrary comic creation or policy communications without approval.

### Corrections to the previous pitch

- Comedy formats and three variants improve editorial choice, not guaranteed funniness. Repetition can become stale. Running-gag memory does not necessarily make output better and is not needed to prove the core.
- Linking a balloon to a source is provenance, not a factuality guarantee. Distinguish literal product claims from obviously fictional dialogue; validate feature assertions against the source and surface uncertainty.
- Licensed assets are not proof that the desired faces/poses can be composed convincingly. Verify compatible assets, legibility, panel staging and expressive range in an early art probe. A reusable art kit needs props, reaction staging and enough negative space to tell a visual story, not just portraits beside paragraphs.
- SQL tables are ordinary storage, not proof of sponsor depth. Shared validated actions, current selection/state, visible edits and safe continuation are the proof.
- “The agent cannot edit locks” is a testable requirement, not an implemented fact. All write paths, whole-strip replacement, deletion and indirect cast changes must respect protection. Agent tools must not gain an unlock/force-write bypass via an editable argument. Human edits made while the agent is thinking need stale-version protection as well as locks.
- Do not claim no competing product supports co-editing. Earlier research did not prove that.
- An export is not a post to Slack. No Slack integration is needed; download and actually reopen the PNG.

### What makes the interaction worthwhile

The creative surface should lead. The person sees four panels, can select a balloon or character, directly edit text/expression, protect their contribution and inspect a proposed change in place. Chat is an assistant to that editing context, not the main artifact.

Critical proof: human changes a real object; agent reads the current version and selection; agent revises other permitted objects through the same domain action layer; human contribution survives; exported image reflects the saved state. An action log can corroborate a short part of this, but should not displace the comic.

Action design observations are review requirements, not an approved architecture. Pinning multiple raw framework templates together or adding A2A solely to show more sponsor logos is unnecessary. If an external MCP entry is pursued, it must serve a real workflow and be proven separately; otherwise cut it.

### Humor/editorial direction

Sell clarity with personality, not a promise that every update becomes hilarious. One understandable situation, escalation, visual reaction and payoff is stronger than four generic developer jokes. At least one beat should be visual, so a joke survives without narration explaining it.

Illustrative fictional source for a creative test only: “Deleted files can now be restored with Undo.” This is NOT asserted to be an actual Builder release.

- Panel 1: quick tidy-up; character says “Just clearing old drafts.”
- Panel 2: launch-plan file disappears; frozen reaction: “That wasn't a draft.”
- Panel 3: Undo visibly restores it; physical relief supplies the visual beat.
- Panel 4: proposed payoff: “Now add Undo to ‘Sure, Friday works.’”

This is a storyboard direction, not validated comedy or a finished script. A real demo must use a verifiable matching source, or clearly label the input fictional. Don't invent a feature merely to make the sponsor's changelog fit the joke. A relatable verified release beats an obscure sponsor-specific PR title.

### Revised judge flow (proposed 75–90 seconds, not an event limit)

1. 0–8 s: recognizable product change beside its eventual comic; one-line promise. Do not start with a long logo sequence or unsupported claims about engagement.
2. 8–25 s: actual agent creates the four-panel draft from the source. Use real output. If latency is longer, shorten elsewhere or label any time compression; never replace inference with a secretly hard-coded strip.
3. 25–40 s: human edits one line and changes an expression; protect the contribution. A clear selected-object state establishes control.
4. 40–65 s: ask for a tighter/deadpan revision and improved ending. Show current human edit preserved while permitted content changes. Present a small set of punchline variants in context, not three complete strips or a long conversation. Test hard lock enforcement separately before claiming it.
5. 65–80 s: choose the ending, export, and open the actual PNG large enough to read. Let the result breathe; this is the payoff.
6. 80–90 s: concise technical statement tying UI and agent edits to the same actions; URL/repo if ready. No feature inventory or second collaborator setup.

Keep at least one third as continuous real-app capture under the playbook's demo guidance. Capture the edit → actual agent response → preserved state continuously if practicable. A prepared input/cast/session is honest; preselected responses presented as live generation are not. A previously generated draft is permissible only if identified as such, with actual live revision still demonstrated.

Memorable moment: “I changed it; the agent worked around my change rather than starting over.” The funny artifact is the payoff, not the only proof.

### Narrowing recommendation

Core proposal: fixed four panels, small consistent cast/pose kit, single meaningful update, readable balloons, direct text/expression editing, granular protection, one contextual rewrite/ending-choice flow and PNG export. Use fixed layouts with human placement overrides preserved by later agent edits.

Cut from first proof: multiplayer, real coworker likenesses, persistent running-gag memory, freeform drawing tools, Slack OAuth, image generation, external MCP integration and comment-thread workflows. Basic truthful change attribution/undo may support trust but should not expand into a custom history product. These are scope recommendations only; the human has not approved them.

### Go/no-go evidence before a long build

- Creative proof: several independent fresh drafts from ordinary short updates, not one cherry-picked demo. A person unfamiliar with each input can explain the change, the strip reads without narration, and at least one payoff has personality. If it is four stock portraits with verbose text, stop and fix the concept/art rather than adding features.
- Shared-state proof: one domain edit called from UI and real agent, current selection recognized, protected edit survives an attempted rewrite, stale agent writes cannot clobber a newer human change.
- Artifact proof: actual PNG matches the current comic and remains legible at a realistic Slack/mobile display size. No claim of working export before testing it.

Do not invest in the product film before these pass. If creative quality is weak, reconsider rather than treating memory, multiplayer or more framework features as fixes. Human approval required before scope, design or app implementation.

## 14. Claude × ChatGPT agreed position on Strip (2026-11-08; pending human approval)

One reconciliation round. Both models agree: **go to a 3-hour proof, not the full build.**

**User and job:** a product marketer turns one verified product change into an editable 4-panel comic for an X/LinkedIn launch post. We promise clarity and charm, not engagement gains.

**Must-haves:**
- Structured Open Peeps art.
- A static cast of 2–3 characters, one trait each. Jokes must work for strangers who don't know the team.
- Props and one wordless beat.
- Direct text and expression editing.
- Contextual agent revision of the selected panel or balloon.
- Shared, validated actions used by both the UI and the agent.
- Protection enforced on every write path, including indirect cast changes.
- Stale agent writes rejected.
- 3 ending choices.
- PNG export that matches the canvas.
- Sourced product claims kept separate from fictional dialogue.
- At most 12 words per balloon and 2 balloons per panel, plus a measured overflow check.

**Cuts:** multiplayer, comments, running-gag memory, likenesses, freeform drawing, image generation, social-posting integrations, elaborate history.

**Stretch (only after the core works):**
- An external-agent entry point over MCP/HTTP.
- Panel-by-panel streaming of validated panels; no simulated streaming.

**Demo, 75–90 s:**
1. Show the verified update and the promise.
2. The agent generates the real draft.
3. Edit a balloon or expression and protect it.
4. The agent tightens the strip around that contribution.
5. Choose an ending, export, and reopen the PNG.
6. Explain the shared actions and close with links. Publish via Clips.

**Go/no-go, hard stop ~14:00 UTC:**
- Three ordinary updates: a reader unfamiliar with them understands all three, and at least 2 earn an unprompted smile.
- Staging and text are readable on a phone.
- The UI and agent share an action, selection context works, protection survives a rewrite, and a stale write is rejected.
- The reopened PNG matches the canvas.

**On failure:** simplify Strip. Any pivot needs explicit human approval. Jam is not treated as an automatic safe fallback.
