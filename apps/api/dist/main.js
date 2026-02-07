"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix("api");
    app.enableCors({
        origin: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean),
        credentials: true,
    });
    const port = process.env.PORT ? Number(process.env.PORT) : 3003;
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map