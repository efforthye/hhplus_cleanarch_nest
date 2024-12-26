import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './infrastructure/database/database.config';
import { SpecialLecture } from './domain/entities/special-lecture.entity';
import { SpecialLectureRegist } from './domain/entities/special-lecture-regist.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([SpecialLecture, SpecialLectureRegist]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}