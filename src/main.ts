import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { addDummyData, initializeDatabase } from './infrastructure/database/database.init';
import { DataSource } from 'typeorm';

let isSeeded = false;

async function bootstrap() {
  try {
    // 데이터베이스 초기화
    await initializeDatabase();

    // NestJS 앱 시작
    const app = await NestFactory.create(AppModule);

    // 데이터베이스 기본 데이터 생성
    if(!isSeeded){
      const dataSource = app.get(DataSource);
      await addDummyData(dataSource);
      isSeeded = true;
    }
    
    // 3000포트 서버 실행
    await app.listen(3000);
    console.log('Application is running on: http://localhost:3000');
  } catch (error) {
    console.error('Application failed to start:', error);
    process.exit(1);
  }
}
bootstrap();