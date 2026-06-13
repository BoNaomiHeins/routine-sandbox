#!/usr/bin/env python3
"""
Dagelijkse AI-briefing: haalt het belangrijkste AI-nieuws op van de afgelopen 24 uur
en stuurt een samenvatting van de top-3 berichten per e-mail.

Filtert op: modelreleases, productlanceringen, benchmarkresultaten.
Slaat over: financieringsnieuws, opiniestukken.
"""

import os
import smtplib
from datetime import datetime, timezone, timedelta
from email.mime.text import MIMEText

import anthropic
from duckduckgo_search import DDGS


def zoek_ai_nieuws() -> list[dict]:
    queries = [
        "AI model release launch benchmark last 24 hours",
        "artificial intelligence product launch announcement today",
        "new AI model capabilities benchmark results",
    ]
    resultaten = []
    with DDGS() as ddgs:
        for query in queries:
            for r in ddgs.news(query, max_results=8, timelimit="d"):
                resultaten.append({
                    "titel": r.get("title", ""),
                    "samenvatting": r.get("body", ""),
                    "url": r.get("url", ""),
                    "datum": r.get("date", ""),
                })
    # Dedupliceer op URL
    gezien = set()
    uniek = []
    for r in resultaten:
        if r["url"] not in gezien:
            gezien.add(r["url"])
            uniek.append(r)
    return uniek[:25]


def genereer_briefing(nieuwsberichten: list[dict]) -> str:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    nieuws_tekst = "\n\n".join(
        f"Titel: {item['titel']}\n"
        f"Samenvatting: {item['samenvatting']}\n"
        f"URL: {item['url']}\n"
        f"Datum: {item['datum']}"
        for item in nieuwsberichten
    )

    prompt = f"""Hier zijn recente AI-nieuwsberichten van de afgelopen 24 uur:

{nieuws_tekst}

Selecteer de drie meest relevante berichten. Criteria:
- Wel: modelreleases, grote productlanceringen, concrete benchmarkresultaten
- Niet: financieringsrondes, opiniestukken, speculatie

Schrijf voor elk gekozen bericht precies dit:
1. De oorspronkelijke kop (zo kort mogelijk)
2. Één zin: wat er concreet is gelanceerd of veranderd
3. Één zin: waarom dit belangrijk is voor iemand die werkt als webdeveloper, social media beheerder en marketeer

Schrijf de volledige briefing als platte tekst zonder markdown, bullets of nummers. Scheid de drie berichten met een lege regel."""

    bericht = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}],
    )
    return bericht.content[0].text


def stuur_email(tekst: str, ontvanger: str) -> None:
    afzender = os.environ["GMAIL_USER"]
    wachtwoord = os.environ["GMAIL_APP_PASSWORD"]

    nu = datetime.now(timezone(timedelta(hours=2)))
    onderwerp = f"AI Briefing {nu.strftime('%A %d %B %Y')}"

    msg = MIMEText(tekst, "plain", "utf-8")
    msg["Subject"] = onderwerp
    msg["From"] = afzender
    msg["To"] = ontvanger

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(afzender, wachtwoord)
        server.sendmail(afzender, ontvanger, msg.as_string())

    print(f"Briefing verstuurd naar {ontvanger}")


if __name__ == "__main__":
    print("AI-nieuws ophalen...")
    nieuws = zoek_ai_nieuws()
    print(f"{len(nieuws)} berichten gevonden")

    print("Briefing samenstellen met Claude...")
    briefing = genereer_briefing(nieuws)

    print("\n" + "=" * 60)
    print(briefing)
    print("=" * 60 + "\n")

    ontvanger = os.environ.get("RECIPIENT_EMAIL", "bonheins@gmail.com")
    stuur_email(briefing, ontvanger)
