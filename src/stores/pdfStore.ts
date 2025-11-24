import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';

import { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

export const usePdfStore = defineStore('pdf', () => {
  const pdfDocument = shallowRef<PDFDocumentProxy | null>(null);
  const pageNum = ref<number>(1);
  const numPages = ref<number>(0);
  const loading = ref<boolean>(false);
  const loadingMessage = ref<string>('');
  const errorMessage = ref<string>('');
  const pdfTextContent = ref<Record<number, string>>({});
  const renderTask = ref<RenderTask | null>(null);

  const hasDocument = computed<boolean>(() => !!pdfDocument.value);
  
  const currentPageText = computed<string>(() => 
    pdfTextContent.value[pageNum.value] || ''
  );
  
  const allText = computed<string>(() => 
    Object.values(pdfTextContent.value).join('\n\n')
  );
  
  const totalCharacters = computed<number>(() =>
    Object.values(pdfTextContent.value).reduce(
      (sum, text) => sum + text.length,
      0
    )
  );

  const setDocument = (doc: PDFDocumentProxy | null): void => {
    pdfDocument.value = doc;
  };

  const setNumPages = (num: number): void => {
    numPages.value = num;
  };

  const setPageNum = (num: number): void => {
    if (num >= 1 && num <= numPages.value) {
      pageNum.value = num;
    }
  };

  const nextPage = (): void => {
    if (pageNum.value < numPages.value) {
      pageNum.value++;
    }
  };

  const previousPage = (): void => {
    if (pageNum.value > 1) {
      pageNum.value--;
    }
  };

  const setLoading = (isLoading: boolean, message: string = ''): void => {
    loading.value = isLoading;
    loadingMessage.value = message;
  };

  const setError = (message: string): void => {
    errorMessage.value = message;
  };

  const clearError = (): void => {
    errorMessage.value = '';
  };

  const setPageText = (pageNumber: number, text: string): void => {
    pdfTextContent.value[pageNumber] = text;
  };

  const setRenderTask = (task: RenderTask | null): void => {
    renderTask.value = task;
  };

  const cancelRenderTask = (): void => {
    if (renderTask.value) {
      try {
        renderTask.value.cancel();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown render task cancel error');
        console.error('Render task cancel error:', e);
      }
      renderTask.value = null;
    }
  };

  const reset = (): void => {
    if (pdfDocument.value) {
      try {
        pdfDocument.value.destroy();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown render task cancel error');
        console.error('Error destroying document:', e);
      }
    }

    pdfDocument.value = null;
    pageNum.value = 1;
    numPages.value = 0;
    loading.value = false;
    loadingMessage.value = '';
    errorMessage.value = '';
    pdfTextContent.value = {};
    renderTask.value = null;
  };

  return {
    pdfDocument,
    pageNum,
    numPages,
    loading,
    loadingMessage,
    errorMessage,
    pdfTextContent,
    renderTask,

    hasDocument,
    currentPageText,
    allText,
    totalCharacters,

    setDocument,
    setNumPages,
    setPageNum,
    nextPage,
    previousPage,
    setLoading,
    setError,
    clearError,
    setPageText,
    setRenderTask,
    cancelRenderTask,
    reset,
  };
});

export type PdfStore = ReturnType<typeof usePdfStore>;