# Populii

> En musikafspiller til deling, hvor alle stemmer om, hvad der spiller næste gang.

Populii er en webapp til semesterprojekt på ITA's 1. semester. Brugerne opretter eller tilmelder sig en delt musikafspiller — en "kø" — og stemmer i realtid om, hvilken sang der spiller næste gang. Sangen med flest stemmer vinder.

populii.onrender.com

---

## Funktioner

- **Opret bruger og log ind** med brugernavn, adgangskode, e-mail, alder, land og køn
- **Opret en kø** — få et unikt 6-cifret kø-ID, du kan dele med andre
- **Tilmeld dig en kø** — skriv kø-ID'et ind for at hoppe ind i en andens session
- **Go solo** — lyt alene uden at tilmelde dig en delt kø
- **Stem** — hver bruger får én stemme pr. runde; sangen med flest stemmer spiller næste gang
- **Progressionsbjælke i realtid** — viser, hvor langt du er i den aktuelle sang
- **Dynamisk coverbillede** — opdateres automatisk baseret på den aktuelle kunstner
- **Forlad kø til enhver tid** — forlad køen og vend tilbage til sessionmenuen

---

## Teknologier

| Lag          | Teknologi                         |
|--------------|-----------------------------------|
| Frontend     | HTML, CSS og JavaScript           |
| Backend      | Node.js + Express 5               |
| Database     | PostgreSQL (hostet på Neon)       |
| Databasedriver | `pg` (node-postgres)            |
| Udviklingsserver | `nodemon`                     |

---

## Databaseskema

```
users           — brugerkonti      (user_id, username, email, age, gender, country, password, session_id)
tracks          — musikbibliotek   (track_id, artist_name, title, length, genre)
session_nt      — aktive køer      (session_id)
session_tracks  — køposter         (session_track_id, session_id, track_id, vote_count, fallback_order, currently_playing)
votes           — stemmeregistrering (vote_id, user_id, session_track_id)
```

Sessions-ID'er starter ved **100001** for at sikre, at kø-ID'et altid er 6 cifre.

---

## Kom i gang

### Forudsætninger

- [Node.js](https://nodejs.org/) (version 18 eller nyere)
- En PostgreSQL-database — projektet bruger [Neon](https://neon.tech/)

### Opsætning

1. **Klon repositoriet**
   ```bash
   git clone https://github.com/jonathanhj123/NextTrack.git
   cd NextTrack
   ```

2. **Installér afhængigheder**
   ```bash
   npm install
   ```

3. **Opret en `.env`-fil** i projektets rodmappe:
   ```env
   PG_HOST=din-db-host
   PG_PORT=5432
   PG_DATABASE=dit-db-navn
   PG_USER=dit-db-brugernavn
   PG_PASSWORD=din-db-adgangskode
   ```

4. **Opsæt databasen** (sletter og gendanner alt, importerer startdata):
   ```bash
   npm run create-db
   ```

5. **Start serveren**
   ```bash
   npm run dev-server
   ```
   Eller på Windows: dobbeltklik på `runserver.bat`.

6. Åbn din browser på **http://localhost:3010**

---

## Sådan fungerer en session

```
Brugeren logger ind
        │
        ▼
Sessionsmenu ──► Opret kø ──► Får et 6-cifret kø-ID
        │                              │
        └──────► Tilmeld kø ◄───── Del kø-ID med venner
                      │
                      ▼
               Dashboard (køvisning)
               ├── Spiller nu: sangtitel + kunstner + progressionsbjælke + coverbillede
               └── Stemmepanel: 8 kommende sange, én stemme pr. bruger pr. runde
                      │
                      ▼
               Sang slutter ──► Sortér efter stemmer ──► Næste sang spiller ──► Gentag
```

---

## Scripts

| Kommando             | Beskrivelse                                             |
|----------------------|---------------------------------------------------------|
| `npm run create-db`  | Gendanner databasen og importerer startdata             |
| `npm run dev-server` | Starter serveren med automatisk genindlæsning (nodemon) |
| `npm run prod-server`| Starter serveren uden automatisk genindlæsning          |

---

*Bygget til ITA 1. semester — Populii*
