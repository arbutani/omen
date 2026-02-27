
    GeneralErrorCore = (message: any, code: HttpStatus) => {
        return new HttpException(message, code);
    };
}
