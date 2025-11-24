<template>
    <div class="ai-command-section">
        <div class="command-header">
            <h3>🤖 AI Assistant</h3>
            <OllamaStatus />
        </div>
        <div v-if="connected && pdfDocument" class="command-chat-box">
            <div class="command-examples">
                <strong>Try: &nbsp;</strong>
                <button @click="setCommand('find contract')" class="example-btn">
                    Find "contract"
                </button>
                <button @click="setCommand('summarize this page')" class="example-btn">
                    Summarize page
                </button>
                <button @click="setCommand('what is this about')" class="example-btn">
                    What is this about?
                </button>
            </div>

            <div class="command-input-wrapper">
                <textarea v-model="userCommand" placeholder="Examples:
                • find invoice
                • search for total amount  
                • summarize this page
                • what is this document about?" rows="3" @keydown.ctrl.enter="handleSubmit"
                    :disabled="aiProcessing"></textarea>
                <button @click="handleSubmit" :disabled="!userCommand.trim() || aiProcessing" class="ai-button">
                    {{ aiProcessing ? 'Processing...' : 'Ask AI' }}
                </button>
            </div>
        </div>

        <div v-if="aiResponse" class="ai-response">
            <h4>AI Response:</h4>
            <div>{{ aiResponse }}</div>
        </div>

        <SearchResults v-if="hasResults" @result-clicked="handleResultClick" />
    </div>
</template>

<script setup lang="ts">
import { useOllamaStore } from '@/stores/ollamaStore';
import { usePdfStore } from '@/stores/pdfStore';
import { useSearchStore } from '@/stores/searchStore';
import SearchResults from '@/components/SearchResults.vue';
import type { SearchResult } from '@/types';
import OllamaStatus from '@/components/OllamaStatus.vue';
import { storeToRefs } from 'pinia';

interface Emits {
    (e: 'command-submitted', command: string): void;
    (e: 'result-clicked', result: SearchResult): void;
}

const emit = defineEmits<Emits>();

const ollamaStore = useOllamaStore();
const pdfStore = usePdfStore();
const searchStore = useSearchStore();

const { userCommand, aiProcessing, aiResponse, hasResults } = storeToRefs(searchStore);
const { pdfDocument } = storeToRefs(pdfStore);
const { connected } = storeToRefs(ollamaStore);

const setCommand = (cmd: string): void => {
    searchStore.setCommand(cmd);
};

const handleSubmit = (): void => {
    if (!userCommand.value.trim() || aiProcessing.value) return;
    emit('command-submitted', userCommand.value);
};

const handleResultClick = (result: SearchResult): void => {
    emit('result-clicked', result);
};
</script>

<style scoped>
.ai-command-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: white;
        font-size: 20px;
    }
}

.command-examples {
    margin-bottom: 15px;
    color: white;
}

.example-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 6px 12px;
    font-size: 12px;
    margin: 5px 5px 5px 0;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
        background: rgba(255, 255, 255, 0.35);
    }
}

.command-input-wrapper {
    min-height: 15dvh;
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

textarea {
    flex: 1;
    padding: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
    background: white;

    &:focus {
        outline: none;
        border-color: #2196F3;
        box-shadow: 0 0 8px rgba(33, 150, 243, 0.5);
    }

    &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
    }
}

.ai-button {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    white-space: nowrap;
    align-self: flex-start;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        transform: translateY(-2px);
    }

    &:disabled {
        background: #cccccc;
        cursor: not-allowed;
        opacity: 0.6;
    }
}

.ai-response {
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    white-space: pre-wrap;
    max-height: 400px;
    overflow-y: auto;

    h4 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #2196F3;
        font-size: 16px;
    }

}
</style>