This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
src/
├── component/
│   │
│   ├── HomeChat.jsx → Main chat controller (handles user input, AI requests & chat state)
│   │
│   ├── ChatMessages.jsx → Render conversation messages, recipe cards & AI responses
│   │
│
├── lib/
│   │
│   ├── language.js → Language translations & formatting
│   │
│   ├── recipes.js → Load all recipe JSON data
│   │
│   ├── utils.js → Shared helper functions
│   │
│   └── ai/
│       │
│       ├── config.js → AI settings & constants
│       │
│       ├── language-detector.js → Detect user language (EN / BN)
│       │
│       ├── prompt-parser.js → Detect intent, parse prompt & extract search query
│       │
│       ├── conversation-manager.js → Manage conversation context & session
│       │
│       ├── entity-extractor.js → Extract ingredients, dish, cuisine, category, etc.
│       │
│       ├── entity-normalizer.js → Normalize extracted entities
│       │
│       ├── recipe-memory.js → Store conversation history & previous recipe context (Limi 200 conversation will remove FIFO system)
│       │
│       ├── recommendation-engine.js → Main AI engine (orchestrates recipe search & ranking)
│       │
│       ├── recipe-matcher.js → Find matching recipes
│       │
│       ├── recipe-ranker.js → Rank recipes by relevance score
│       │
│       └── recipe-response.js → Generate final assistant response
│
├── data/
│   └── recipes/
│       ├── index.js → Export all recipe JSON files
│       ├── chicken-biryani.json
│       ├── beef-burger.json
│       ├── vegetable-salad.json



Phase 1 — Foundation
✅ config.js Ok
✅ language-detector.js Ok no need to change in future
✅ prompt-parser.js
✅ entity-normalizer.js
✅ entity-extractor.js
Phase 2 — Conversation
✅ recipe-memory.js
✅ conversation-manager.js
Phase 3 — Search Engine
✅ recommendation-engine.js
✅ recipe-matcher.js
✅ recipe-ranker.js
Phase 4 — Response
✅ recipe-response.js
✅ generate-recipe.js
Phase 5 — UI
✅ HomeChat.jsx
✅ ChatMessages.jsx
✅ ChatInput.jsx