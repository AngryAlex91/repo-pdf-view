<template>
  <div class="pdf-ai-viewer">

    <div class="control-container">

      <PdfControls @file-loaded="handleFileLoaded" @page-changed="handlePageChanged" @reset="handleReset" />

      <AiCommandPanel @command-submitted="handleCommand" @result-clicked="handleResultClick" />

    </div>

    <div class="pdf-container">

      <PdfCanvas ref="pdfCanvasRef" />

      <div v-if="loadingMessage" class="loading">
        {{ loadingMessage }}
      </div>

      <div v-if="errorMessage" class="error">
        {{ errorMessage }}
      </div>
    </div>

  </div>

</template>

<script setup>
import { ref } from 'vue';
import { usePdfStore } from '@/stores/pdfStore';
import { useSearchStore } from '@/stores/searchStore';
import { usePdfOperations } from '@/composables/usePdfOperations';
import { usePdfSearch } from '@/composables/usePdfSearch';
import { useAiCommands } from '@/composables/useAiCommands';

import PdfControls from '@/components/PdfControls.vue';
import AiCommandPanel from '@/components/AiCommandPanel.vue';
import PdfCanvas from '@/components/PdfCanvas.vue';
import { storeToRefs } from 'pinia';

const pdfStore = usePdfStore();
const searchStore = useSearchStore();
const pdfCanvasRef = ref(null);

const { loadingMessage, errorMessage } = storeToRefs(pdfStore);
const { currentSearchTerm } = storeToRefs(searchStore);

const { loadPdf, renderPage } = usePdfOperations();
const { highlightTextOnPage, clearHighlights } = usePdfSearch();
const { handleCommand: processCommand } = useAiCommands();

const handleFileLoaded = async (file) => {
  try {
    await loadPdf(file);

    const canvas = pdfCanvasRef.value?.canvas;
    const textLayer = pdfCanvasRef.value?.textLayer;
    if (canvas && textLayer) {
      await renderPage(canvas, 1, 1, textLayer);
    }
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
};

const handlePageChanged = async (pageNumber) => {
  const canvas = pdfCanvasRef.value?.canvas;
  const textLayer = pdfCanvasRef.value?.textLayer;
  if (canvas && textLayer) {
    await renderPage(canvas, pageNumber, 1, textLayer);

    if (currentSearchTerm.value) {
      await highlightTextOnPage(currentSearchTerm.value, textLayer);
    }
  }
};


const handleReset = () => {
  const textLayer = pdfCanvasRef.value?.textLayer;

  if (textLayer) {
    clearHighlights(textLayer);
  }

  const canvas = pdfCanvasRef.value?.canvas;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  if (textLayer) {
    textLayer.removeAttribute('style');
  }
};

const handleCommand = async (command) => {
  const result = await processCommand(command);
  if (result && result.pageNum) {
    await handleResultClick(result);
  }
};

const handleResultClick = async (result) => {

  pdfStore.setPageNum(result.pageNum);

  const canvas = pdfCanvasRef.value?.canvas;
  const textLayer = pdfCanvasRef.value?.textLayer;

  if (canvas && textLayer) {
    await renderPage(canvas, result.pageNum, 1, textLayer);

    if (currentSearchTerm.value) {
      await highlightTextOnPage(currentSearchTerm.value, textLayer);
    }
  }
};
</script>

<style scoped>
.pdf-ai-viewer {
  display: flex;
  flex-direction: row;
  max-height: 100%;
  margin: 0 auto;
  padding: 20px 20px;
  gap: 20px;

  @media screen and (max-width: 1200px) {
    flex-direction: column;
    padding: 10px 10px;
  }

}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 8px;
  margin-top: 10px;
}

.error {
  text-align: center;
  padding: 15px;
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 8px;
  margin-top: 10px;
  border: 1px solid #ef9a9a;
}

.control-container {
  display: flex;
  flex-direction: column;
  width: 60dvh
}

.pdf-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>