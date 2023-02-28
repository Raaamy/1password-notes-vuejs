<template>
  <div class="modal-backdrop fade show" v-if="showCreateNoteModal"></div>
  <!-- Top row with app title -->
  <div class="container-fluid bg-light py-3">
      <div class="row">
          <div class="col-12">
            <div>
              <h5><img src="/img/1password_icon.png" height="24" width="24"> {{title}}</h5>
            </div>
          </div>
      </div>
  </div>
  
  <!-- Settings screen -->
  <div class="container-sm mt-3">
      <div class="row">
          <div class="col-12">
            <form class="form-group">
                <div class="mb-3">
                    <label for="op_api_token" class="form-label">1Password API Token</label>
                    <input type="text" class="form-control" id="op_api_token" name="op_api_token" v-model="config.op_api_token" required >
                </div>
                <div class="mb-3">
                    <label for="op_vault_uuid" class="form-label">1Password Vault UUID</label>
                    <input type="text" class="form-control" id="op_vault_uuid" name="op_vault_uuid" v-model="config.op_vault_uuid" required>
                </div>
                <div class="mb-3">
                    <label for="op_connect_server_host" class="form-label">1Password Connect Server URL</label>
                    <input type="text" class="form-control" id="op_connect_server_host" name="op_connect_server_host" v-model="config.op_connect_server_host" required>
                </div>
                <div class="mb-3">
                    <button type="button" class="btn btn-success" id="btnStoreConfig" name="btnStoreConfig" @click="storeConfig()">Connect to 1Password</button>
                </div>
            </form>
          </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'MySettings',
  data() {
    return {
      title: 'Notes',
      config: {
        op_api_token: null,
        op_vault_uuid: null,
        op_connect_server_host: null
      }
    };
  },
  methods: {
    updateLocalStorage(key, value) {
      localStorage.setItem(key, value);
    },
    storeConfig() {
      this.updateLocalStorage('op_api_token', this.config.op_api_token);
      this.updateLocalStorage('op_vault_uuid', this.config.op_vault_uuid);
      this.updateLocalStorage('op_connect_server_host', this.config.op_connect_server_host);
      window.location.reload();
    },
  },
  mounted() {
    
  },
  watch: {
  },
  computed: {
    storageValues() {
      return {
        op_api_token: localStorage.getItem('op_api_token') || null,
        op_vault_uuid: localStorage.getItem('op_vault_uuid') || null,
        op_connect_server_host: localStorage.getItem('op_connect_server_host') || null,
      };
    },
  },
};
</script>
