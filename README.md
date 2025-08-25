# LäsMonitor – statisk SPA (GitHub Pages)

Detta är en färdigbyggd, helt statisk webbapp som kan köras direkt via GitHub Pages (ingen build behövs).

## Snabbstart
1. Skapa ett nytt tomt GitHub-repo, t.ex. `lasmonitor`.
2. Ladda upp *alla filer i denna zip* till repo: `index.html`, `app.js`, `styles.css`, `README.md`.
3. Aktivera **Settings → Pages** för repot, välj branch `main` och folder `/root`.
4. Öppna din Pages‑URL. All data lagras lokalt i webbläsaren. Export/Import finns under Inställningar.

## Funktioner
- Elever (namn, årskurs 7–9)
- Mätningar: WPM, förståelse %, Lexile, LIX, DLS (stanine/percentil) + anteckningar
- NRS (0–100) = vägd normalisering av WPM, förståelse och nivå (Lexile/LIX/DLS)
- Grafer (Chart.js via CDN): klassens NRS, elevens NRS/WPM/Förståelse, senaste NRS per elev
- Materialbank: titel, Lexile, LIX, antal ord
- Export/Import JSON + spara/öppna fil via **File System Access API** (välj OneDrive‑mapp för molnbackup)

## Sekretess
Ingen server. All logik körs i webbläsaren. JSON-filerna sparas lokalt eller i din egen OneDrive‑mapp.

## Tips
- File System Access API fungerar bäst i Chromium‑baserade webbläsare (Edge/Chrome) över HTTPS (GitHub Pages är OK).
- Om FS‑API inte stöds: använd “Ladda ner JSON” / “Importera JSON” istället.
