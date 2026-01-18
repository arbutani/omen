/* eslint-disable prettier/prettier */
import { Global, Module } from "@nestjs/common";
import { ErrorMessageService } from "../services/errormessage.service";

@Global()
@Module({
    imports: [],
    controllers: [],
    providers: [ErrorMessageService],
    exports: [ErrorMessageService]
})
export class SharedModule{}