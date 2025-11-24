<template>
    <div class="ollama-status">
        <div v-if="!connected" class="status-warning">
            <h3>⚠️ Ollama Not Running</h3>
            <button @click="handleCheckConnection">Check Connection</button>
        </div>
        <div v-else class="status-success">
            ✅ Ollama Connected | Model: {{ currentModel }}
            <button @click="handleCheckConnection" class="small-btn">Refresh</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useOllamaStore } from '@/stores/ollamaStore';
import { useOllama } from '@/composables/useOllama';
import { storeToRefs } from 'pinia';

const ollamaStore = useOllamaStore();
const { currentModel, connected } = storeToRefs(ollamaStore);
const { checkConnection } = useOllama();

const handleCheckConnection = async (): Promise<void> => {
    await checkConnection();
};


onMounted(() => {
    checkConnection();
});
</script>

<style scoped>
.ollama-status {
    margin-bottom: 20px;
    border-radius: 8px;
}

.status-warning {
    background: #fff3cd;
    border: 2px solid #ffc107;
    padding: 20px;
    border-radius: 8px;

    h3 {
        margin-bottom: 10px;
        color: #856404;
    }

    p,
    ol {
        color: #856404;
        margin-bottom: 10px;
    }

    code {
        background: #f8f9fa;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
    }

    a {
        color: #004085;
        text-decoration: underline;
    }
}


.status-success {
    background: #d4edda;
    border: 2px solid #28a745;
    padding: 15px;
    border-radius: 8px;
    color: #155724;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.small-btn {
    padding: 4px 12px;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.1);
    color: #155724;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button {
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;

    &:hover:not(:disabled) {
        background-color: #45a049;
    }
}
</style>