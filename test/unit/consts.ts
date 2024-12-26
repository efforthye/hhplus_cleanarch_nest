import { Lecturer } from "src/domain/entities/lecturer.entity";
import { SpecialLectureRegist } from "src/domain/entities/special-lecture-regist.entity";
import { SpecialLecture } from "src/domain/entities/special-lecture.entity";
import { User } from "src/domain/entities/user.entity";
import { DataSourceOptions } from "typeorm";

// 테스트 데이터 상수 정의
const TEST_USER = {
  userId: 'efforthye',
  name: '박혜림'
};
const TEST_SPECIAL_LECTURE = {
  id: 1,
  title: '클린 아키텍처 특강'
};
const TEST_REGISTRATION = {
  id: 1,
  user: TEST_USER,
  specialLecture: TEST_SPECIAL_LECTURE,
  userId: TEST_USER.userId,
  specialLectureId: TEST_SPECIAL_LECTURE.id
};

// 테스트용 데이터베이스 상수 정의
const DATABASE_CONFIG: DataSourceOptions = {
  type: 'mysql' as const,
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'lecture',
  synchronize: true,
  entities: [SpecialLecture, SpecialLectureRegist, User, Lecturer],
};

export{
    TEST_USER, TEST_SPECIAL_LECTURE, TEST_REGISTRATION, DATABASE_CONFIG
}