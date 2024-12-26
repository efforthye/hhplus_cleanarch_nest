import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeDatabase } from './infrastructure/database/database.init';

async function bootstrap() {
  try {
    // 데이터베이스 초기화
    await initializeDatabase();

    // NestJS 앱 시작
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
    
    console.log('Application is running on: http://localhost:3000');
  } catch (error) {
    console.error('Application failed to start:', error);
    process.exit(1);
  }
}
bootstrap();