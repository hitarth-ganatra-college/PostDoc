# PRD — AI LinkedIn Post Generator

## 1. Overview
A tool where a user types a query (e.g. "Insights about Google I/O for World Models"), the system researches the topic across multiple authoritative sources, generates several distinct post drafts grounded in that research, optionally generates a matching image, and lets the user pick/edit/publish the final version to LinkedIn.

**One-liner:** Query in → researched, multi-angle LinkedIn post out.

## 2. Problem Statement
Writing a good LinkedIn post that isn't a shallow LLM paraphrase takes real research time. Most AI writing tools skip the research step and just rephrase whatever the user already typed — output reads like generic AI copy. This tool does the research first, then writes.

## 3. Goals (MVP)
- Multi-user from day one (accounts + auth).
- Given a query, decompose it into researchable sub-topics and pull real sources — not a single-shot scrape.
- Generate 3 distinct post versions (different angles), grounded in the fetched sources, with visible source links so the user can verify before publishing.
- Generate a matching image per draft (async, parallel to text generation).
- Let the user edit the chosen draft before finalizing.
- Publish via copy-to-clipboard (always available) and, if the user has connected their LinkedIn account, direct one-click publish.
- Store post history per user.

## 4. Non-Goals (explicitly out of MVP)
| Feature | Status |
|---|---|
| Voice calibration (matching user's personal writing style) | Future — easy add later |
| Iterative brainstorming loop (chat-refine before finalizing) | Future — schema should not block this later |
| Scheduling posts | Future — only after publish reliability is proven |
| Analytics / engagement tracking | Future |
| Company page posting (`w_organization_social`) | Future — needs LinkedIn partner approval, personal profile posting doesn't |

## 5. Users
Multi-user product. Each user:
- Has an account (email/password or OAuth login to the tool itself).
- Optionally connects their own LinkedIn account (separate OAuth grant, `w_member_social` scope) to enable direct publish.
- Has their own post history, isolated from other users.

## 6. Core User Flow
1. User logs in.
2. User types a query.
3. System decomposes the query into sub-topics and researches each in parallel.
4. System generates 3 grounded post versions + hashtags + source list.
5. System generates a candidate image per version (or one shared image — see pipeline doc) in parallel.
6. User reviews versions side by side, including a truncation preview (what shows before "see more") and the source links used.
7. User edits the chosen draft if needed.
8. User publishes: copy-paste, or one-click if LinkedIn is connected.
9. Post is saved to history with status (draft / published / copied).

## 7. Functional Requirements
- **FR1 — Auth:** account creation/login, session management.
- **FR2 — LinkedIn connection (optional per user):** OAuth flow to obtain `w_member_social` token, stored per user, refreshed before the 60-day expiry using the 365-day refresh token.
- **FR3 — Query intake:** free-text query input.
- **FR4 — Research module:** query decomposition into sub-topics, parallel source fetching, source ranking/dedup.
- **FR5 — Generation module:** produces 3 distinct-angle post versions + tags, grounded in fetched sources, respecting LinkedIn's 3000-char limit and a hook-line constraint for the pre-truncation preview.
- **FR6 — Hallucination guardrail:** every factual claim in a version must trace to a fetched source; UI surfaces which sources were used per version.
- **FR7 — Image generation:** async, parallel to text generation, output at correct LinkedIn dimensions.
- **FR8 — Draft picker + editor:** side-by-side version comparison, truncation preview, inline edit before finalizing.
- **FR9 — Publish:** copy-to-clipboard always available; direct publish if LinkedIn connected.
- **FR10 — History:** per-user list of past queries/posts with status.

## 8. Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Hallucinated claims damage user's credibility when posted | Source-grounding constraint in generation prompt + visible source links in UI before publish |
| LinkedIn API/partner restrictions block direct publish | Copy-paste is the default path; direct publish is additive, not required |
| Search/scrape costs scale per query | Cache source fetches per query hash; rate-limit generations per user per day |
| Token exposure (LinkedIn OAuth tokens) | Encrypt at rest, store in a separate collection from user profile data |

## 9. Success Criteria (MVP, qualitative)
- A user can go from typed query to a published (or copied) post in under 2 minutes.
- Every generated post has at least one visible, real source link.
- No version exceeds LinkedIn's character limit.
