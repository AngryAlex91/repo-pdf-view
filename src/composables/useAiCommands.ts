import { usePdfStore } from '@/stores/pdfStore';
import { useSearchStore } from '@/stores/searchStore';
import { useOllama } from '@/composables/useOllama';
import { usePdfOperations } from '@/composables/usePdfOperations';
import { usePdfSearch } from '@/composables/usePdfSearch';
import type { SearchResult } from '@/types';

interface UseAiCommands {
  handleCommand: (command: string) => Promise<SearchResult | null>;
  handleSearchCommand: (command: string) => Promise<SearchResult | null>;
  handleNavigateCommand: (command: string) => Promise<SearchResult | null>;
  handleSummarizeCommand: (command: string) => Promise<void>;
  handleExtractCommand: (command: string) => Promise<void>;
  handleGeneralCommand: (command: string) => Promise<void>;
  extractSearchTerm: (command: string) => string;
}

export function useAiCommands(): UseAiCommands {
  const pdfStore = usePdfStore();
  const searchStore = useSearchStore();
  const { generate } = useOllama();
  const { extractAllText } = usePdfOperations();
  const { searchInPDF } = usePdfSearch();


  const extractSearchTerm = (command: string): string => {
    let term = command
      .replace(/^(find|search|look for|locate)\s+/gi, '')
      .replace(/^(all occurrences of|occurrences of)\s+/gi, '')
      .replace(/^(text containing|containing)\s+/gi, '')
      .replace(/^(go to page with|navigate to)\s+/gi, '')
      .trim()
      .replace(/^["']|["']$/g, '');

    return term;
  };


  const handleSearchCommand = async (command: string): Promise<SearchResult | null> => {
    const searchTerm = extractSearchTerm(command);


    if (!searchTerm) {
      searchStore.setResponse('Please specify what you want to search for. Example: "find invoice"');
      return null;
    }

    searchStore.setResponse(`Searching for "${searchTerm}"...`);
    const results = await searchInPDF(searchTerm);

    if (results.length > 0) {
      searchStore.setResponse(
        `Found ${results.length} occurrences of "${searchTerm}". Click on a result below to view and highlight it.`
      );
      return results[0]; 
    } else {
      const totalChars = pdfStore.totalCharacters;
      if (totalChars === 0) {
        searchStore.setResponse(
          `⚠️ Could not extract text from PDF. This might be an image-based (scanned) PDF.`
        );
      } else {
        searchStore.setResponse(
          `No results found for "${searchTerm}". Extracted ${totalChars} characters from PDF.`
        );
      }
      return null;
    }
  };


  const handleNavigateCommand = async (
    command: string
  ): Promise<SearchResult | null> => {
    const pageMatch = command.match(/page\s+(\d+)/i);
    if (pageMatch) {

      const targetPage = parseInt(pageMatch[1] as string, 10);
      if (targetPage >= 1 && targetPage <= pdfStore.numPages) {
        pdfStore.setPageNum(targetPage);
        searchStore.setResponse(`Navigated to page ${targetPage}.`);
        return {pageNum:targetPage};
      } else {
        searchStore.setResponse(
          `Page ${targetPage} does not exist. PDF has ${pdfStore.numPages} pages.`
        );
        return null;
      }
    } else {
      const searchTerm = extractSearchTerm(command);
      if (searchTerm) {
        const results = await searchInPDF(searchTerm);
        if (results.length > 0) {
          pdfStore.setPageNum(results[0].pageNum);
          searchStore.setResponse(
            `Navigated to first occurrence of "${searchTerm}" on page ${results[0].pageNum}.`
          );
          return results[0];
        } else {
          searchStore.setResponse(`Could not find "${searchTerm}" in the document.`);
          return null;
        }
      }
      return null;
    }
  };


  const handleSummarizeCommand = async (command: string): Promise<void> => {
    await extractAllText();

    let textToSummarize = '';
    let context = '';

    if (command.includes('current page') || command.includes('this page')) {
      textToSummarize = pdfStore.currentPageText;
      context = `page ${pdfStore.pageNum}`;
    } else if (command.includes('all') || command.includes('entire') || command.includes('whole')) {
      textToSummarize = pdfStore.allText;
      context = 'entire document';
    } else {
      textToSummarize = pdfStore.currentPageText;
      context = `page ${pdfStore.pageNum}`;
    }

    if (!textToSummarize) {
      searchStore.setResponse('No text found to summarize.');
      return;
    }

    const limitedText = textToSummarize.substring(0, 3000);
    const prompt = `Please provide a concise summary (2-3 sentences) of this text:\n\n${limitedText}`;

    try {
      const summary = await generate(prompt);
      searchStore.setResponse(`Summary of ${context}:\n\n${summary}`);
    } catch (error) {
      searchStore.setResponse(`Error: ${(error as Error).message}`);
    }
  };

  const handleExtractCommand = async (command: string): Promise<void> => {
    await extractAllText();

    const currentPageText = pdfStore.currentPageText;

    if (!currentPageText) {
      searchStore.setResponse('No text found on this page.');
      return;
    }

    searchStore.setResponse(`Text from page ${pdfStore.pageNum}:\n\n${currentPageText}`);
  };


  const handleGeneralCommand = async (command: string): Promise<void> => {
    await extractAllText();

    let contextText = '';
    if (Object.keys(pdfStore.pdfTextContent).length > 0) {
      const pagesToUse = [pdfStore.pageNum - 1, pdfStore.pageNum, pdfStore.pageNum + 1].filter(
        (p) => p >= 1 && p <= pdfStore.numPages
      );

      contextText = pagesToUse
        .map((p) => pdfStore.pdfTextContent[p] || '')
        .join('\n\n')
        .substring(0, 3000);
    }

    const prompt = `Based on this document:\n\n${contextText}\n\nUser question: ${command}\n\nPlease provide a helpful answer based on the document content:`;

    try {
      const response = await generate(prompt);
      searchStore.setResponse(response);
    } catch (error) {
      searchStore.setResponse(`Error: ${(error as Error).message}`);
    }
  };


  const handleCommand = async (command: string): Promise<SearchResult | null> => {
    if (!command.trim()) return null;
  
    searchStore.setProcessing(true);
    searchStore.setResponse('');
    pdfStore.clearError();
    searchStore.clearResults();
    searchStore.clearHighlights();

    try {
      const lowerCommand = command.toLowerCase().trim();

      if (lowerCommand.match(/^(find|search|locate|look for)/)) {
        return await handleSearchCommand(lowerCommand);
      } else if (lowerCommand.includes('go to') || lowerCommand.match(/page\s+\d+/)) {
        return await handleNavigateCommand(lowerCommand);
      } else if (lowerCommand.includes('summarize') || lowerCommand.includes('summary')) {
        await handleSummarizeCommand(lowerCommand);
        return null;
      } else if (lowerCommand.includes('extract') || lowerCommand.includes('get text')) {
        await handleExtractCommand(lowerCommand);
        return null;
      } else {
        await handleGeneralCommand(lowerCommand);
        return null;
      }
    } catch (error) {
      console.error('Error processing command:', error);
      pdfStore.setError((error as Error).message);
      return null;
    } finally {
      searchStore.setProcessing(false);
    }
  };

  return {
    handleCommand,
    handleSearchCommand,
    handleNavigateCommand,
    handleSummarizeCommand,
    handleExtractCommand,
    handleGeneralCommand,
    extractSearchTerm,
  };
}