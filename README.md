# repo-pdf-view

A lightweight Vue 3 + TypeScript PDF viewer with a local AI helper (Ollama) for document Q&A and click-to-navigate results.

Key features
- Render PDFs with pdfjs-dist (canvas + selectable text layer)
- Search & highlight text on pages
- Local LLM integration via Ollama for natural-language queries (answers include page sources)
- Click AI results to jump to and highlight the referenced page
- Docker-ready (app + Ollama in docker-compose)

Quick start (Docker)
```bash
# build & start app + Ollama
docker-compose up -d --build

# web UI: http://localhost:5173
# Ollama API: http://localhost:11434
```


Where to look
- UI: src/App.vue, src/components/{PdfCanvas,PdfControls,AiCommandPanel,SearchResults,OllamaStatus}.vue
- PDF logic: src/composables/usePdfOperations.ts, usePdfSearch.ts
- AI logic: src/composables/useAiCommands.ts, useOllama.ts
- State: src/stores/*.ts
- Docker: Dockerfile, docker-compose.yml

Notes
- Docker compose mounts the project for live dev and includes a healthchecked Ollama service.
- src/api.ts contains stubbed LLM responses for offline testing.
