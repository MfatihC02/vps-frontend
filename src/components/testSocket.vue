<template>
  <div class="p-4">
    <h2>Socket Connection Test</h2>
    <div class="mt-4">
      <p>Connection Status: {{ connectionStatus }}</p>
      <p>Socket ID: {{ socketId }}</p>
      <p>Auth Token Present: {{ !!authStore.token }}</p>
      <p v-if="error" class="text-red-500">Error: {{ error }}</p>

      <div class="mt-4">
        <button
          @click="connect"
          class="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Connect Socket
        </button>
        <button
          @click="disconnect"
          class="ml-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Disconnect Socket
        </button>
      </div>

      <div class="mt-4">
        <h3>Debug Info:</h3>
        <pre>{{ debugInfo }}</pre>
      </div>

      <div class="mt-4">
        <h3>Auth Store State:</h3>
        <pre>{{ authStoreState }}</pre>
      </div>
    </div>
  </div>
</template>
  
  <script>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { socketManager } from "@/plugins/socket";
import { useAuthStore } from "@/stores/authStore";
import { storeToRefs } from "pinia";

export default {
  name: "SocketTest",
  setup() {
    const connectionStatus = ref("DISCONNECTED");
    const socketId = ref(null);
    const error = ref(null);
    const debugInfo = ref({});
    const authStore = useAuthStore();

    const authStoreState = computed(() => ({
      hasToken: !!authStore.token,
      isAuthenticated: authStore.isAuthenticated,
      tokenFirstChars: authStore.token
        ? `${authStore.token.substring(0, 10)}...`
        : "no token",
    }));

    const updateDebugInfo = () => {
      const socket = socketManager.socket;
      if (socket) {
        debugInfo.value = {
          connected: socket.connected,
          disconnected: socket.disconnected,
          auth: socket.auth,
          url: socket.io?.uri,
          transportName: socket.io?.engine?.transport?.name,
          tokenPresent: !!socket.auth?.token,
        };
      }
    };

    const connect = () => {
      error.value = null;
      console.log(
        "Connecting with token:",
        authStore.token ? "Present" : "Missing"
      );
      socketManager.connect(authStore.token);
    };

    const disconnect = () => {
      socketManager.disconnect();
    };

    const setupListeners = () => {
      socketManager.addListener("connect", () => {
        connectionStatus.value = "CONNECTED";
        socketId.value = socketManager.socket.id;
        updateDebugInfo();
      });

      socketManager.addListener("disconnect", () => {
        connectionStatus.value = "DISCONNECTED";
        socketId.value = null;
        updateDebugInfo();
      });

      socketManager.addListener("connect_error", (err) => {
        error.value = err.message;
        connectionStatus.value = "ERROR";
        updateDebugInfo();
      });
    };

    onMounted(() => {
      setupListeners();
      updateDebugInfo();
      if (authStore.token) {
        connect();
      }
    });

    onUnmounted(() => {
      disconnect();
    });

    return {
      connectionStatus,
      socketId,
      error,
      debugInfo,
      authStore,
      authStoreState,
      connect,
      disconnect,
    };
  },
};
</script>
  