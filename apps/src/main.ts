import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean),
    credentials: true,
  });
  const port = process.env.PORT ? Number(process.env.PORT) : 3003;
  await app.listen(port);
}

bootstrap();
