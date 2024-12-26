import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './infrastructure/database/database.config';
import { SpecialLecture } from './domain/entities/special-lecture.entity';
import { SpecialLectureRegist } from './domain/entities/special-lecture-regist.entity';
import { SpecialLectureController } from './interfaces/controllers/special-lecture.controller';
import { SpecialLectureService } from './domain/special-lecture/services/special-lecture.service';
import { User } from './domain/entities/user.entity';
import { Lecturer } from './domain/entities/lecturer.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([SpecialLecture, SpecialLectureRegist, User, Lecturer]),
  ],
  controllers: [AppController, SpecialLectureController],
  providers: [AppService, SpecialLectureService],
})
export class AppModule {}