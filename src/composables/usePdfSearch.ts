import { useSearchStore } from '@/stores/searchStore';
import { usePdfStore } from '@/stores/pdfStore';
import { usePdfOperations } from '@/composables/usePdfOperations';
import type { SearchResult } from '@/types';

interface UsePdfSearch {
  searchInPDF: (searchTerm: string) => Promise<SearchResult[]>;
  highlightTextOnPage: (searchTerm: string, textLayerDiv: HTMLDivElement) => Promise<void>;
  clearHighlights: (textLayerDiv: HTMLDivElement) => void;
}

export function usePdfSearch(): UsePdfSearch {
  const pdfStore = usePdfStore();
  const searchStore = useSearchStore();
  const { extractAllText } = usePdfOperations();

  const searchInPDF = async (searchTerm: string): Promise<SearchResult[]> => {
    searchStore.clearResults();
    searchStore.setSearchTerm('');

    if (!searchTerm.trim()) {
      return [];
    }

    await extractAllText();

    const results: SearchResult[] = [];
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    for (let pageNumber = 1; pageNumber <= pdfStore.numPages; pageNumber++) {
      const pageText = pdfStore.pdfTextContent[pageNumber] || '';

      if (pageText.length === 0) {
        continue;
      }

      const lowerPageText = pageText.toLowerCase();

      if (lowerPageText.includes(normalizedSearchTerm)) {
        const index = lowerPageText.indexOf(normalizedSearchTerm);
        const start = Math.max(0, index - 50);
        const end = Math.min(pageText.length, index + searchTerm.length + 50);
        const context = '...' + pageText.substring(start, end) + '...';

        results.push({
          pageNum: pageNumber,
          context: context,
          text: pageText,
        });
      }
      else {
        const searchNoSpaces = normalizedSearchTerm.replace(/\s+/g, '');
        const pageNoSpaces = lowerPageText.replace(/\s+/g, '');

        if (pageNoSpaces.includes(searchNoSpaces)) {
          const index = pageNoSpaces.indexOf(searchNoSpaces);

          let charCount = 0;
          let originalIndex = 0;
          for (let i = 0; i < pageText.length && charCount < index; i++) {
            if (!/\s/.test(pageText[i])) charCount++;
            originalIndex = i;
          }

          const start = Math.max(0, originalIndex - 50);
          const end = Math.min(pageText.length, originalIndex + searchTerm.length + 50);
          const context = '...' + pageText.substring(start, end) + '...';

          results.push({
            pageNum: pageNumber,
            context: context,
            text: pageText,
          });
        }
      }
    }

    searchStore.setResults(results);
    searchStore.setSearchTerm(searchTerm);
    
    return results;
  };


  const highlightTextOnPage = async (
    searchTerm: string,
    textLayerDiv: HTMLDivElement
  ): Promise<void> => {

    if (!searchTerm || !textLayerDiv) return;

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    const spans = textLayerDiv.querySelectorAll('span[role="presentation"]');

    let highlightCount = 0;
    
    spans.forEach((span) => {
      const textContent = span.textContent?.toLowerCase() || '';
      if (textContent.includes(normalizedSearchTerm)) {
        span.classList.add('highlight');
        highlightCount++;
      }
      // Try without spaces (for Japanese/CJK)
      else {
        const searchNoSpaces = normalizedSearchTerm.replace(/\s+/g, '');
        const textNoSpaces = textContent.replace(/\s+/g, '');
        if (textNoSpaces.includes(searchNoSpaces)) {
          span.classList.add('highlight');
          highlightCount++;
        }
      }
    });


  };

  const clearHighlights = (textLayerDiv: HTMLDivElement): void => {
  
    if (!textLayerDiv) return;
    
    const highlighted = textLayerDiv.querySelectorAll('.highlight');
    highlighted.forEach((el) => el.classList.remove('highlight'));
  };


  return {
    searchInPDF,
    highlightTextOnPage,
    clearHighlights,
  };
}