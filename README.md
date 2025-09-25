# METU Ring Logger

METU Ring bus logger

- Polls METU ring api for up-to-date bus locations
- Logs these locations to a postgres database
- Ghosts api provides ring locations from previous days

Frontend Repo: https://github.com/ulassekerci/metu-ring-tracker

---

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/ulassekerci/metu-ring-logger.git
cd metu-ring-logger
npm install
```

Create an .env file

```bash
PGHOST = "postgresql://username:password@ip/table"
# DISABLE_POLLING = 1
# DISABLE_LOGGING = 1
# ENABLE_MOCK = 1
```

Build and run the web app

```bash
npm run build
npm run start
```
