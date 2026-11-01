# Blogs/Posts API (Express)

Lightweight REST API on Express with in-memory storage for blogs and posts.

## Quick start

1. Install dependencies:
   - `npm install`
2. Create local env:
   - copy `.env.example` to `.env`
3. Run in dev mode:
   - `npm run dev`
4. Run tests:
   - `npm test`

Default server URL: `http://localhost:5001`

## Scripts

- `npm start` - run server
- `npm run dev` - run with nodemon
- `npm test` - run Jest tests
- `npm run tunnel` - expose local server via ngrok
- `npm run tunnel:lt` - expose local server via localtunnel

## Important endpoints

- `GET /health` - health check
- `GET /hometask_04/api/blogs`
- `POST /hometask_04/api/blogs` (Basic auth required)
- `GET /hometask_04/api/posts`
- `POST /hometask_04/api/posts` (Basic auth required)

## Work with ngrok

1. Start API locally:
   - `npm run dev`
2. In another terminal start tunnel:
   - `npm run tunnel`
3. Use generated public https URL + API path, for example:
   - `https://<your-ngrok-id>.ngrok-free.app/hometask_04/api/blogs`

## Auth

Basic auth credentials are read from environment variables:

- `ADMIN_LOGIN`
- `ADMIN_PASSWORD`

Defaults are only for local dev and test usage.
