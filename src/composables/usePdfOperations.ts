import { usePdfStore } from '@/stores/pdfStore';
import * as pdfjsLib from 'pdfjs-dist';
import { TextLayer, PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist';
import { storeToRefs } from 'pinia';
import { TextItem } from 'pdfjs-dist/types/src/display/api';


pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface UsePdfOperations {
  loadPdf: (file: File) => Promise<PDFDocumentProxy>;
  renderPage: (canvas: HTMLCanvasElement, pageNumber: number, scale: number, textLayerDiv?: HTMLDivElement) => Promise<void>;
  renderTextLayer: (
    page: PDFPageProxy,
    viewport: PageViewport,
    container: HTMLDivElement
  ) => Promise<void>;
  extractTextFromPage: (pageNumber: number) => Promise<string>;
  extractAllText: () => Promise<void>;
}

export function usePdfOperations(): UsePdfOperations {
  const pdfStore = usePdfStore();

  const { pdfDocument } = storeToRefs(pdfStore);

  const loadPdf = async (file: File): Promise<PDFDocumentProxy> => {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!file.type.includes('pdf')) {
      pdfStore.setError('Please select a PDF file');
      throw new Error('Invalid file type');
    }

    pdfStore.reset();
    pdfStore.setLoading(true, 'Loading PDF...');
    pdfStore.clearError();

    return new Promise<PDFDocumentProxy>((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          pdfStore.setLoading(true, 'Processing PDF...');

          const loadingTask = pdfjsLib.getDocument({
            data: typedArray,
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
          });

          const doc = await loadingTask.promise;
          pdfStore.setDocument(doc);
          pdfStore.setNumPages(doc.numPages);
          pdfStore.setPageNum(1);
          resolve(doc);
        } catch (error) {
          console.error('Error loading PDF:', error);
          pdfStore.setError(`Failed to load PDF: ${(error as Error).message}`);
          pdfStore.setLoading(false);
          reject(error);
        }
      };

      fileReader.onerror = () => {
        console.error('Error reading file');
        pdfStore.setError('Failed to read file');
        pdfStore.setLoading(false);
        reject(new Error('Failed to read file'));
      };

      fileReader.readAsArrayBuffer(file);
    });
  };


  const renderPage = async (
    canvas: HTMLCanvasElement,
    pageNumber: number,
    scale: number = 1,
    textLayerDiv?: HTMLDivElement
  ): Promise<void> => {
    if (!pdfDocument.value) {
      throw new Error('No PDF document loaded');
    }

    if (pageNumber < 1 || pageNumber > pdfDocument.value.numPages) {
      throw new Error('Invalid page number');
    }

    pdfStore.cancelRenderTask();
    pdfStore.setLoading(true, `Rendering page ${pageNumber}...`);
    pdfStore.clearError();

    try {
      if (!pdfDocument.value) {
        throw new Error('PDF document was destroyed');
      }
      const page = await pdfDocument.value.getPage(pageNumber);

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not get canvas context');
      }

      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const task = page.render(renderContext);
      console.log(task)
      pdfStore.setRenderTask(task);

      await task.promise;

      if (textLayerDiv) {
        await renderTextLayer(page, viewport, textLayerDiv);
      }

      pdfStore.setRenderTask(null);
      pdfStore.setLoading(false);

      return;
    } catch (error) {
      pdfStore.setRenderTask(null);

      if ((error as Error).name === 'RenderingCancelledException') {
        console.error('Rendering was cancelled');
      } else {
        console.error('Error rendering page:', error);
        pdfStore.setError(`Failed to render page ${pageNumber}`);
      }
      pdfStore.setLoading(false);
      throw error;
    }
  };


  const renderTextLayer = async (
    page: PDFPageProxy,
    viewport: PageViewport,
    container: HTMLDivElement
  ): Promise<void> => {
 
    try {
      container.innerHTML = '';
      const textContent = await page.getTextContent();
      
      container.style.setProperty('--scale-factor', viewport.scale.toString());
      
      const textLayer = new TextLayer({
        textContentSource: textContent,
        container: container,
        viewport: viewport,
      });
      
      await textLayer.render();
    } catch (error) {
      console.error('Error rendering text layer:', error);
      throw error;
    }
  };


  const extractTextFromPage = async (pageNumber: number): Promise<string> => {
    if (!pdfDocument.value) return '';

    try {
      const page = await pdfDocument.value.getPage(pageNumber);
      const textContent = await page.getTextContent();


      // Better text joining for Japanese/CJK characters
      let text = '';
      textContent.items.forEach((item: TextItem, index: number) => {
        const str = item.str || '';

        // Check if current or next item contains CJK characters
        const hasCJK = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/.test(str);
        const nextItem = textContent.items[index + 1] as TextItem;
        const nextHasCJK = nextItem && /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/.test(nextItem.str || '');

        text += str;

        // Add space only between non-CJK text or if there's a line break
        if (nextItem && !hasCJK && !nextHasCJK && item.hasEOL !== true) {
          text += ' ';
        }
      });

      pdfStore.setPageText(pageNumber, text);

      return text;
    } catch (error) {
      console.error('Error extracting text:', error);
      return '';
    }
  };

  const extractAllText = async (): Promise<void> => {
    if (!pdfDocument.value) return;

    pdfStore.setLoading(true, 'Extracting text from PDF...');

    try {
      for (let i = 1; i <= pdfStore.numPages; i++) {
        if (!pdfStore.pdfTextContent[i]) {
          await extractTextFromPage(i);
        }
      }
    } catch (error) {
      console.error('Error extracting all text:', error);
    } finally {
      pdfStore.setLoading(false);
    }
  };

  return {
    loadPdf,
    renderPage,
    extractTextFromPage,
    extractAllText,
    renderTextLayer
  };
}