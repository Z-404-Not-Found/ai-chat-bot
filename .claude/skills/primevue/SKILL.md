---
name: primevue
description: PrimeVue UI component library for Vue.js. Use when building Vue applications with PrimeVue components (Button, DataTable, Dialog, InputText, etc.), configuring themes, working with forms, icons, or any PrimeVue-specific patterns. Triggers on queries about PrimeVue components, Vue UI libraries, or Vue component suites.
---

# PrimeVue Skill

Next-generation UI Component suite for Vue.js with 80+ components.

## Quick Start

```bash
npm install primevue @primeuix/themes
```

Basic setup in main.ts:

```typescript
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'

const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
```

## Key Patterns

### Auto Import (Recommended)

```bash
npm install -D unplugin-vue-components
```

Configure in vite.config.ts for on-demand imports with tree-shaking.

### Forms

Use PrimeVue Forms library for comprehensive form state management with built-in validation.

### Theming

- **Styled Mode**: Pre-styled themes (Aura, Lara, Nora, etc.)
- **Unstyled Mode**: Integrate with Tailwind or custom CSS
- **Pass Through API**: Access internal DOM for custom styling

### Icons

PrimeIcons (default, 250+ icons) or custom icon libraries via templating.

## Component Reference

See [references/components.md](references/components.md) for full component list with links.

## Installation Guides

- [Vite](https://primevue.org/vite)
- [Nuxt](https://primevue.org/nuxt)
- [Laravel](https://primevue.org/laravel)
- [CDN](https://primevue.org/cdn)

## Additional Resources

- [Configuration](https://primevue.org/configuration)
- [Tailwind Integration](https://primevue.org/tailwind)
- [Migration to v4](https://primevue.org/guides/migration/v4)
- [Accessibility](https://primevue.org/guides/accessibility)
- [MCP Server](https://primevue.org/mcp) for AI documentation access
