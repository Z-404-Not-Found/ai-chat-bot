<template>
    <div class="layout">
        <!-- 顶部导航栏 -->
        <header class="header">
            <div class="header-content">
                <h1>Markdown 渲染测试</h1>
                <div class="theme-switcher">
                    <span class="mode-label">主题模式：</span>
                    <SelectButton
                        v-model="currentMode"
                        :options="modeOptions"
                        option-label="label"
                        option-value="value"
                        @change="handleModeChange"
                    />
                </div>
            </div>
        </header>

        <!-- 主内容区 -->
        <main class="main">
            <div class="markdown-container">
                <MarkdownRenderer
                    :content="markdownContent"
                    :is-dark="isDark"
                    :is-streaming="true"
                />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SelectButton from 'primevue/selectbutton'
import MarkdownRenderer from '@renderer/components/MarkdownRenderer.vue'
import { useTheme } from '@renderer/composables/useTheme'

const { isDark, modeOptions, setThemeMode } = useTheme()

const currentMode = ref<'light' | 'dark' | 'system'>('light')

function handleModeChange(): void {
    setThemeMode(currentMode.value)
}

// 测试用的 Markdown 内容
const markdownContent = `
# Markdown Renderer 测试

这是一个 **Markdown 渲染组件**的测试页面。

## 功能特性

- ✅ 基于 **marked** 的高性能 Markdown 解析
- ✅ **highlight.js** 代码高亮支持
- ✅ **github-markdown-css** GitHub 风格样式
- ✅ **DOMPurify** XSS 安全防护
- ✅ 支持白天/黑夜模式切换

## 代码示例

### JavaScript
\`\`\`javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
\`\`\`

### Python
\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + [pivot] + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))
\`\`\`

### TypeScript
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

## 表格

| 名称 | 角色 | 部门 |
|------|------|------|
| Alice | 工程师 | 后端 |
| Bob | 设计师 | UI/UX |
| Charlie | 经理 | 运营 |

## 列表

### 无序列表
- 苹果
- 香蕉
  - 香蕉苹果
  - 香蕉梨
- 樱桃

### 有序列表
1. 第一步
2. 第二步
   1. 子步骤 A
   2. 子步骤 B
3. 第三步

### 任务列表
- [x] 完成的任务
- [ ] 未完成的任务
- [ ] 另一个任务

## 引用块

> 这是一个引用块。
> 可以有多行。
>
> 也可以有多个段落。

## 链接

[GitHub](https://github.com)
[OpenAI](https://openai.com)

## 强调

*斜体文本* 和 **粗体文本** 和 ***粗体斜体***。

~~删除线文本~~。

---

## 水平线

上方有一条水平线。

## 行内代码

使用 \`console.log()\` 打印到控制台。

这是一个 \`inline code\` 示例。
`
</script>

<style scoped>
.layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}

.header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
}

.theme-switcher {
    display: flex;
    align-items: center;
    gap: 12px;
}

.mode-label {
    font-size: 14px;
    opacity: 0.9;
}

.main {
    flex: 1;
    padding: 32px;
    overflow: auto;
}

.markdown-container {
    max-width: 900px;
    margin: 0 auto;
}
</style>
