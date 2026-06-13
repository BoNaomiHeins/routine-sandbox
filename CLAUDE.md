# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Routines

### Dagelijkse AI Briefing

Elke doordeweekse ochtend om 08:00 CEST draait `.github/workflows/dagelijkse-ai-briefing.yml`.
Het script `scripts/ai_briefing.py` zoekt via DuckDuckGo naar AI-nieuws van de afgelopen 24 uur,
vraagt Claude om de top-3 te selecteren (modelreleases, lanceringen, benchmarks — geen financiering of opinies),
en stuurt het resultaat als platte tekst naar bonheins@gmail.com.

Vereiste GitHub Secrets:
- `ANTHROPIC_API_KEY` — Anthropic API-sleutel
- `GMAIL_USER` — Gmail-adres van de afzender
- `GMAIL_APP_PASSWORD` — Gmail app-wachtwoord (via Google Account > Beveiliging > App-wachtwoorden)
