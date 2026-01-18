import { HttpException, HttpStatus } from '@nestjs/common';
import { SuccessResponseDto } from '../dto/successResponse.dto';
export declare class ErrorMessageService {
    constructor();
    isLogged: () => false | {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    success: (data: any, status: boolean | undefined, msg: any, options?: any) => SuccessResponseDto;
    successWithErrorMessage: (data: any, status: boolean | undefined, msg: any, options?: any, errorMessage?: string) => SuccessResponseDto;
    successCore: (data: any, status: boolean | undefined, msg: any) => SuccessResponseDto;
    error: (err: any) => HttpException;
    errorWithStatus: (message: any, status: HttpStatus) => HttpException;
    getMessage: (err: any, options?: any) => any;
    CatchHandler: (err: any, options?: any, fromCameCron?: boolean) => HttpException;
    GeneralError: (message: any, code: HttpStatus, options?: any) => HttpException;
    GeneralErrorCore: (message: any, code: HttpStatus) => HttpException;
}
