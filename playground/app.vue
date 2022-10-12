<script setup lang="ts">
const { $salesforce } = useNuxtApp()
const token = await $salesforce.fetchRefreshToken()
$salesforce.setToken(token)
const records = await useWebinars()
</script>

<template>
  <div>
    {{ $salesforce }}

    <pre>
      {{ records }}
    </pre>
  </div>
</template>
