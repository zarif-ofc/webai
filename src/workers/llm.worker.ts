import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// Instantiate the WebWorkerMLCEngineHandler to manage WebLLM execution inside this Web Worker
const handler = new WebWorkerMLCEngineHandler();

// Forward all incoming messages to the WebLLM engine handler
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
