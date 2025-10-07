# 🍽️ Finding Nibbles  
**Semester / Year:** 2025 Semester 1  

---

## Table of Contents
1. [Overview](#overview)  
2. [Change Log Since Milestone 3](#change-log-since-milestone-3)  
3. [Contributors](#contributors)  
4. [Tech Stack](#tech-stack)  
5. [Installation & Execution](#installation--execution)  
6. [Security & Configuration](#-security--configuration)  
7. [Architecture & Modules](#️-architecture--modules)  
8. [Versioning Strategy](#-versioning-strategy)  
9. [Contribution & PR Strategy](#-contribution--pr-strategy)  
10. [Deployment](#-deployment)  
11. [Known Issues](#-known-issues)  
12. [Troubleshooting](#-troubleshooting)  
13. [Future Roadmap](#️-future-roadmap)  
14. [References](#-references)  
15. [AI Declaration](#-ai-declaration)

---

## Overview
**Finding Nibbles** is an AI-driven Meteor-based web application designed to help users decide *what* and *where* to eat based on their preferences, dietary requirements and current location. It integrates Google Maps and Places APIs for real-time restaurant data and applies machine learning models to recommend dishes intelligently.

### Key Features
- 🎲 **Cuisine Dice Roll:** Suggests random dining options for indecisive users.  
- 🥗 **Dietary Filters:** Personalised filters for vegan, vegetarian, gluten-free and allergy-sensitive options.  
- 🧠 **AI-Enhanced Recommendations:** Uses natural language analysis of menus and reviews for dish-level insights.  
- 📍 **Location Awareness:** Finds nearby restaurants using Google Maps and Places APIs.  
- 🌙 **Responsive UI:** Built with React and MUI for mobile-friendly experiences.

---

## Change Log Since Milestone 3
- Completed full documentation structure and finalised handover format.  
- Added **Contribution & Versioning Strategy** sections for maintainability.  
- Expanded **Troubleshooting** with detailed causes and resolutions.  
- Introduced **Future Roadmap** &  **Security & Configuration** sections.  
- Improved readability, grammar and formatting consistency across the README.

---

## Contributors
- **Aaron Tran**  
- **Arnav Singh Sethi**  
- **Chetan Somuse**  
- **Daksh Malhotra**  
- **Jack Bastasin**  
- **Koharu Numaga**  
- **Krishna**  
- **Kuhu Tosniwal**  
- **Mankirat Dhillon**  
- **Michael**  
- **Omila Herath**  
- **Ubaid Irfan**

---

## Tech Stack
**Framework:** Meteor  
**Frontend:** React, React Router, Material UI (MUI), TailwindCSS, Framer Motion  
**Charts:** Recharts  
**Mapping & APIs:** @react-google-maps/api (Google Maps & Places)  
**AI Integration:** Google Vertex AI (planned), Hugging Face model integration  
**Database:** MongoDB (Minimongo sync)  
**Language:** JavaScript (ES6), TypeScript, Python (for AI scripts)  
**Testing:** meteortesting:mocha  
**Build / Runtime:** Node.js (v18+), npm  

### Recommended Enhancements
- Add ESLint + Prettier for code style consistency.  
- Implement Husky pre-commit hooks for linting and tests.

---

## Installation & Execution

### Prerequisites
- Node.js v18+  
- Meteor installed (`npm install -g meteor`)  
- Internet access for API calls  
- Modern browser (Chrome/Firefox)  
- Minimum specs: Quad-core CPU, 8 GB RAM, 10 GB free disk  

### Setup
```bash
git clone https://github.com/Monash-FIT3170/2025W1-FindingNibbles
cd 2025W1-FindingNibbles
meteor npm install

### Run
```bash
meteor run --settings settings.json

Then open **http://localhost:3000**

## Security & Configuration

Never commit real API keys or credentials.

Use a sanitised `settings.json` (example below):

```json
{
  "public": {
    "googlePlacesApiKey": "<GOOGLE_PLACES_API_KEY>",
    "huggingFaceAccessToken": "<HUGGING_FACE_ACCESS_TOKEN>"
  },
  "private": {
    "googleServiceAccount": {
      "type": "service_account",
      "project_id": "<GCP_PROJECT_ID>",
      "private_key_id": "<PRIVATE_KEY_ID>",
      "private_key": "-----BEGIN PRIVATE KEY-----\\n<KEY MATERIAL REDACTED>\\n-----END PRIVATE KEY-----\\n",
      "client_email": "<SERVICE_ACCOUNT_EMAIL>",
      "client_id": "<CLIENT_ID>",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "<CERT_URL>",
      "universe_domain": "googleapis.com"
    }
  }
}
```

**Security Notes**
- Add `.gitignore` entries for `settings.local.json` and `.env.*`.
- Use `Meteor.settings.private` for sensitive configurations.
- Avoid exposing keys in client-side code.

---

## 🏗️ Architecture & Modules

### High-Level Overview
The app follows a client–server Meteor architecture.

- **Client:** React UI with MUI components, Tailwind styling, Google Maps integration.
- **Server:** Meteor methods & publications for data retrieval, caching, preferences, AI enrichment.
- **Database:** MongoDB for user preferences, cached restaurants, dietary filters, AI-ranked results.

### Data Flow
1. User sets location & preferences.
2. Meteor method queries Google Places API.
3. AI layer (Hugging Face / Vertex AI) refines / ranks results.
4. Ranked recommendations rendered in React.

---

## 🧩 Versioning Strategy
- **Semantic Versioning:** `MAJOR.MINOR.PATCH`
- **Initial Stable:** `v1.0.0` (Milestone 4 handover)
- **Pre-release Tags:** `v0.9.0-rc.1`, etc.
- Maintain `CHANGELOG.md` (sections: Added / Changed / Fixed / Deprecated / Security).

---

## 🤝 Contribution & PR Strategy

### Branching
- `main` – stable, deployable.
- `feature/<feature-name>`
- `fix/<issue-id>`
- `chore/<task>`

### Commit Convention (Conventional Commits)
- `feat: add new map filtering`
- `fix: resolve minimongo write issue`
- `docs: update README`

### PR Process
1. Branch from `main`.
2. Ensure tests pass (`npm run test`).
3. Lint & format (when tooling added).
4. PR includes: Summary, screenshots or screen recording of demo and other notes
5. 1–2 reviewer approvals.
6. Squash & merge.

## 🚀 Deployment

### Production Setup
1. Create `production-settings.json` (sanitised keys).
2. Set environment:
   ```bash
   export NODE_ENV=production
   ```
3. Deploy (Meteor Cloud / Galaxy assumed):
   ```bash
   meteor deploy findingnibbles.meteorapp.com --settings production-settings.json
   ```

---

## 🐞 Known Issues

| Issue | Description | Suggested Fix |
|-------|-------------|---------------|
| API Limits | Google & Hugging Face quotas exceeded | Add caching, retry + exponential backoff |
| Minimongo first-write failure | First save triggers internal server error | Check allow/deny, verbose Mongo logs, method latency compensation |
| UI state reset after refresh | Client cache mismatch after reload | Re-fetch on load, explicit invalidation, persist filters |
| Mobile Responsiveness | Layout inconsistent on small screens | Add responsive breakpoints (MUI + Tailwind) |

---

## 🧭 Troubleshooting

| Symptom | Cause | Resolution |
|---------|-------|-----------|
| Port already in use | Stale Meteor/node process | `taskkill /F /IM node.exe` (Windows) or use `--port 4000` |
| Meteor rebuild loop | Corrupted local build artifacts | Delete `.meteor/local` then reinstall |
| Dependency mismatch | Version conflicts | `rm -rf node_modules && meteor npm install` |
| API key errors | Missing/invalid settings | Verify `settings.json` + env vars |
| AI timeouts | Rate limit / network | Implement retry with backoff + fallback mode |

---

## 🗺️ Future Roadmap

| Priority | Item | Description |
|----------|------|-------------|
| P1 | Fix Minimongo write bug | Ensure reliable persistence workflow |
| P2 | Improve state hydration | Persist filters & selected recommendations |
| P2 | Full Vertex AI integration | Advanced NLP scoring pipeline |
| P3 | Implicit preference learning | Behavior-based personalisation |
| P3 | Mobile PWA | Installability + offline cache |
| P3 | Dark / high-contrast mode | Accessibility & UX enhancement |

---

## 🔗 References
- Meteor Docs: https://docs.meteor.com/
- React: https://react.dev/
- MongoDB: https://www.mongodb.com/docs/
- Google Places API: https://developers.google.com/maps/documentation/places
- Google Maps Platform: https://developers.google.com/maps/documentation
- TailwindCSS: https://tailwindcss.com/docs
- Material UI: https://mui.com/
- Framer Motion: https://motion.dev/
- Vertex AI: https://cloud.google.com/vertex-ai/docs

---

## 🤖 AI Declaration
This document was initially drafted and structured with the assistance of AI-powered text generation tools, which provided formatting, numbered layouts and suggested content placeholders. All technical instructions, code snippets and project-specific information have been provided, verified and refined by the development team, ensuring correctness, readability and applicability to the Finding Nibbles project.

2025 Finding Nibbles Team — Monash FIT3170


