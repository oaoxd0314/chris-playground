---
name: google-search
description: should be used when the user invokes "/google-search" with a query. Triggers Gemini CLI as a research-only subagent for web search, returning sources and verbatim quotes. Do not use this skill for general knowledge questions, only for queries requiring live web search.
disable-model-invocation: true
allowed-tools:
  - Bash(~/.claude/skills/google-search/scripts/research_web.sh *)
context: fork
---

Execute the bundled script to invoke Gemini CLI as a research-only agent, then parse and present the result.

## Steps

1. Run:
   ```
   ~/.claude/skills/google-search/scripts/research_web.sh "$ARGUMENTS"
   ```
2. If the command fails, report the error as-is.
3. Parse the raw output and present it with:
   - **Findings** — main research summary
   - **Sources** — list of URLs or citations
   - **Quotes** — verbatim excerpts with their source

Do not add opinions or extra commentary beyond what Gemini returned.
