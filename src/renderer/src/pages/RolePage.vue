<template>
    <div class="h-full w-full flex p-panel">
        <div class="w-full h-full">
            <div class="w-full h-full flex flex-col py-1 px-2">
                <div class="mb-4 px-2 lg:px-24 xl:px-48 flex gap-2">
                    <InputGroup>
                        <InputText
                            v-model="searchRoleName"
                            placeholder="搜索角色名"
                            @update:model-value="getRoleByName"
                        />
                        <InputGroupAddon>
                            <Button
                                icon="pi pi-search"
                                severity="secondary"
                                @click="getRoleByName"
                            />
                        </InputGroupAddon>
                    </InputGroup>
                    <Button
                        icon="pi pi-plus"
                        class="w-20 shrink-0"
                        severity="contrast"
                        variant="text"
                        aria-label="添加角色"
                        @click="showAddRole"
                    />
                </div>

                <div
                    class="flex-1 overflow-y-auto scroll-transparent flex flex-col gap-2 mx-2 lg:mx-24 xl:mx-48 pr-1"
                >
                    <div
                        v-if="loading"
                        class="w-full rounded-border border border-surface-200 bg-surface-0 p-4 text-sm text-muted-color dark:border-surface-700 dark:bg-surface-900"
                    >
                        正在加载角色...
                    </div>

                    <div
                        v-else-if="filteredRoleList.length === 0"
                        class="w-full rounded-border border border-surface-200 bg-surface-0 p-4 text-sm text-muted-color dark:border-surface-700 dark:bg-surface-900"
                    >
                        {{ searchRoleName ? '未找到匹配角色' : '暂无角色，点击右上角添加' }}
                    </div>

                    <div
                        v-for="item in filteredRoleList"
                        :key="item.id"
                        :class="[
                            'w-full flex flex-col cursor-pointer rounded-border p-3 transition-motion border overflow-hidden',
                            activeRole?.id === item.id
                                ? 'bg-emphasis border-emphasis'
                                : 'border-surface-200 dark:border-surface-700'
                        ]"
                        @click="activeRoleId = item.id"
                    >
                        <div class="flex justify-between gap-3">
                            <div class="flex-1 min-w-0">
                                <div class="text-lg font-semibold truncate">{{ item.name }}</div>
                            </div>
                            <div class="flex items-start shrink-0">
                                <Button
                                    icon="pi pi-user-edit"
                                    severity="contrast"
                                    variant="text"
                                    aria-label="修改角色"
                                    @click.stop="showEditRole(item.id)"
                                />
                                <Button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    variant="text"
                                    aria-label="删除角色"
                                    @click.stop="showDeleteRole(item.id)"
                                />
                            </div>
                        </div>
                        <div class="mt-2 text-sm text-muted-color line-clamp-2 text-wrap-anywhere">
                            描述：{{ item.description || '暂无描述' }}
                        </div>
                        <div class="mt-1 text-sm text-muted-color line-clamp-2 text-wrap-anywhere">
                            定义：{{ item.system_prompt }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="addRoleShow" modal header="添加角色" :style="{ width: '32rem' }">
            <div class="flex flex-col gap-4 mt-1 mb-2">
                <div class="flex items-center gap-4">
                    <label for="add-role-name" class="font-semibold w-14 shrink-0">角色名</label>
                    <InputText
                        id="add-role-name"
                        v-model="addRoleName"
                        class="flex-auto"
                        autocomplete="off"
                        placeholder="角色名，如：全能助手"
                    />
                </div>
                <div class="flex items-start gap-4">
                    <label for="add-role-description" class="font-semibold w-14 shrink-0 mt-2"
                        >描述</label
                    >
                    <Textarea
                        id="add-role-description"
                        v-model="addRoleDescription"
                        class="flex-auto"
                        rows="3"
                        placeholder="描述（给自己看），可选"
                    />
                </div>
                <div class="flex items-start gap-4 mb-2">
                    <label for="add-role-definition" class="font-semibold w-14 shrink-0 mt-2"
                        >定义</label
                    >
                    <Textarea
                        id="add-role-definition"
                        v-model="addRoleDefinition"
                        class="flex-auto"
                        rows="6"
                        placeholder="定义（给 AI 看），如：你是一个全能助手，需要以专业知识帮助用户解决问题"
                    />
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="取消" severity="secondary" @click="hideAddRole" />
                <Button
                    type="button"
                    label="添加"
                    :disabled="!addRoleName.trim() || !addRoleDefinition.trim()"
                    @click="addRole"
                />
            </div>
        </Dialog>

        <Dialog v-model:visible="editRoleShow" modal header="修改角色" :style="{ width: '32rem' }">
            <div class="flex flex-col gap-4 mt-1 mb-2">
                <div class="flex items-center gap-4">
                    <label for="edit-role-name" class="font-semibold w-14 shrink-0">角色名</label>
                    <InputText
                        id="edit-role-name"
                        v-model="editRoleName"
                        class="flex-auto"
                        autocomplete="off"
                    />
                </div>
                <div class="flex items-start gap-4">
                    <label for="edit-role-description" class="font-semibold w-14 shrink-0 mt-2"
                        >描述</label
                    >
                    <Textarea
                        id="edit-role-description"
                        v-model="editRoleDescription"
                        class="flex-auto"
                        rows="3"
                    />
                </div>
                <div class="flex items-start gap-4 mb-2">
                    <label for="edit-role-definition" class="font-semibold w-14 shrink-0 mt-2"
                        >定义</label
                    >
                    <Textarea
                        id="edit-role-definition"
                        v-model="editRoleDefinition"
                        class="flex-auto"
                        rows="6"
                    />
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="取消" severity="secondary" @click="hideEditRole" />
                <Button
                    type="button"
                    label="修改"
                    :disabled="!editRoleName.trim() || !editRoleDefinition.trim()"
                    @click="editRole"
                />
            </div>
        </Dialog>

        <Dialog
            v-model:visible="deleteRoleShow"
            modal
            header="删除角色"
            :style="{ width: '26rem' }"
        >
            <p class="text-sm text-color">
                确认删除角色
                <span class="font-semibold">{{ deleteRoleName || '该角色' }}</span>
                吗？此操作不可撤销。
            </p>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button
                        type="button"
                        label="取消"
                        severity="secondary"
                        @click="deleteRoleShow = false"
                    />
                    <Button type="button" label="删除" severity="danger" @click="deleteRole" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useLayoutToast } from '@renderer/composables/useLayoutToast'
import type { Character, CreateCharacterInput, UpdateCharacterInput } from '@shared/types'

const toast = useLayoutToast()

const loading = ref(false)
const roleList = ref<Character[]>([])
const searchRoleName = ref('')
const activeRoleId = ref<string>('')

const addRoleShow = ref(false)
const editRoleShow = ref(false)
const deleteRoleShow = ref(false)

const addRoleName = ref('')
const addRoleDescription = ref('')
const addRoleDefinition = ref('')

const editRoleId = ref('')
const editRoleName = ref('')
const editRoleDescription = ref('')
const editRoleDefinition = ref('')

const deleteRoleId = ref('')

const activeRole = computed(() => {
    return roleList.value.find((item) => item.id === activeRoleId.value) ?? null
})

const deleteRoleName = computed(() => {
    return roleList.value.find((item) => item.id === deleteRoleId.value)?.name ?? ''
})

const filteredRoleList = computed(() => {
    const keyword = searchRoleName.value.trim().toLowerCase()
    if (!keyword) return roleList.value
    return roleList.value.filter((item) => item.name.toLowerCase().includes(keyword))
})

const refreshRoles = async (): Promise<void> => {
    loading.value = true
    try {
        const list = await window.api.getCharacters()
        roleList.value = list
        if (activeRoleId.value && !list.some((item) => item.id === activeRoleId.value)) {
            activeRoleId.value = list[0]?.id ?? ''
        }
        if (!activeRoleId.value && list.length > 0) {
            activeRoleId.value = list[0].id
        }
    } catch (error) {
        console.error(error)
        toast.error('加载角色失败，请稍后重试')
    } finally {
        loading.value = false
    }
}

const getRoleByName = (): void => {
    // 使用 computed 过滤，无需额外请求
}

const resetAddForm = (): void => {
    addRoleName.value = ''
    addRoleDescription.value = ''
    addRoleDefinition.value = ''
}

const showAddRole = (): void => {
    resetAddForm()
    addRoleShow.value = true
}

const hideAddRole = (): void => {
    addRoleShow.value = false
}

const addRole = async (): Promise<void> => {
    const name = addRoleName.value.trim()
    const description = addRoleDescription.value.trim()
    const definition = addRoleDefinition.value.trim()

    if (!name || !definition) {
        toast.warn('角色名和定义不能为空')
        return
    }

    const input: CreateCharacterInput = {
        name,
        system_prompt: definition
    }
    if (description) {
        input.description = description
    }

    try {
        const created = await window.api.createCharacter(input)
        hideAddRole()
        await refreshRoles()
        activeRoleId.value = created.id
        toast.success('角色添加成功')
    } catch (error) {
        console.error(error)
        toast.error('添加角色失败，请稍后重试')
    }
}

const showEditRole = (id: string): void => {
    const role = roleList.value.find((item) => item.id === id)
    if (!role) {
        toast.warn('未找到角色信息')
        return
    }
    editRoleId.value = role.id
    editRoleName.value = role.name
    editRoleDescription.value = role.description ?? ''
    editRoleDefinition.value = role.system_prompt
    editRoleShow.value = true
}

const hideEditRole = (): void => {
    editRoleShow.value = false
}

const editRole = async (): Promise<void> => {
    const id = editRoleId.value
    if (!id) return

    const name = editRoleName.value.trim()
    const description = editRoleDescription.value.trim()
    const definition = editRoleDefinition.value.trim()

    if (!name || !definition) {
        toast.warn('角色名和定义不能为空')
        return
    }

    const input: UpdateCharacterInput = {
        name,
        system_prompt: definition,
        description
    }

    try {
        const updated = await window.api.updateCharacter(id, input)
        if (!updated) {
            toast.warn('角色不存在或已被删除')
            return
        }
        hideEditRole()
        await refreshRoles()
        activeRoleId.value = updated.id
        toast.success('角色修改成功')
    } catch (error) {
        console.error(error)
        toast.error('修改角色失败，请稍后重试')
    }
}

const showDeleteRole = (id: string): void => {
    if (!id) return
    deleteRoleId.value = id
    deleteRoleShow.value = true
}

const deleteRole = async (): Promise<void> => {
    const id = deleteRoleId.value
    if (!id) return
    try {
        const result = await window.api.deleteCharacter(id)
        if (!result.success) {
            toast.warn('删除失败，角色可能已不存在')
            return
        }
        deleteRoleShow.value = false
        deleteRoleId.value = ''
        if (activeRoleId.value === id) {
            activeRoleId.value = ''
        }
        await refreshRoles()
        toast.success('角色删除成功')
    } catch (error) {
        console.error(error)
        toast.error('删除角色失败，请稍后重试')
    }
}

onMounted(async () => {
    await refreshRoles()
})
</script>

<style scoped>
.scroll-transparent {
    scrollbar-width: thin;
}

.scroll-transparent::-webkit-scrollbar {
    width: 8px;
}

.scroll-transparent::-webkit-scrollbar-thumb {
    border-radius: 9999px;
    background-color: color-mix(in srgb, var(--p-surface-400) 35%, transparent);
}

.line-clamp-2 {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.text-wrap-anywhere {
    overflow-wrap: anywhere;
    word-break: break-word;
}
</style>
