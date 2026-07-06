# System Design — AI LinkedIn Post Generator

## 1. Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript (Node.js) | Consistent with your other project, SOLID structure carries over |
| DB | MongoDB | Post objects are naturally nested documents (versions, sources, tags, images) — no real joins needed at this scale |
| Auth | Auth.js (or Clerk) | Don't hand-roll password reset/session flows for MVP |
| LLM | Claude API | Structured JSON output for decomposition + generation calls |
| Search | Search API (e.g. Tavily / Bing / SerpAPI) | Returns ranked results per sub-query, cheaper than raw scraping |
| Scrape/fetch | fetch + readability extraction (e.g. Mozilla Readability) | Pull clean article text from result URLs |
| Image gen | Pluggable provider (e.g. an image API) | Swappable behind an interface — don't hardcode a vendor |
| Session store | Redis, behind an `ISessionStore` interface | Reuse the same interface + in-memory dev / Redis prod pattern from your chatbot project |
| Frontend | React (Next.js) | Minimal — query box, version picker, editor, history list |

## 2. Module Breakdown (folder structure)
```
src/
  api/                # route handlers / controllers
  auth/                # login, session middleware
  linkedin/
    OAuthClient.ts      # 3-legged OAuth flow, token exchange
    TokenStore.ts        # per-user encrypted token storage
    Publisher.ts          # w_member_social post call
  research/
    QueryDecomposer.ts   # Call 1: query -> sub-queries
    SourceFetcher.ts       # parallel search + fetch per sub-query
    SourceRanker.ts          # dedupe/rank fetched sources
  generation/
    PromptBuilder.ts       # builds Call 2 system+user prompt from sources
    PostGenerator.ts         # Call 2: sources -> 3 versions + tags
    Guardrail.ts               # checks claims trace to a source (rule-based, no extra LLM call)
  image/
    ImagePromptBuilder.ts
    ImageGenerator.ts
  db/
    UserRepository.ts
    PostRepository.ts
    LinkedInConnectionRepository.ts
  session/
    ISessionStore.ts
    InMemorySessionStore.ts
    RedisSessionStore.ts
  config/
  pipeline/
    GeneratePostPipeline.ts   # orchestrates decompose -> fetch -> generate -> image in parallel where possible
```

## 3. Data Flow (high level — see `03_PIPELINE.md` for prompt-level detail)
```
User query
   │
   ▼
QueryDecomposer (LLM call #1, cheap model)
   │  → 3-5 sub-queries
   ▼
SourceFetcher (parallel per sub-query)
   │  → ranked, deduped source snippets
   ▼
PostGenerator (LLM call #2, main model)
   │  → 3 grounded versions + tags + per-version source refs
   ▼            (fires in parallel →) ImageGenerator
Guardrail check (rule-based)
   │
   ▼
Draft picker UI → user edits → publish (copy or LinkedIn API)
```

## 4. External Integrations
- **LinkedIn OAuth** — 3-legged flow, `w_member_social` scope, personal-profile posting only in MVP (no partner approval needed for this scope). Tokens: 60-day expiry, 365-day refresh token — build refresh handling in from the start.
- **Search API** — used by `SourceFetcher`, one call per sub-query, run concurrently.
- **LLM API** — two calls per pipeline run (decompose, generate) — mirrors the 2-call pattern from your chatbot project.
- **Image API** — one async call, doesn't block text generation.

## 5. Non-Functional Notes
- **Rate limiting:** cap generations per user per day (protects your LLM/search/image budget); LinkedIn itself caps ~100 API calls/day/member on the publish side, which is a non-issue at MVP volume.
- **Caching:** cache `SourceFetcher` results per query hash for a short TTL so a "regenerate" doesn't re-pay for search+fetch, only re-runs the generation call.
- **Token security:** LinkedIn tokens encrypted at rest, stored in `linkedin_connections`, never embedded in the `users` document.
- **Cost control:** decomposition call uses a small/cheap model; generation call uses the main model; image gen only fires once the pipeline has real sources to work from.
