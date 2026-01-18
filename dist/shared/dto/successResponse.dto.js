"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessResponseDto = void 0;
class SuccessResponseDto {
    status;
    message;
    error;
    data;
    constructor(status, message, data, error_message = "") {
        this.status = status;
        this.message = message;
        if (error_message != "")
            this.error = error_message;
        this.data = data;
    }
}
exports.SuccessResponseDto = SuccessResponseDto;
//# sourceMappingURL=successResponse.dto.js.map