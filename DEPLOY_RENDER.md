# Deploy to Render (Docker)

1. Push your repository to GitHub (or Git provider).

2. In Render dashboard, create a new **Web Service** and connect your repo.

3. Choose **Docker** environment and ensure `render.yaml` or `Dockerfile` is present (we added both).

4. Set environment variables in Render (e.g., `DATABASE_URL`, `JWT_SECRET`, any `.env` values).

5. Deploy — Render will build the Docker image using the `Dockerfile` and run `node dist/main`.

Notes:
- If you prefer Render to build from source instead of shipping `dist`, change `env: node` and set `buildCommand: npm ci && npm run build` and `startCommand: npm run start:prod` in the service settings.
- Do NOT commit production secrets; set them in Render's Environment settings.
