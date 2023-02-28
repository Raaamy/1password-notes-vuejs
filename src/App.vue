<template>
  <Settings v-if="shouldShowConfig()" />
  <Notes v-else />
</template>

<script>
import Settings from './components/Settings.vue'
import Notes from './components/Notes.vue'

export default {
  name: 'App',
  components: {
    Settings,
    Notes
  },
  data() {
    return {
      mode: 'config', // If mode == config, show config screen. If mode == notes, show notes.
    };
  },
  methods: {
    shouldShowConfig() {
      return (
        this.storageValues.op_connect_server_host === null ||
        this.storageValues.op_api_token === null ||
        this.storageValues.op_vault_uuid === null
      );
    },
  },
  mounted() {
    
  },
  watch: {

  },
  computed: {
    storageValues() {
      return {
        op_connect_server_host: localStorage.getItem('op_connect_server_host') || null,
        op_api_token: localStorage.getItem('op_api_token') || null,
        op_vault_uuid: localStorage.getItem('op_vault_uuid') || null,
      };
    },
  },
}
</script>

<style>
#app {
  
}
</style>
