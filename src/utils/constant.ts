export enum ROLE_TYPE {
  USER = "user",
  BETA = "beta",
  ASSISTANT = "assistant",
}

interface ModelInfo {
  name: string;
  maxTokens: number;
}

export const OPENAI_MODELS: ModelInfo[] = [
  // GPT-4 Models
  {
    name: "gpt-4-turbo-preview",
    maxTokens: 128000,
  },
  {
    name: "gpt-4",
    maxTokens: 8192,
  },
  {
    name: "gpt-4-32k",
    maxTokens: 32768,
  },
  // GPT-3.5 Models
  {
    name: "gpt-3.5-turbo",
    maxTokens: 4096,
  },
  {
    name: "gpt-3.5-turbo-16k",
    maxTokens: 16384,
  },
  {
    name: "dall-e-3",
    maxTokens: 4096,
  },
];

export const ADMIN_USER_VALUES = {
  AI_PROMPT: "ai_prompt",
  GPT_MODAL: "gpt_modal",
  FREE_REQUEST_PER_DAY: "free_request_per_day",
};
