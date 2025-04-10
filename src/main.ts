import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { registerHelpers } from './utils/hbs-helpers';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  
  // Register Handlebars partials directory
  hbs.registerPartials(join(__dirname, '..', 'views/partials'));
  hbs.registerHelper('layout', 'layouts/main');
  
  // Register Handlebars helpers
  registerHelpers();
  
  // Use cookie parser
  app.use(cookieParser());
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
