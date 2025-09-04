# AI Enhancements for Manito Manita (Research & Actionable Plan)

This document proposes practical AI features to enhance the gift exchange experience while respecting privacy and delivering measurable value. It’s written for an LLM agent to implement features with minimal ambiguity; do not write code here—only follow specs and tool choices.

## 1) Objectives
- Improve gift discovery quality and personalization.
- Reduce friction when writing wishlists.
- Enhance safety (moderation) and insights (summaries).
- Maintain performance and cost-efficiency.

## 2) AI Features (MVP → Advanced)

### 2.1 Wishlist Enrichment (MVP)
- Input: free-text wishlist description.
- Output: cleaned, concise version + extracted entities (brand, category, price range hints) + suggested reference links.
- Process:
  1) LLM rewrite for clarity and brevity.
  2) Extract entities as JSON (strict schema).
  3) Generate 3–5 suggested search URLs (Lazada, Shopee) with affiliate formatting.
- Tools: OpenAI GPT-4o-mini or Google Gemini 1.5 Flash for low-latency; deterministic JSON mode where available.
- Privacy: Do not send PII beyond text provided.

### 2.2 Gift Recommendation (Phase 1)
- Input: user wishlist text + group spend minimum + optional categories from entities.
- Output: ranked list of 10 gift ideas with links and reason.
- Approach:
  - Use embeddings over a product feed (affiliate APIs or scraped catalog) with a vector DB (Pinecone/Weaviate) to fetch candidates.
  - LLM re-ranks top 50 by budget, relevance, and diversity.
- Tools: Pinecone (index: product vectors), OpenAI text-embedding-3-large or Cohere Embed; LLM re-rank with GPT-4o-mini.

### 2.3 Matching Preferences (Optional Advanced)
- Extend matching to support preferences (avoid roommates, location constraints, budget tiers).
- Model: constraint satisfaction with heuristic (greedy + swap) or ILP if needed.
- Keep default derangement for parity with legacy; preferences are opt-in.

### 2.4 Comment Moderation & Summarization
- Moderation: toxicity, hate/harassment filters (OpenAI Moderation or Google Safety Filters).
- Summarization: per-user digest of comments and wishlist highlights; useful for their Santa.
- Tools: OpenAI moderation endpoint or Google Vertex AI Safety; GPT-4o-mini/Flash for summaries.

### 2.5 Email Optimization (Bandit)
- Maintain 2–3 subject line variants per template.
- Use a multi-armed bandit (epsilon-greedy) to pick variants based on open rate; store metrics in Firestore.
- No LLM required; purely statistical.

## 3) Data & Schemas

### 3.1 Product Catalog (for Recommendations)
```
Product {
  id: string,
  title: string,
  description: string,
  url: string,
  imageUrl?: string,
  price?: number,
  currency?: string,
  brand?: string,
  categories?: string[],
  affiliateUrl?: string,
  vector?: number[] // stored in vector DB
}
```

### 3.2 Feature Storage
- Wishlist enrichment results stored alongside WishlistItem as `enrichment`:
```
WishlistItem.enrichment = {
  cleanedText: string,
  entities: { brand?: string, category?: string[], priceHint?: string },
  suggestions: Array<{ title: string, url: string }>
}
```
- Recommendation cache per user+group to avoid recomputation; TTL 24h.

## 4) Pipelines & Execution

### 4.1 Enrichment Pipeline
- Trigger: Wishlist create/update.
- Steps: sanitize → LLM rewrite → entity extraction (JSON) → link suggestion building → store enrichment.
- Failure: log and continue without enrichment.

### 4.2 Recommendation Pipeline
- Trigger: on-demand (user clicks "Get ideas") or automatic weekly email pre-exchange.
- Steps: build query → vector search (top 200) → re-rank (top 10) → return list → store cache.
- Budget control: cap token usage and batch across users.

### 4.3 Moderation Pipeline
- Trigger: comment submission.
- Steps: run moderation → block or allow → if blocked, show reason; log metric.

## 5) Tools & Services (Preferred)
- LLM: OpenAI GPT-4o-mini (cost-effective, quality), fallback GPT-3.5 Turbo; or Google Gemini 1.5 Flash.
- Embeddings: OpenAI text-embedding-3-large (or small); Cohere Embed as alternative.
- Vector DB: Pinecone or Weaviate; Algolia for hybrid search.
- Email: SendGrid; capture open/click events for bandit.
- Privacy: redact emails/addresses from prompts; store minimal context.

## 6) UI/UX Additions
- Gift Ideas tab per member; show reasons and quick-copy links.
- "Improve my wishlist" button with preview/accept.
- Moderation feedback inline on comments.
- Email preferences for recommendation frequency.

## 7) Rollout Plan
- Phase 0: Instrument events and collect anon metrics.
- Phase 1: Wishlist enrichment + moderation.
- Phase 2: Recommendations (manual trigger).
- Phase 3: Bandit email optimization.
- Phase 4: Preference-based matching (opt-in beta).

## 8) Risks & Mitigations
- Hallucinated links → only generate links from trusted domains; validate URL patterns.
- Privacy concerns → avoid sending PII; allow opt-out of AI features.
- Cost overruns → cache, batch, and rate-limit; per-tenant quotas.
- Bias in recommendations → diversify and allow user feedback.

END OF SPEC — Build only features approved above, no extra creativity without product signoff.
