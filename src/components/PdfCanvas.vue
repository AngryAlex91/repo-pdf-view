<template>

    <div class="canvas-container" v-if="connected">
        <div class="pdf-viewer-wrapper" ref="wrapperRef">
            <canvas v-if="pdfDocument" ref="canvasRef"></canvas>
            <div ref="textLayerRef" class="textLayer"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useOllamaStore } from '@/stores/ollamaStore';
import { useSearchStore } from '@/stores/searchStore';
import { usePdfStore } from '@/stores/pdfStore';
import { usePdfSearch } from '@/composables/usePdfSearch';
import { storeToRefs } from 'pinia';



const ollamaStore = useOllamaStore();
const searchStore = useSearchStore();
const pdfStore = usePdfStore();

const { connected } = storeToRefs(ollamaStore);
const { currentSearchTerm } = storeToRefs(searchStore);
const { pageNum, pdfDocument } = storeToRefs(pdfStore);

const { highlightTextOnPage } = usePdfSearch();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const textLayerRef = ref<HTMLDivElement | null>(null);
const wrapperRef = ref<HTMLDivElement | null>(null);


watch(() => currentSearchTerm.value, async (newTerm) => {
    if (textLayerRef.value) {
        if (newTerm) {
            await highlightTextOnPage(newTerm, textLayerRef.value);
        }
    }
});

watch(() => pageNum.value, async () => {
    if (currentSearchTerm.value && textLayerRef.value) {
        await highlightTextOnPage(currentSearchTerm.value, textLayerRef.value);
    }
});


defineExpose({
    canvas: canvasRef,
    textLayer: textLayerRef,

});
</script>

<style scoped>
.canvas-container {
    flex-direction: column;
    position: relative;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: auto;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: start;
    padding: 20px;
    min-height: 400px;

}

.pdf-viewer-wrapper {
    position: relative;
    display: inline-block;
}

canvas {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: white;
    height: auto;
    display: block;
}

.textLayer {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    line-height: 1.0;
    text-size-adjust: none;
    forced-color-adjust: none;
    pointer-events: auto;
    opacity: 0.5;
    width: fit-content;

    &:deep(span) {
        color: transparent;
        position: absolute;
        white-space: pre;
        cursor: text;
        transform-origin: 0% 0%;

        &.highlight {
            background-color: rgba(255, 255, 0, 1) !important;
            color: transparent !important;
            box-shadow: 0 0 10px rgba(255, 255, 0, 0.9);
            border-radius: 2px;
            z-index: 2;
        }
    }
}
</style>