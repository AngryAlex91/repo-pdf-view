import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useOllamaStore = defineStore('ollama', () => {
  const connected = ref<boolean>(false);
  const currentModel = ref<string>('llama3.2');
  const baseUrl = ref<string>('http://localhost:11434');

  const apiUrl = computed<string>(() => `${baseUrl.value}/api`);
  const isReady = computed<boolean>(() => connected.value);

  const setConnected = (status: boolean): void => {
    connected.value = status;
  };

  const setModel = (model: string): void => {
    currentModel.value = model;
  };

  const setBaseUrl = (url: string): void => {
    baseUrl.value = url;
  };

  return {
    connected,
    currentModel,
    baseUrl,

    apiUrl,
    isReady,

    setConnected,
    setModel,
    setBaseUrl,
  };
});

export type OllamaStore = ReturnType<typeof useOllamaStore>;