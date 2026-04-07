import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: () => import('@renderer/pages/Layout.vue'),
            children: [
                {
                    path: '',
                    redirect: '/chat'
                },
                {
                    path: 'chat',
                    component: () => import('@renderer/pages/ChatPage.vue')
                },
                {
                    path: 'role',
                    component: () => import('@renderer/pages/RolePage.vue')
                },
                {
                    path: 'setting',
                    component: () => import('@renderer/pages/SettingPage.vue')
                }
            ]
        }
    ]
})

export default router
