/* eslint-disable prettier/prettier */

export class SuccessResponseDto {

    readonly status: boolean;


    readonly message: string;

  
    readonly error: string;


    readonly data: any;

    constructor(
        status: boolean,
        message: string,
        data: any,
        error_message: string = ""
    ) {
        this.status = status;
        this.message = message;
        if (error_message != "") this.error = error_message;

        this.data = data;
    }
}
