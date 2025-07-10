import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { swaggerConfig, swaggerOptions } from "./config/swagger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CLIENT_URL || "http://localhost:4200",
    credentials: true,
  });

  app.setGlobalPrefix("api");

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup("api", app, document, swaggerOptions);

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

void bootstrap();
