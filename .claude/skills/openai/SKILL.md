---
name: openai
description: OpenAI SDK integration for chat completions in Electron apps. Use when (1) implementing OpenAI API calls with the `openai` npm package, (2) configuring OpenAI client with API key and base URL, (3) creating chat completion requests (streaming or non-streaming), (4) handling OpenAI responses and errors, (5) integrating chat functionality in the main process with IPC communication to renderer.
---

# OpenAI Skill

## Quick Start

```typescript
import OpenAI from 'openai'

// Initialize client (use userData.getItem for API key)
const client = new OpenAI({
    apiKey: userData.getItem('apiKey'), // from src/main/utils/userData.ts
    baseURL: userData.getItem('baseURL') // optional, for proxies
})

// Create chat completion
const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello!' }]
})
```

## Key Patterns

- **Client initialization**: In main process, read API key from `userData.json`
- **Streaming responses**: Use `stream: true` for real-time output
- **IPC communication**: Send AI responses to renderer via `mainWindow.webContents.send()`

## Reference

- **API details**: See [api.md](references/api.md) for complete SDK documentation
