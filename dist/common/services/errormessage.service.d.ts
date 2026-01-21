import { HttpException, HttpStatus } from '@nestjs/common';
export declare class ErrorMessageService {
    constructor();
    isLogged: () => false | {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    success: (data: any, status: boolean | undefined, msg: any, options?: any) => {
        status: boolean;
        message: string;
        data: any;
        error?: string;
    };
    successWithErrorMessage: (data: any, status: boolean | undefined, msg: any, options?: any, errorMessage?: string) => {
        status: boolean;
        message: string;
        data: any;
        error?: string;
    };
    successCore: (data: any, status: boolean | undefined, msg: any) => {
        status: boolean;
        message: string;
        data: any;
        error?: string;
    };
    error: (err: any) => HttpException;
    errorWithStatus: (message: any, status: HttpStatus) => HttpException;
    getMessage: (err: any, options?: any) => any;
    CatchHandler: (err: any, options?: any, fromCameCron?: boolean) => HttpException;
    GeneralError: (message: any, code: HttpStatus, options?: any) => HttpException;
    GeneralErrorCore: (message: any, code: HttpStatus) => HttpException;
}
