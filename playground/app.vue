<script setup lang="ts">
const salesforce = useSalesforce()
const token = await salesforce.fetchRefreshToken()
salesforce.setToken(token)
</script>

<template>
  <div>
    {{ salesforce }}
  </div>
</template>
