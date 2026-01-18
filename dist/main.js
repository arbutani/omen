"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const file_1 = require("./shared/file/file");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost',
            'http://127.0.0.1:5501',
            'http://localhost:3000',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    (0, file_1.Files)(app);
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory: (errors) => {
            return new common_1.HttpException({
                status: false,
                message: errors.map((error) => ({
                    field: error.property,
                    message: error.constraints
                        ? error.constraints[Object.keys(error.constraints)[0]]
                        : '',
                })),
            }, 422);
        },
    }));
    await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
//# sourceMappingURL=main.js.map