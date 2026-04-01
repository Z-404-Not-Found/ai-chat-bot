<template>
    <div class="markdown-demo">
        <div class="header">
            <h1>Markdown Demo</h1>
            <p class="subtitle">marked + highlight.js + github-markdown-css + DOMPurify</p>
        </div>

        <div class="content">
            <div class="markdown-body" :class="{ dark: isDarkMode }" v-html="renderedContent"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import 'highlight.js/styles/github.css'
import 'github-markdown-css/github-markdown.css'

// 暗色模式检测
const isDarkMode = ref(false)

function updateDarkMode(): void {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
}

onMounted(() => {
    updateDarkMode()
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateDarkMode)
})

onUnmounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.removeEventListener('change', updateDarkMode)
})

watch(isDarkMode, () => {
    // 暗色模式变化时重新渲染内容
})

// 配置 marked 使用 highlight.js
marked.setOptions({
    gfm: true,
    breaks: true
})

// 自定义代码块渲染器，使用 highlight.js
const renderer = {
    code({ text, lang }: { text: string; lang?: string }): string {
        const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
        const highlighted = hljs.highlight(text, { language }).value
        return `<pre class="hljs"><code class="language-${language}">${highlighted}</code></pre>`
    }
}

marked.use({ renderer })

// 完整的 markdown 测试内容
const markdownContent = `
# Markdown Test Document

This is a comprehensive test page for all markdown features.

## Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

## Emphasis

*Italic text* and **Bold text** and ***Bold italic***.

This is also **bold** and this is *italic*.

~~Strikethrough text~~.

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested Item 2.1
  - Nested Item 2.2
- Item 3

### Ordered List
1. First item
2. Second item
   1. Nested first
   2. Nested second
3. Third item

### Task List
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> And have multiple paragraphs.

## Links and Images

### Links
[GitHub](https://github.com)
[OpenAI](https://openai.com)

## Code

### Inline Code
Use \`console.log()\` to print to console.

### Code Block (JavaScript)
\`\`\`javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(result); // 55
\`\`\`

### Code Block (Python)
\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))
\`\`\`

### Code Block (TypeScript)
\`\`\`typescript
interface User {
    id: number;
    name: string;
    email: string;
}

async function fetchUser(id: number): Promise<User> {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) {
        throw new Error('User not found');
    }
    return response.json();
}
\`\`\`

### Code Block (Rust)
\`\`\`rust
fn main() {
    let numbers: Vec<i32> = (1..=10).collect();
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}
\`\`\`

### Code Block (SQL)
\`\`\`sql
SELECT users.name, COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE users.created_at > '2024-01-01'
GROUP BY users.id
HAVING COUNT(orders.id) > 5
ORDER BY order_count DESC;
\`\`\`

## Tables

| Name | Role | Department |
|------|------|------------|
| Alice | Engineer | Backend |
| Bob | Designer | UI/UX |
| Charlie | Manager | Operations |

### Aligned Table
| Left | Center | Right |
|:-----|:------:|------:|
| L1 | C1 | R1 |
| L2 | C2 | R2 |

## Horizontal Rule

---

## HTML Elements

<span style="color: red;">Colored text</span>

## Links with Title

[OpenAI Website](https://openai.com "OpenAI's Homepage")
`

const renderedContent = computed(() => {
    const html = marked.parse(markdownContent) as string
    return DOMPurify.sanitize(html, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['target', 'rel']
    })
})
</script>

<style scoped>
.markdown-demo {
    min-height: 100vh;
    background: var(--bg-color);
    transition: background 0.3s;
}

.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 32px;
    text-align: center;
}

.header h1 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 600;
}

.subtitle {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
}

.content {
    max-width: 900px;
    margin: 32px auto;
    padding: 0 16px;
}

.markdown-body {
    padding: 32px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    background: var(--content-bg);
    color: var(--text-color);
    transition:
        background 0.3s,
        color 0.3s;
}

/* Light mode variables */
:root {
    --bg-color: #fafafa;
    --content-bg: white;
    --text-color: #333;
}

/* Dark mode variables */
.markdown-body.dark,
:root.dark {
    --bg-color: #1a1a1a;
    --content-bg: #252525;
    --text-color: #e0e0e0;
}

.markdown-body.dark {
    background: var(--content-bg);
    color: var(--text-color);
}

/* Code block styling */
.markdown-body :deep(pre) {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
}

.markdown-body :deep(pre code) {
    background: transparent;
    padding: 0;
}

.markdown-body.dark :deep(pre) {
    background: #2d2d2d;
}
</style>
