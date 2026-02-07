"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGE_CONSTRAINTS = exports.MessageErrorCode = exports.WebSocketEvent = exports.MessageStatus = exports.MessageType = void 0;
exports.MessageType = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    AUDIO: 'AUDIO',
    FILE: 'FILE',
    LOCATION: 'LOCATION',
    GIG_OFFER: 'GIG_OFFER',
    GIG_MILESTONE: 'GIG_MILESTONE',
};
exports.MessageStatus = {
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    READ: 'READ',
};
var WebSocketEvent;
(function (WebSocketEvent) {
    WebSocketEvent["CONNECT"] = "connect";
    WebSocketEvent["DISCONNECT"] = "disconnect";
    WebSocketEvent["MESSAGE_SEND"] = "message:send";
    WebSocketEvent["MESSAGE_RECEIVE"] = "message:receive";
    WebSocketEvent["MESSAGE_DELIVERED"] = "message:delivered";
    WebSocketEvent["MESSAGE_READ"] = "message:read";
    WebSocketEvent["MESSAGE_BULK_READ"] = "message:bulk_read";
    WebSocketEvent["TYPING_START"] = "typing:start";
    WebSocketEvent["TYPING_STOP"] = "typing:stop";
    WebSocketEvent["TYPING_INDICATOR"] = "typing:indicator";
    WebSocketEvent["CONVERSATION_CREATED"] = "conversation:created";
    WebSocketEvent["CONVERSATION_UPDATED"] = "conversation:updated";
    WebSocketEvent["MESSAGE_SEARCH"] = "message:search";
    WebSocketEvent["ERROR"] = "error";
})(WebSocketEvent || (exports.WebSocketEvent = WebSocketEvent = {}));
var MessageErrorCode;
(function (MessageErrorCode) {
    MessageErrorCode["INVALID_RECIPIENT"] = "INVALID_RECIPIENT";
    MessageErrorCode["CONVERSATION_NOT_FOUND"] = "CONVERSATION_NOT_FOUND";
    MessageErrorCode["MESSAGE_NOT_FOUND"] = "MESSAGE_NOT_FOUND";
    MessageErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    MessageErrorCode["BLOCKED_USER"] = "BLOCKED_USER";
    MessageErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    MessageErrorCode["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    MessageErrorCode["INVALID_FILE_TYPE"] = "INVALID_FILE_TYPE";
    MessageErrorCode["UPLOAD_FAILED"] = "UPLOAD_FAILED";
    MessageErrorCode["WEBSOCKET_ERROR"] = "WEBSOCKET_ERROR";
})(MessageErrorCode || (exports.MessageErrorCode = MessageErrorCode = {}));
exports.MESSAGE_CONSTRAINTS = {
    MAX_TEXT_LENGTH: 5000,
    MAX_FILE_SIZE: 50 * 1024 * 1024,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/webm'],
    ALLOWED_FILE_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    MAX_MESSAGES_PER_MINUTE: 60,
    TYPING_INDICATOR_TIMEOUT: 3004,
    MESSAGE_DELIVERY_TIMEOUT: 30040,
};
//# sourceMappingURL=messaging.types.js.map