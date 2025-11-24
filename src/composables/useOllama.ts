import { useOllamaStore } from '@/stores/ollamaStore';
import type { OllamaTagsResponse, OllamaGenerateResponse } from '@/types';
import { storeToRefs } from 'pinia';

interface GenerateOptions {
  temperature?: number;
  num_predict?: number;
  top_k?: number;
  top_p?: number;
}

interface UseOllama {
  checkConnection: () => Promise<boolean>;
  generate: (prompt: string, options?: GenerateOptions) => Promise<string>;
}

export function useOllama(): UseOllama {
  const ollamaStore = useOllamaStore();

  const { baseUrl, currentModel } = storeToRefs(ollamaStore);

  const checkConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${baseUrl.value}/api/tags`);
      if (response.ok) {
        const data: OllamaTagsResponse = await response.json();
        ollamaStore.setConnected(true);

        const hasPreferredModel = data.models?.some(m =>
          m.name.includes(currentModel.value )
        );

        if (!hasPreferredModel && data.models?.length > 0) {
          ollamaStore.setModel(data.models[0].name);
        }


        return true;
      } else {
        ollamaStore.setConnected(false);
        return false;
      }
    } catch (error) {
      console.error('Ollama not running:', error);
      ollamaStore.setConnected(false);
      return false;
    }
  };

  const generate = async (
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> => {
    try {
      const response = await fetch(`${baseUrl.value}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: currentModel.value,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.num_predict || 500,
            top_k: options.top_k,
            top_p: options.top_p,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Ollama request failed');
      }

      const data: OllamaGenerateResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama Error:', error);
      throw new Error('Failed to get response from Ollama. Make sure it is running.');
    }
  };

  return {
    checkConnection,
    generate,
  };
}