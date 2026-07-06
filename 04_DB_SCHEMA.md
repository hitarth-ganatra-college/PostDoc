# Database Schema (MongoDB)

## Collections

### `users`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `email` | string | unique index |
| `passwordHash` | string | omit if using OAuth-only login |
| `name` | string | |
| `createdAt` | date | |
| `dailyGenerationCount` | number | reset daily, used for rate limiting |

### `linkedin_connections`
Kept separate from `users` — tokens are sensitive and rotate independently.
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `userId` | ObjectId | ref to `users`, unique index |
| `accessTokenEncrypted` | string | encrypted at rest |
| `refreshTokenEncrypted` | string | encrypted at rest |
| `accessTokenExpiresAt` | date | ~60 days from issue |
| `refreshTokenExpiresAt` | date | ~365 days from issue |
| `linkedinMemberId` | string | from `/v2/userinfo` |
| `connectedAt` | date | |

### `posts`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `userId` | ObjectId | ref to `users`, indexed |
| `query` | string | original user query |
| `subQueries` | string[] | from Call 1 |
| `sources` | array | `{ title, url }` |
| `versions` | array | `{ angle, text, hashtags, sourceRefs }` |
| `selectedVersionIndex` | number \| null | which version the user picked |
| `finalText` | string \| null | post-edit final text, if edited |
| `imageUrl` | string \| null | |
| `status` | enum | `draft` \| `copied` \| `published` |
| `publishedAt` | date \| null | |
| `createdAt` | date | |

## Indexes
- `users.email` — unique
- `linkedin_connections.userId` — unique
- `posts.userId` — for history lookups
- `posts.createdAt` — for sorting history

## Example `posts` Document
```json
{
  "_id": "...",
  "userId": "...",
  "query": "Insights about Google I/O event, specific for World Models",
  "subQueries": [
    "Google I/O 2026 world models announcements",
    "world models AI research 2026",
    "Google DeepMind world model architecture"
  ],
  "sources": [
    { "title": "Google I/O 2026 keynote recap", "url": "https://..." },
    { "title": "DeepMind world models paper", "url": "https://..." }
  ],
  "versions": [
    {
      "angle": "contrarian",
      "text": "Everyone's calling world models the next LLM moment. Here's why that framing is off...",
      "hashtags": ["#AI", "#WorldModels", "#GoogleIO"],
      "sourceRefs": [0, 1]
    }
  ],
  "selectedVersionIndex": 0,
  "finalText": null,
  "imageUrl": "https://.../generated-image.png",
  "status": "draft",
  "publishedAt": null,
  "createdAt": "2026-07-06T10:00:00Z"
}
```
