# Welcome 

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## xAI Speech-to-Speech Voice Agent

Phase 1 integrates the deployed xAI Speech-to-Speech agent through a Vercel serverless ephemeral-token endpoint. Configure `XAI_API_KEY` only as a server-side environment variable (for example, in Vercel project settings). Enable the browser orb with `VITE_XAI_VOICE_ENABLED=true`.

The browser never uses a permanent xAI API key. It requests `POST /api/xai-realtime-token`, receives only `{ "token": "<temporary-token>", "expiresAt": 1234567890 }`, and authenticates the WebSocket with the `xai-client-secret.<temporary-token>` subprotocol. Speaker echo and interruption behavior must be validated on real devices before claiming live browser parity.

Development diagnostics for this integration are intentionally metadata-only. They may include feature-flag/orb status, route path, token request timing/status, WebSocket lifecycle categories, microphone sample-rate/chunk counters, server VAD timing, response IDs, audio chunk counts, playback duration estimates, queue drain, and cleanup reasons. They must never include permanent keys, temporary tokens, transcripts, audio bytes, or personal data.
