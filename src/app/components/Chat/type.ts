export interface ChatStreamChunk {
  message: StreamResponse;
}
export interface StreamResponse {
  index: number;
  delta: Delta;
  logprobs: null;
  finish_reason: null;
}

export interface Delta {
  content: string;
}
