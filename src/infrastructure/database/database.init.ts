import { createConnection } from 'mysql2/promise';
import { DataSource } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { SpecialLecture } from '../../domain/entities/special-lecture.entity';
import { Lecturer } from '../../domain/entities/lecturer.entity';
import { SpecialLectureStatus } from 'src/domain/entities/enums';

// lecture 데이터베이스를 생성한다.
export const initializeDatabase = async () => {
  try {
    // 초기 연결 (데이터베이스 지정없이)
    const connection = await createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234'
    });

    // 데이터베이스 생성
    await connection.query('CREATE DATABASE IF NOT EXISTS lecture');
    console.log('Database initialized successfully');

    // 연결 종료
    await connection.end();
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// 회원가입 로직이 없기 때문에 더미 데이터를 미리 밀어 넣는다..
export const addDummyData = async (dataSource: DataSource) => {
  try {
    // 강사 데이터 확인 및 생성
    const lecturerCount = await dataSource.getRepository(Lecturer).count();
    let lecturers;
    
    if (lecturerCount === 0) {
      lecturers = await dataSource.getRepository(Lecturer).save([
        {
          name: '허재',
          description: '100년차 백엔드 개발자입니다.',
          lectures: []
        },
        {
          name: '알렉스',
          description: '101년차 백엔드 개발자입니다.',
          lectures: []
        }
      ]);
      console.log(`Created ${lecturers.length} lecturers`);
    } else {
      console.log('Lecturers already exist. Skipping...');
      lecturers = await dataSource.getRepository(Lecturer).find();
    }
 
    // 특강 데이터 확인 및 생성
    const lectureCount = await dataSource.getRepository(SpecialLecture).count();
    if (lectureCount === 0) {
      const specialLectures = await dataSource.getRepository(SpecialLecture).save([
        {
          title: '실전 물경력 탈출 Nest.js 백엔드 개발',
          lecturer: lecturers[0],
          lecturerId: lecturers[0].id,
          date: new Date('2024-12-27'),
          maxParticipants: 30,
          currentParticipants: 0,
          status: SpecialLectureStatus.OPEN,
          registrations: []
        },
        {
          title: '실전 물경력 탈출 Java 백엔드 개발',
          lecturer: lecturers[1],
          lecturerId: lecturers[1].id,
          date: new Date('2024-01-15'),
          maxParticipants: 25,
          currentParticipants: 0,
          status: SpecialLectureStatus.OPEN,
          registrations: []
        }
      ]);
      console.log(`Created ${specialLectures.length} special lectures`);
    } else {
      console.log('Special lectures already exist. Skipping...');
    }
 
    // 사용자 데이터 확인 및 생성
    const userCount = await dataSource.getRepository(User).count();
    if (userCount === 0) {
      const users = await dataSource.getRepository(User).save([
        {
          userId: 'efforthye',
          name: '박혜림',
          registrations: []
        },
        {
          userId: 'efforthye2',
          name: '박혜림2',
          registrations: []
        },
        {
          userId: 'efforthye3',
          name: '박혜림3',
          registrations: []
        }
      ]);
      console.log(`Created ${users.length} users`);
    } else {
      console.log('Users already exist. Skipping...');
    }
 
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};