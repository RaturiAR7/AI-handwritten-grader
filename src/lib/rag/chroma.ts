import { ChromaClient } from "chromadb";

export const chromaClient = new ChromaClient({
  host: "localhost",
  port: 8000,
});
chromaClient.heartbeat();
