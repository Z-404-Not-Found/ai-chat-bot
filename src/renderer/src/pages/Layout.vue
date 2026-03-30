<template>
    <div class="layout">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>AI Chat</h2>
            </div>
            <nav class="sidebar-nav">
                <RouterLink to="/chat" class="nav-item">
                    <span class="nav-icon">💬</span>
                    <span class="nav-text">Chat</span>
                </RouterLink>
                <RouterLink to="/markdown" class="nav-item">
                    <span class="nav-icon">📝</span>
                    <span class="nav-text">Markdown</span>
                </RouterLink>
            </nav>
        </aside>
        <main class="main-content">
            <RouterView />
        </main>
    </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.layout {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}

.sidebar {
    width: 200px;
    background: #1a1a1a;
    color: #e0e0e0;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
}

.sidebar-header {
    padding: 20px 16px;
    border-bottom: 1px solid #333;
}

.sidebar-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.sidebar-nav {
    flex: 1;
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    color: #a0a0a0;
    text-decoration: none;
    transition: all 0.2s;
}

.nav-item:hover {
    background: #2a2a2a;
    color: #e0e0e0;
}

.nav-item.router-link-active {
    background: #3b82f6;
    color: white;
}

.nav-icon {
    font-size: 18px;
}

.nav-text {
    font-size: 14px;
    font-weight: 500;
}

.main-content {
    flex: 1;
    overflow: hidden;
    background: #fafafa;
}
</style>
