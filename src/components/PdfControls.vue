<template>
    <div class="pdf-controls" v-if="connected">
        <input type="file" @change="handleFileChange" accept=".pdf" ref="fileInputRef" />

        <div v-if="numPages > 0" class="navigation">
            <button @click="handlePrevious" :disabled="pageNum <= 1 || loading">
                Previous
            </button>

            <span class="page-info">
                Page {{ pageNum }} of {{ numPages }}
            </span>

            <button @click="handleNext" :disabled="pageNum >= numPages || loading">
                Next
            </button>

            <button @click="handleReset" class="reset-btn">
                Reset
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useOllamaStore } from '@/stores/ollamaStore';
import { usePdfStore } from '@/stores/pdfStore';
import { useSearchStore } from '@/stores/searchStore';
import { storeToRefs } from 'pinia';

interface Emits {
    (e: 'file-loaded', file: File): void;
    (e: 'page-changed', pageNum: number): void;
    (e: 'test-highlight'): void;
    (e: 'reset'): void;
}

const emit = defineEmits<Emits>();

const ollamaStore = useOllamaStore();
const pdfStore = usePdfStore();
const searchStore = useSearchStore();

const { connected } = storeToRefs(ollamaStore);
const { pageNum, numPages, loading } = storeToRefs(pdfStore);
const fileInputRef = ref<HTMLInputElement | null>(null);

const handleFileChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        emit('file-loaded', file);
    }
};

const handlePrevious = (): void => {
    pdfStore.previousPage();
    emit('page-changed', pageNum.value);
};

const handleNext = (): void => {
    pdfStore.nextPage();
    emit('page-changed', pageNum.value);
};

const handleReset = (): void => {
    pdfStore.reset();
    searchStore.reset();
    if (fileInputRef.value) {
        fileInputRef.value.value = '';
    }
    emit('reset');
};
</script>

<style scoped>
.pdf-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
}

.navigation {
    display: flex;
    align-items: center;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
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

    &:disabled {
        background-color: #a5d6a7;
        cursor: not-allowed;
    }
}

.reset-btn {
    background-color: #f44336;

    &:hover:not(:disabled) {
        background-color: #da190b;
    }
}


.test-btn {
    background-color: #ff9800;
    font-size: 12px;
    padding: 6px 12px;

    &:hover:not(:disabled) {
        background-color: #f57c00;
    }
}

.page-info {
    font-weight: bold;
    min-width: 120px;
    text-align: center;
    color: #333;
}

input[type="file"] {
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    background: white;
    transition: border-color 0.3s;

    &:hover {
        border-color: #4CAF50;
    }
}
</style>