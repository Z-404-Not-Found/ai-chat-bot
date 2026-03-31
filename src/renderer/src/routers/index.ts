import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: () => import('@renderer/pages/Layout.vue'),
            children: [
                // {
                //     path: 'chat',
                //     component: () => import('@renderer/pages/ChatDemo.vue')
                // },
                {
                    path: 'markdown',
                    component: () => import('@renderer/pages/MarkdownDemo.vue')
                }
            ]
        }
    ]
})

export default router
