import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import * as dotenv from 'dotenv';
import { SuccessResponseDto } from '../dto/successResponse.dto';
dotenv.config({ path: '.env' });

@Injectable()
export class ErrorMessageService {
  constructor() {}

  isLogged = () => {
    return process.env.LOG_QUERY?.toString()?.toLowerCase() == 'yes'
      ? console.log
      : false;
  };
  success = (
    data: any,
    status: boolean = false,
    msg: any,
    options: any = {},
  ): SuccessResponseDto => {
    const getMessage = msg;
    return new SuccessResponseDto(status, getMessage.toString(), data);
  };

  successWithErrorMessage = (
    data: any,
    status: boolean = false,
    msg: any,
    options: any = {},
    errorMessage: string = '',
  ): SuccessResponseDto => {
    const getMessage = msg;
    return new SuccessResponseDto(
      status,
      getMessage.toString(),
      data,
      errorMessage,
    );
  };

  successCore = (
    data: any,
    status: boolean = false,
    msg: any,
  ): SuccessResponseDto => {
    return new SuccessResponseDto(status, msg, data);
  };

  error = (err: any) => {
    return new HttpException(
      {
        status: false,
        message: err.message ? err.message : err.response ? err.response : err,
      },
      err.status ? err.status : HttpStatus.INTERNAL_SERVER_ERROR,
    );
  };
  errorWithStatus = (message: any, status: HttpStatus) => {
    return new HttpException(
      {
        status: false,
        message: message,
      },
      status,
    );
  };
  getMessage = (err: any, options: any = {}) => {
    return err.message
      ? err.message
      : err.response
        ? err.response
        : err.toString();
  };
  CatchHandler = (err: any, options: any = {}, fromCameCron = false) => {
    if (fromCameCron == true) {
      return new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error.',
          message: err.message
            ? err.message
            : err.response
              ? err.response
              : err,
        },
        err.status ? err.status : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      return new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: "Internal Server Error.",
          message: err.message
            ? err.message
            : err.response
              ? err.response
              : err,
        },
        err.status ? err.status : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

  GeneralError = (message: any, code: HttpStatus, options: any = {}) => {
    return new HttpException(message, code);
  };

  GeneralErrorCore = (message: any, code: HttpStatus) => {
    return new HttpException(message, code);
  };
}
