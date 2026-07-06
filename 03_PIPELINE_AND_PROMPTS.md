# Pipeline & Prompt Design

## 0. Pipeline Steps
1. User submits query.
2. **Call 1 — Query Decomposition** (cheap model): query → 3-5 targeted sub-queries covering distinct angles of the topic.
3. **Fetch** — run all sub-queries through the search API in parallel, extract clean text from top results, dedupe overlapping sources, keep the strongest 5-8 snippets total.
4. **Call 2 — Synthesis + Generation** (main model): sources + original query → 3 distinct-angle post versions, each with hashtags and a list of which sources it drew from.
5. **Image generation** (parallel, doesn't block step 4): one image per version, or one shared image — your call, cheaper to do one shared image keyed to the core theme for MVP.
6. **Guardrail check** (rule-based, no extra LLM call): confirm every version stayed under the char limit and that source references aren't empty.
7. User reviews versions + truncation preview + sources, edits, publishes.

## 1. Call 1 — Query Decomposition

**System prompt:**
```
You turn a single content query into targeted research sub-queries.
Given the user's query, output 3-5 distinct search queries that together
would let someone write a well-researched, non-generic post on the topic.
Cover different angles: the core announcement/fact, technical depth,
and broader context or reaction. Avoid redundant queries.
Respond ONLY with JSON, no preamble.
```

**Output schema:**
```json
{
  "sub_queries": ["string", "string", "string"]
}
```

## 2. Call 2 — Synthesis + Generation

**System prompt:**
```
You write LinkedIn posts grounded strictly in the provided source snippets.
Rules:
- Every factual claim must be traceable to one of the provided sources.
  Do not invent statistics, quotes, or events not present in the sources.
- Produce exactly 3 versions, each a genuinely different angle:
  (1) a contrarian/opinion take, (2) a personal-story/first-person framing,
  (3) a data-driven listicle framing.
- Each version's first 2 lines must work as a standalone hook, since
  LinkedIn truncates after ~210 characters.
- Each version must stay under 3000 characters total.
- Each version includes 3-5 relevant hashtags, not more.
- For each version, list which source indices it drew claims from.
Respond ONLY with JSON, no preamble.
```

**Input includes:** original query + numbered source snippets (title, URL, extracted text excerpt).

**Output schema:**
```json
{
  "versions": [
    {
      "angle": "contrarian" ,
      "text": "string",
      "hashtags": ["string"],
      "source_refs": [0, 2]
    },
    { "angle": "personal_story", "text": "...", "hashtags": [...], "source_refs": [...] },
    { "angle": "data_listicle", "text": "...", "hashtags": [...], "source_refs": [...] }
  ],
  "sources": [
    { "title": "string", "url": "string" }
  ]
}
```

## 3. Guardrail (rule-based, post-generation)
No extra LLM call — mirrors the `OutputGuardrail` pattern from your chatbot project:
- Reject/flag any version whose `text.length > 3000`.
- Reject/flag any version whose `source_refs` is empty (unsupported claims).
- Surface `sources` in the UI next to each version so the user visually verifies before publishing — this is the main hallucination mitigation, cheap and effective.

## 4. Image Generation
- Prompt built from the query's core theme + chosen tone (not per-word content of the post, to avoid overly literal/awkward AI images).
- Output dimensions fixed per post type: 1200×627 for link-style images, 1080×1080 for square native image posts. Don't let the model choose freely — hardcode target dimensions in the request.

## 5. Cost/Perf Notes
- Cache `SourceFetcher` results per query hash (short TTL) so "regenerate" only re-runs Call 2, not the whole research step.
- Call 1 uses a small/cheap model; Call 2 uses the main model — same cost-tiering logic as your chatbot's intent-classification split.
- Image generation fires in parallel with Call 2, not after it, since it only needs the query theme, not the final post text.
