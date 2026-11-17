export interface ModelOption {
  id: string;
  name: string;
  shortName: string;
  sizeLabel: string;
  approxSizeMB: number;
  description: string;
  recommendedVRAM: string;
  default?: boolean;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 1B Instruct",
    shortName: "Llama 3.2 (1B)",
    sizeLabel: "~880 MB",
    approxSizeMB: 880,
    description: "Compact & fast. Runs smoothly on most modern integrated and mobile GPUs.",
    recommendedVRAM: "2GB - 4GB VRAM",
    default: true,
  },
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 3B Instruct",
    shortName: "Llama 3.2 (3B)",
    sizeLabel: "~2.2 GB",
    approxSizeMB: 2200,
    description: "Higher reasoning and writing fidelity. Recommended for dedicated GPUs.",
    recommendedVRAM: "4GB - 6GB+ VRAM",
  },
];

export const DEFAULT_MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

export function getModelById(id: string): ModelOption {
  return AVAILABLE_MODELS.find((m) => m.id === id) || AVAILABLE_MODELS[0];
}
