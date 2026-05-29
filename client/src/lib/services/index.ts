// Export services for easy importing
export * from "./websocket-service";
export * from "./document-websocket-service";
export * from "./document-service";

// `DocumentUpdateMessage` is exported by both ./document-service and
// ./document-websocket-service. The WebSocket service is the canonical source
// for WebSocket message types, so re-export it explicitly to disambiguate.
export type { DocumentUpdateMessage } from "./document-websocket-service";
