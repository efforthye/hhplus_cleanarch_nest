import { SpecialLectureStatus } from "src/domain/entities/enums";
import { Lecturer } from "src/domain/entities/lecturer.entity";
import { SpecialLectureRegist } from "src/domain/entities/special-lecture-regist.entity";
import { SpecialLecture } from "src/domain/entities/special-lecture.entity";
import { User } from "src/domain/entities/user.entity";
import { DataSourceOptions } from "typeorm";
import { LessThan, MoreThanOrEqual, Not, In } from "typeorm";
import { SpecialLectureService } from "src/domain/special-lecture/services/special-lecture.service";

// 테스트 데이터 상수 정의
const TEST_USER = {
  userId: 'efforthye',
  name: '박혜림',
};

const TEST_SPECIAL_LECTURES = [
  {
    id: 1,
    title: '실전 물경력 탈출 Nest.js 백엔드 개발',
    status: SpecialLectureStatus.OPEN,
    date: new Date('2024-12-27'),
    currentParticipants: 30,
    lecturer: { name: '허재' },
  },
  {
    id: 2,
    title: '실전 물경력 탈출 Java 백엔드 개발',
    status: SpecialLectureStatus.OPEN,
    date: new Date('2024-12-28'),
    currentParticipants: 0,
    lecturer: { name: '알렉스' },
  },
];

const TEST_REGISTRATIONS = [
  {
    id: 1,
    user: TEST_USER,
    specialLecture: TEST_SPECIAL_LECTURES[0],
    userId: TEST_USER.userId,
    specialLectureId: TEST_SPECIAL_LECTURES[0].id,
  },
];

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

export {
  TEST_USER, TEST_REGISTRATIONS, TEST_SPECIAL_LECTURES, DATABASE_CONFIG
}