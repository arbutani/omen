"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessageService = void 0;
const common_1 = require("@nestjs/common");
const dotenv = __importStar(require("dotenv"));
const successResponse_dto_1 = require("../dto/successResponse.dto");
dotenv.config({ path: '.env' });
let ErrorMessageService = class ErrorMessageService {
    constructor() { }
    isLogged = () => {
        return process.env.LOG_QUERY?.toString()?.toLowerCase() == 'yes'
            ? console.log
            : false;
    };
    success = (data, status = false, msg, options = {}) => {
        const getMessage = msg;
        return new successResponse_dto_1.SuccessResponseDto(status, getMessage.toString(), data);
    };
    successWithErrorMessage = (data, status = false, msg, options = {}, errorMessage = '') => {
        const getMessage = msg;
        return new successResponse_dto_1.SuccessResponseDto(status, getMessage.toString(), data, errorMessage);
    };
    successCore = (data, status = false, msg) => {
        return new successResponse_dto_1.SuccessResponseDto(status, msg, data);
    };
    error = (err) => {
        return new common_1.HttpException({
            status: false,
            message: err.message ? err.message : err.response ? err.response : err,
        }, err.status ? err.status : common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    };
    errorWithStatus = (message, status) => {
        return new common_1.HttpException({
            status: false,
            message: message,
        }, status);
    };
    getMessage = (err, options = {}) => {
        return err.message
            ? err.message
            : err.response
                ? err.response
                : err.toString();
    };
    CatchHandler = (err, options = {}, fromCameCron = false) => {
        if (fromCameCron == true) {
            return new common_1.HttpException({
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Internal Server Error.',
                message: err.message
                    ? err.message
                    : err.response
                        ? err.response
                        : err,
            }, err.status ? err.status : common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        else {
            return new common_1.HttpException({
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: "Internal Server Error.",
                message: err.message
                    ? err.message
                    : err.response
                        ? err.response
                        : err,
            }, err.status ? err.status : common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };
    GeneralError = (message, code, options = {}) => {
        return new common_1.HttpException(message, code);
    };
    GeneralErrorCore = (message, code) => {
        return new common_1.HttpException(message, code);
    };
};
exports.ErrorMessageService = ErrorMessageService;
exports.ErrorMessageService = ErrorMessageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ErrorMessageService);
//# sourceMappingURL=errormessage.service.js.map