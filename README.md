# CHaredim Backend Server

This repo contains the existing React/Vite frontend and a Node.js/Express backend inside the `server/` folder.

## Backend setup

```bash
cd server
npm install
cp ../.env.example ../.env
node index.js
```

The API will be available at:

```
http://localhost:4000/api
```

## Environment variables

See `.env.example` for the required variables.

## Frontend connection

Use the backend base URL in the frontend:

```
http://localhost:4000/api
```

Example endpoints:
- `GET /api/health`
- `GET /api/posts`
- `GET /api/posts/:slug`
- `GET /api/briefs`
- `POST /api/briefs/import-charedim`
