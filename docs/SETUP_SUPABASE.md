# Setup Supabase (local or cloud)

1) Create a project in Supabase, grab URL and anon key.
2) Add env:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_BASE_URL=http://localhost:9002
```

3) Apply schema in SQL Editor: copy `src/lib/db-schema.sql`.
4) Add RLS policies from `docs/SUPABASE_SCHEMA_AND_FUNCS.md`.
5) Deploy Edge Function `execute-matching` using Supabase CLI:
   - supabase functions deploy execute-matching --project-ref <ref>
6) Wire Next.js actions to call the function (to be added).
