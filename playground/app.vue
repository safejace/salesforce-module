<script setup lang="ts">
const { $salesforce } = useNuxtApp()
const token = await $salesforce.fetchRefreshToken()
$salesforce.setToken(token)
const accounts = await useFetchAccounts()
</script>

<template>
  <div>
    {{ $salesforce }}
    <pre>
      {{ accounts }}
    </pre>
  </div>
</template>
