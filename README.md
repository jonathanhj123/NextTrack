# Populii

> A collaborative music queue where everyone gets a vote on what plays next.

Populii is a web app built for the ITA 1st semester project. Users create or join a shared music queue — a "Q" — and vote in real time on which track plays next. The song with the most votes wins. No DJ needed.

---

## What it does

- **Register & log in** with a username, password, email, age, country, and gender
- **Create a Queue** — get a unique 6-digit Q ID to share with friends
- **Join a Queue** — type in the Q ID to jump into someone else's session
- **Go Solo** — listen on your own without joining a shared queue
- **Vote** — each user gets one upvote per round; the top-voted song plays next
- **Live progress bar** — shows how far into the current track you are
- **Dynamic cover art** — artwork updates automatically based on the current artist
- **Leave anytime** — leave the queue and return to the session menu

---

## Tech stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Vanilla HTML, CSS, JavaScript     |
| Backend    | Node.js + Express 5               |
| Database   | PostgreSQL (hosted on Neon)       |
| DB driver  | `pg` (node-postgres)              |
| Dev server | `nodemon`                         |

---

## Project structure

```
NextTrack/
├── backend/
│   └── server.js          # Express server & all API routes
├── db/
│   ├── connect.js         # PostgreSQL connection pool
│   ├── createDb.js        # Drops & recreates the database schema, imports CSV data
│   ├── tracks.csv         # Seed data — all tracks
│   └── users.csv          # Seed data — demo users
├── frontend/
│   ├── index.html         # Landing / welcome page
│   ├── login.html         # Login form
│   ├── register.html      # Registration form
│   ├── session.html       # Choose: create queue, join queue, or go solo
│   ├── join.html          # Enter a 6-digit Q ID
│   ├── dashboard.html     # The main queue view with voting
│   ├── solo.html          # Solo listening mode
│   ├── js/
│   │   ├── login.js       # Login logic
│   │   ├── register.js    # Registration logic & validation
│   │   ├── session.js     # Redirect to join / solo
│   │   ├── create.js      # Create a new queue session
│   │   ├── join.js        # Join an existing queue session
│   │   ├── queue.js       # Voting, track playback & progress bar
│   │   ├── coverArt.js    # Dynamic cover art based on current artist
│   │   └── leave.js       # Leave the current queue
│   └── *.css              # Styles per page + universal.css
├── images/
│   ├── trackart/          # Per-artist cover images (1.jpg – 10.jpg)
│   ├── artist.csv         # Maps artist names to cover image IDs
│   ├── coverart.jpg       # Default fallback cover image
│   └── favicon.ico
├── package.json
├── .env                   # Database credentials (not committed)
└── runserver.bat          # Windows shortcut to start the dev server
```

---

## Database schema

```
users           — user accounts (user_id, username, email, age, gender, country, password, session_id)
tracks          — music library  (track_id, artist_name, title, length, genre)
session_nt      — active queues  (session_id)
session_tracks  — queue entries  (session_track_id, session_id, track_id, vote_count, fallback_order, currently_playing)
votes           — vote records   (vote_id, user_id, session_track_id)
```

Session IDs start at **100001** to guarantee a 6-digit Q ID.

---

## API endpoints

| Method | Path                              | Description                          |
|--------|-----------------------------------|--------------------------------------|
| GET    | `/api/checkIfUserExists/:username`| Returns `true`/`false`               |
| POST   | `/api/checkPassword`              | Validates username + password        |
| POST   | `/api/register`                   | Creates a new user account           |
| GET    | `/api/getUserId/:username`        | Returns the user's ID                |
| POST   | `/api/createSession`              | Creates a new queue, assigns creator |
| GET    | `/session/:session_id`            | Validates a session ID and joins it  |
| POST   | `/api/leaveSession`               | Sets `session_id = null` for user    |
| GET    | `/tracks`                         | Returns all tracks in random order   |

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- A PostgreSQL database — the project uses [Neon](https://neon.tech/)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/jonathanhj123/NextTrack.git
   cd NextTrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the project root:
   ```env
   PG_HOST=your-db-host
   PG_PORT=5432
   PG_DATABASE=your-db-name
   PG_USER=your-db-user
   PG_PASSWORD=your-db-password
   ```

4. **Set up the database** (drops and recreates everything, imports seed data):
   ```bash
   npm run create-db
   ```

5. **Start the server**
   ```bash
   npm run dev-server
   ```
   Or on Windows, just double-click `runserver.bat`.

6. Open your browser at **http://localhost:3010**

---

## How a session works

```
User logs in
     │
     ▼
Session menu ──► Create Queue ──► Gets a 6-digit Q ID
     │                                    │
     └──────► Join Queue ◄────── Share Q ID with friends
                   │
                   ▼
            Dashboard (Queue view)
            ├── Now playing: track title + artist + progress bar + cover art
            └── Vote panel: 8 upcoming tracks, one upvote per user per round
                   │
                   ▼
            Track ends ──► Sort by votes ──► Next track plays ──► Repeat
```

---

## Scripts

| Command              | Description                                  |
|----------------------|----------------------------------------------|
| `npm run create-db`  | Recreate the database and import seed data   |
| `npm run dev-server` | Start the server with live-reload (nodemon)  |
| `npm run prod-server`| Start the server without live-reload         |

---

*Built with for ITA 1st semester — Populii*
