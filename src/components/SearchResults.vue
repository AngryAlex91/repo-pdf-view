<template>
    <div class="search-results">
        <h4>Found {{ resultCount }} results:</h4>
        <div v-for="(result, index) in searchResults" :key="index" class="search-result-item"
            @click="handleClick(result)">
            <strong>Page {{ result.pageNum }}:</strong>
            <span class="result-text">{{ result.context }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSearchStore } from '@/stores/searchStore';
import type { SearchResult } from '@/types';
import { storeToRefs } from 'pinia';

interface Emits {
    (e: 'result-clicked', result: SearchResult): void;
}

const emit = defineEmits<Emits>();

const searchStore = useSearchStore();

const { searchResults, resultCount } = storeToRefs(searchStore);

const handleClick = (result: SearchResult): void => {
    emit('result-clicked', result);
};
</script>

<style scoped>
.search-results {
    background: white;
    border-radius: 8px;
    padding: 16px;
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h4 {
        margin-top: 0;
        margin-bottom: 12px;
        color: #333;
        font-size: 16px;
    }
}

.search-result-item {
    padding: 12px;
    margin-bottom: 8px;
    background: #f8f9fa;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;

    &:hover {
        background: #e3f2fd;
        border-color: #2196F3;
        transform: translateX(4px);
    }
}

.result-text {
    display: block;
    margin-top: 6px;
    color: #666;
    font-size: 13px;
    line-height: 1.5;
}
</style>