# OpenAI SDK API Reference

## Client Initialization

```typescript
import OpenAI from 'openai'

const client = new OpenAI({
    apiKey: 'your-api-key', // Required: API key
    baseURL: 'https://api.openai.com', // Optional: custom base URL (for proxies)
    timeout: 60000, // Optional: request timeout in ms
    maxRetries: 3 // Optional: max retry attempts
})
```

## Chat Completions

### Non-streaming

```typescript
const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' }
    ]
})

console.log(completion.choices[0].message.content)
```

### Streaming

```typescript
const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Say this is a test' }],
    stream: true
})

for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '')
}
```

### Streaming with runner

```typescript
const runner = client.chat.completions
    .stream({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello!' }]
    })
    .on('content', (delta, snapshot) => process.stdout.write(delta))

const finalContent = await runner.finalContent()
```

## Message Roles

- `system` - System instructions
- `developer` - Developer messages (formerly system in some contexts)
- `user` - User messages
- `assistant` - Assistant responses

## Response Structure

```typescript
interface ChatCompletion {
    id: string
    choices: [
        {
            message: {
                role: 'assistant'
                content: string | null
            }
            finish_reason: 'stop' | 'length' | 'content_filter'
        }
    ]
    usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}
```

## Error Handling

```typescript
try {
    const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello' }]
    })
} catch (error) {
    if (error instanceof OpenAI.APIError) {
        console.error(error.status, error.message)
    }
    throw error
}
```

## Project Integration Notes

In this project:

- API key stored in `userData.json` via `userData.setItem('apiKey', key)`
- Base URL configurable for custom endpoints
- Client should be initialized in main process
- Use IPC to communicate with renderer
