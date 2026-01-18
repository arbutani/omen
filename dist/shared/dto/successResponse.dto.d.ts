export declare class SuccessResponseDto {
    readonly status: boolean;
    readonly message: string;
    readonly error: string;
    readonly data: any;
    constructor(status: boolean, message: string, data: any, error_message?: string);
}
