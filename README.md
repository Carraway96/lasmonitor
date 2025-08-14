
# Läsutveckling – MVP

En enkel React-applikation för att lägga in elever (åk 7–9), registrera läsdata (Lexile/LIX/LEX/Custom), samt DLS-resultat – med grafer över utveckling och export/import av data.

## Funktioner nu
- 👤 Elever: lägg till/ta bort, åk 7–9
- 📝 Läsningar: datum, skala (Lexile/LIX/LEX/Custom), värde, förståelse %, ord/min, kommentar
- 🧪 DLS: valfria deltest med råpoäng/stanine/percentil
- 📈 Grafer: nivåer över tid + normaliserad indexgraf (100 = första mätningen). LIX hanteras med omvänd riktning i indexgrafen.
- 💾 Lokal lagring (webbläsare) + Export/Import (JSON). Lägg filen i OneDrive för backup eller delning.
- 🧠 Enkel rekommendation av nästa nivå (heuristik utifrån senaste förståelser).

## Kör lokalt
```bash
npm install
npm run dev
```

## Bygg & publicera på GitHub Pages
1. I `vite.config.ts` – låt `base` vara tom (`''`) om du publicerar på en anpassad domän. Om du använder Pages på en användar-/organisation-sida med repo-namn, sätt `base: '/REPO-NAMN/'`.
2. Kör:
   ```bash
   npm run build
   npm run deploy
   ```

Alternativt: aktivera GitHub Pages och peka mot `dist/` via Actions eller `gh-pages`-grenen.

## Import/Export och OneDrive
- **Lokal lagring:** All data finns i webbläsarens `localStorage`.
- **Export:** Klicka **Exportera** och välj en plats – lägg gärna i en OneDrive-mapp.
- **Import:** Klicka **Importera** och välj JSON-filen (t.ex. från OneDrive).

> **Direktintegration med OneDrive (Microsoft Graph):**  
> Går att lägga till när/om du vill. Kräver:
> - En Azure AD-app (Entra ID) med MS Graph `Files.ReadWrite`-rättigheter.
> - MSAL (OAuth) i frontenden för att logga in och få access token.
> - Uppladdning via `createUploadSession` (resumerad PUT).  
> Jag kan lägga in detta i en nästa iteration med en tydlig inställningssida (logga in/logga ut, välj standardfil).

## Normalisering mellan olika skalor
Eftersom Lexile, LIX, LEX m.fl. inte är direkt jämförbara används två visuella grepp:
1. **Separata serier** i "Nivåer över tid"-grafen.
2. **Indexgraf** där varje skala normaliseras mot elevens första mätning (100 = start). För LIX hanteras omvänd riktning (lägre = enklare) så att ökande index betyder förbättring.

I en senare version kan vi lägga till:
- Tabell med brytpunkter (t.ex. kända percentiler/normer) per åk och skala.
- Möjlighet att mappa egna nivåer → percentil → gemensam skala.

## Datastruktur (förenklad)
```ts
Student: { id, name, grade (7|8|9), createdAt }
ReadingSession: { id, studentId, date, scale, value, comprehension?, wpm?, comments? }
DLSResult: { id, studentId, date, subtests: [{ name, raw?, stanine?, percentile? }], comments? }
AppData: { version, students: Student[], sessions: ReadingSession[], dls: DLSResult[] }
```

## Rekommenderad nivå (heuristik)
- Tar de tre senaste läsningarna.
- Medel-förståelse ≥ 85% ⇒ +10% nivåförslag
- Medel-förståelse ≤ 60% ⇒ −10% nivåförslag
- Annars: behåll nivån.  
> Detta är bara en start – vi kan byta till regler du önskar (t.ex. 2/3 på 75–90% ⇒ +1 steg, osv.).

---

_MVP skapad 2025-08-14._
