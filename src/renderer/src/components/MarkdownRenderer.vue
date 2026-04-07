<template>
    <div class="markdown-wrapper">
        <div
            ref="containerRef"
            class="markdown-body theme-fade"
            :class="[props.isDark ? 'dark' : 'light', { fading: isTransitioning }]"
            v-html="renderedContent"
        ></div>
        <span
            class="stream-cursor"
            :class="{ visible: isCursorVisible, dark: !!props.isDark }"
            :style="cursorStyle"
            aria-hidden="true"
        ></span>
    </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'

// 预加载浅色和暗色主题 CSS
import hljsLight from 'highlight.js/styles/github.css?url'
import hljsDark from 'highlight.js/styles/github-dark.css?url'
import markdownLight from 'github-markdown-css/github-markdown-light.css?url'
import markdownDark from 'github-markdown-css/github-markdown-dark.css?url'

/**
 * MarkdownRenderer 组件
 * 使用 marked + highlight.js + github-markdown-css + DOMPurify 渲染 Markdown 内容
 * 支持白天/黑夜模式自动切换
 */

// 主题切换过渡状态
const isTransitioning = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const isCursorVisible = ref(false)
const cursorStyle = ref<{ left: string; top: string }>({
    left: '0px',
    top: '0px'
})

const props = withDefaults(
    defineProps<{
        /** Markdown 文本内容 */
        content: string
        /** 是否处于流式输出中（显示末尾光标） */
        isStreaming?: boolean
        /** 外部传入的暗色模式状态（优先级高于 darkMode） */
        isDark?: boolean | null
        /** 是否启用 GFM 格式（表格、删除线等） */
        gfm?: boolean
        /** 是否启用换行符转换 */
        breaks?: boolean
    }>(),
    {
        isStreaming: false,
        isDark: false,
        darkMode: 'auto',
        gfm: true,
        breaks: true
    }
)

/**
 * 动态加载 Markdown 主题样式
 */
const loadTheme = (isDark: boolean): void => {
    const highlightId = 'hljs-theme'
    const markdownId = 'markdown-theme'

    // 高亮样式
    let highlightLink = document.getElementById(highlightId) as HTMLLinkElement | null
    if (!highlightLink) {
        highlightLink = document.createElement('link')
        highlightLink.rel = 'stylesheet'
        highlightLink.id = highlightId
        document.head.appendChild(highlightLink)
    }
    highlightLink.href = isDark ? hljsDark : hljsLight

    // Markdown 样式
    let markdownLink = document.getElementById(markdownId) as HTMLLinkElement | null
    if (!markdownLink) {
        markdownLink = document.createElement('link')
        markdownLink.rel = 'stylesheet'
        markdownLink.id = markdownId
        document.head.appendChild(markdownLink)
    }
    markdownLink.href = isDark ? markdownDark : markdownLight
}

// 监听 isDark 变化，动态切换主题（带淡入淡出动画）
watch(
    () => props.isDark,
    async (val) => {
        if (val === null) return

        isTransitioning.value = true

        // 等待淡出完成 (200ms 与 CSS transition 一致)
        await new Promise((r) => setTimeout(r, 75))

        loadTheme(val)

        // 等待 CSS 应用后淡入
        await new Promise((r) => setTimeout(r, 50))

        isTransitioning.value = false
    },
    { immediate: true }
)

// 配置 marked
marked.use({
    gfm: props.gfm,
    breaks: props.breaks,
    renderer: {
        /**
         * 自定义代码块渲染，使用 highlight.js 高亮
         */
        code({ text, lang }: { text: string; lang?: string }): string {
            const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
            const highlighted = hljs.highlight(text, { language }).value
            // 使用 data-code 属性存储原始代码，供复制按钮使用
            return `<div class="code-block-wrapper">
                <button class="copy-btn" data-code="${encodeURIComponent(text)}" title="复制代码">
                    <svg class="copy-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span class="copy-text">复制</span>
                </button>
                <pre class="hljs"><code class="language-${language}">${highlighted}</code></pre>
            </div>`
        }
    }
})

// 复制按钮点击事件处理（使用事件委托）
const handleCopyClick = async (e: Event): Promise<void> => {
    const btn = (e.target as HTMLElement).closest('.copy-btn') as HTMLButtonElement | null
    if (!btn) return

    const code = decodeURIComponent(btn.dataset.code || '')
    try {
        await navigator.clipboard.writeText(code)
        const textEl = btn.querySelector('.copy-text')
        const iconEl = btn.querySelector('.copy-icon')
        if (textEl) textEl.textContent = '已复制'
        if (iconEl) {
            iconEl.innerHTML = `<polyline points="20 6 9 17 4 12"></polyline>`
        }
        setTimeout(() => {
            if (textEl) textEl.textContent = '复制'
            if (iconEl) {
                iconEl.innerHTML = `<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>`
            }
        }, 2000)
    } catch (err) {
        console.error('复制失败:', err)
    }
}

function findLastTextNode(root: HTMLElement): Text | null {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let lastTextNode: Text | null = null
    let current = walker.nextNode()

    while (current) {
        const textNode = current as Text
        if (textNode.nodeValue && textNode.nodeValue.trim().length > 0) {
            lastTextNode = textNode
        }
        current = walker.nextNode()
    }
    return lastTextNode
}

function updateCursorPosition(): void {
    const container = containerRef.value
    if (!container || !props.isStreaming) {
        isCursorVisible.value = false
        return
    }

    const lastTextNode = findLastTextNode(container)
    if (!lastTextNode) {
        isCursorVisible.value = false
        return
    }

    const range = document.createRange()
    range.setStart(lastTextNode, lastTextNode.length)
    range.setEnd(lastTextNode, lastTextNode.length)

    const rects = range.getClientRects()
    const lastRect = rects.length > 0 ? rects[rects.length - 1] : null
    if (!lastRect) {
        isCursorVisible.value = false
        return
    }

    const containerRect = container.getBoundingClientRect()
    const cursorSize = 9
    cursorStyle.value = {
        left: `${lastRect.right - containerRect.left + container.scrollLeft + 8}px`,
        top: `${lastRect.top - containerRect.top + container.scrollTop + (lastRect.height - cursorSize) / 2}px`
    }
    isCursorVisible.value = true
}

async function syncCursorPosition(): Promise<void> {
    await nextTick()
    updateCursorPosition()
}

onMounted(() => {
    const container = containerRef.value
    if (container) {
        container.addEventListener('click', handleCopyClick)
        container.addEventListener('scroll', updateCursorPosition)
    }
    window.addEventListener('resize', updateCursorPosition)
})

onBeforeUnmount(() => {
    const container = containerRef.value
    if (container) {
        container.removeEventListener('click', handleCopyClick)
        container.removeEventListener('scroll', updateCursorPosition)
    }
    window.removeEventListener('resize', updateCursorPosition)
})

/**
 * 渲染 Markdown 内容
 */
const renderedContent = computed(() => {
    if (!props.content) return ''

    const html = marked.parse(props.content) as string
    return DOMPurify.sanitize(html, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['target', 'rel', 'allow', 'allowfullscreen']
    })
})

watch(() => props.content, syncCursorPosition)
watch(() => props.isStreaming, syncCursorPosition, { immediate: true })
</script>

<style scoped>
.markdown-wrapper {
    position: relative;
}

/* 主题切换过渡动画 - 使用 PrimeVue 标准曲线 cubic-bezier(0.65, 0, 0.35, 1) */
.theme-fade {
    transition: opacity var(--motion-duration-theme) var(--motion-ease-emphasis);
}

.theme-fade.fading {
    opacity: 0;
}

/* 恢复列表默认样式 */
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
    list-style: revert;
    list-style-position: revert;
    list-style-image: revert;
}

.markdown-body :deep(li) {
    list-style: revert;
    list-style-position: revert;
    list-style-image: revert;
}

/* 代码块复制按钮 */
.markdown-body :deep(.code-block-wrapper) {
    position: relative;
}

.markdown-body :deep(.copy-btn) {
    position: absolute;
    top: 8px;
    right: 8px;
    left: auto;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--motion-duration-base) var(--motion-ease-standard);
    z-index: 10;
}

.markdown-body :deep(.code-block-wrapper:hover .copy-btn) {
    opacity: 1;
}

.markdown-body :deep(.copy-btn:hover) {
    background: rgba(0, 0, 0, 0.7);
}

.markdown-body :deep(.light) .copy-btn {
    background: rgba(0, 0, 0, 0.1);
    color: #24292f;
}

.markdown-body :deep(.light) .copy-btn:hover {
    background: rgba(0, 0, 0, 0.2);
}

.markdown-body :deep(.copy-icon) {
    flex-shrink: 0;
}

.stream-cursor {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2b2b2b;
    box-shadow: 0 0 0 1px #6b6b6b;
    opacity: 0;
    pointer-events: none;
    transform-origin: center;
    z-index: 9;
    transition: opacity var(--motion-duration-fast) var(--motion-ease-standard);
}

.stream-cursor.dark {
    background: #f4f4f4;
    box-shadow: 0 0 0 1px #b8b8b8;
}

.stream-cursor.visible {
    opacity: 1;
    animation:
        cursor-blink var(--motion-duration-pulse) steps(1, end) infinite,
        cursor-glow var(--motion-duration-pulse) ease-in-out infinite;
}

@keyframes cursor-blink {
    0%,
    49% {
        opacity: 1;
    }
    50%,
    100% {
        opacity: 0.18;
    }
}

@keyframes cursor-glow {
    0% {
        transform: scale(0.92);
        filter: brightness(0.95);
    }
    50% {
        transform: scale(1.2);
        filter: brightness(1.2);
    }
    100% {
        transform: scale(0.92);
        filter: brightness(0.95);
    }
}
</style>
