export interface SearchResult {
  pageNum?: number;
  context?: string;
  text?: string;
}
export interface OllamaModel {
  name: string;
  size?: number;
  modified?: string;
}
export interface OllamaTagsResponse {
  models: OllamaModel[];
}
export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
    top_k?: number;
    top_p?: number;
  };
}
export interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
}
