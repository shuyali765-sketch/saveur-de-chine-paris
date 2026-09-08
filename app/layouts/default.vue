<template>
    <div class="default-layout min-h-screen flex flex-col overflow-x-hidden bg-background text-foreground">
        <the-navbar />
        <main class="flex-auto">
            <slot />
        </main>
        <the-footer />
    </div>
</template>

<script setup>

</script>

<style lang="postcss" scoped>

</style>
