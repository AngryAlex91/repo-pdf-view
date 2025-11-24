import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SearchResult } from '@/types';

export const useSearchStore = defineStore('search', () => {
  const userCommand = ref<string>('');
  const aiResponse = ref<string>('');
  const aiProcessing = ref<boolean>(false);
  const searchResults = ref<SearchResult[]>([]);
  const highlights = ref<Highlight[]>([]);
  const currentSearchTerm = ref<string>('');

  const hasResults = computed<boolean>(() => searchResults.value.length > 0);
  const hasHighlights = computed<boolean>(() => highlights.value.length > 0);
  const resultCount = computed<number>(() => searchResults.value.length);

  const setCommand = (command: string): void => {
    userCommand.value = command;
  };

  const setResponse = (response: string): void => {
    aiResponse.value = response;
  };

  const setProcessing = (status: boolean): void => {
    aiProcessing.value = status;
  };

  const setResults = (results: SearchResult[]): void => {
    searchResults.value = results;
  };

  const addResult = (result: SearchResult): void => {
    searchResults.value.push(result);
  };

  const clearResults = (): void => {
    searchResults.value = [];
  };

  const setHighlights = (highlightList: Highlight[]): void => {
    highlights.value = highlightList;
  };

  const addHighlight = (highlight: Highlight): void => {
    highlights.value.push(highlight);
  };

  const clearHighlights = (): void => {
    highlights.value = [];
  };

  const setSearchTerm = (term: string): void => {
    currentSearchTerm.value = term;
  };

  const reset = (): void => {
    userCommand.value = '';
    aiResponse.value = '';
    aiProcessing.value = false;
    searchResults.value = [];
    highlights.value = [];
    currentSearchTerm.value = '';
  };

  return {
    userCommand,
    aiResponse,
    aiProcessing,
    searchResults,
    highlights,
    currentSearchTerm,

    hasResults,
    hasHighlights,
    resultCount,

    setCommand,
    setResponse,
    setProcessing,
    setResults,
    addResult,
    clearResults,
    setHighlights,
    addHighlight,
    clearHighlights,
    setSearchTerm,
    reset,
  };
});

export type SearchStore = ReturnType<typeof useSearchStore>;