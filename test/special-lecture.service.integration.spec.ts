import { DataSource, In, LessThan, LessThanOrEqual, Not } from 'typeorm';
import { SpecialLectureService } from '../src/domain/special-lecture/services/special-lecture.service';
import { DATABASE_CONFIG, TEST_SPECIAL_LECTURES, TEST_REGISTRATIONS, TEST_USER } from './consts';
import { SpecialLectureStatus } from 'src/domain/entities/enums';
import { User } from 'src/domain/entities/user.entity';
import { SpecialLecture } from 'src/domain/entities/special-lecture.entity';
import { SpecialLectureRegist } from 'src/domain/entities/special-lecture-regist.entity';

describe('특강 신청 서비스 테스트', () => {
  // 특강 서비스 정의
  let service: SpecialLectureService;
  let mockUserRepository: any;
  let mockLectureRepository: any;
  let mockRegistrationRepository: any;
  let mockDataSource: any;

  // Mock Repository 생성을 도와주는 함수 정의
  const createMockUserRepository = (user = TEST_USER) => ({
    findOne: jest.fn().mockResolvedValue(user)
  });
  const createMockLectureRepository = (specialLectures = TEST_SPECIAL_LECTURES) => ({
    find: jest.fn().mockResolvedValue(specialLectures), // find 메서드 추가
    findOne: jest.fn().mockResolvedValue(specialLectures?.[0] || null) // 첫 번째 특강 객체 반환, null 처리 추가
  });
  const createMockRegistrationRepository = (registrations = TEST_REGISTRATIONS) => ({
    findOne: jest.fn().mockResolvedValue(registrations[0]), // 첫 번째 등록 객체 반환
    find: jest.fn().mockResolvedValue(registrations),
    create: jest.fn().mockReturnValue(registrations[0]),
    save: jest.fn().mockResolvedValue(registrations[0])
  });

  // 각 테스트 실행 전에 서비스 인스턴스를 새로 생성
  beforeEach(() => {
    const mockUserRepository = createMockUserRepository();
    const mockLectureRepository = createMockLectureRepository();
    const mockRegistrationRepository = createMockRegistrationRepository();

    service = new SpecialLectureService(
      mockUserRepository as any,
      mockLectureRepository as any,
      mockRegistrationRepository as any,
      mockDataSource as any,
    );
  });


  it('동시 요청에서 30명까지 성공하고 이후 요청이 실패하는지 확인', async () => {
    // Arrange
    const totalRequests = 40; // 총 요청 수
    const specialLectureId = 1;
    let currentParticipants = 0; // 초기 참가자 수
  
    // 100명의 사용자 데이터를 생성
    const mockUsers = Array.from({ length: 100 }, (_, i) => ({
      userId: `efforthye${i + 1}`,
      name: `박혜림${i + 1}`,
    }));
  
    // Mock User Repository 초기화
    mockUserRepository = {
      findOne: jest.fn(({ where: { userId } }) =>
        mockUsers.find((user) => user.userId === userId) || null,
      ),
    };
  
    // Mock Lecture Repository 초기화
    mockLectureRepository = {
      findOne: jest.fn().mockImplementation(() => ({
        id: specialLectureId,
        currentParticipants,
        maxParticipants: 30,
        status: SpecialLectureStatus.OPEN,
        date: new Date(Date.now() + 100000), // 미래 날짜
      })),
      save: jest.fn().mockImplementation((lecture) => {
        if (currentParticipants >= 30) {
          throw new Error('The lecture is fully booked.');
        }
        currentParticipants++;
        return {
          ...lecture,
          currentParticipants,
        };
      }),
    };
  
    // Mock Registration Repository 초기화
    mockRegistrationRepository = {
      create: jest.fn((registration) => registration),
      save: jest.fn().mockImplementation((registration) => {
        if (currentParticipants > 30) {
          throw new Error('The lecture is fully booked.');
        }
        return registration;
      }),
    };
  
    // Mock DataSource 초기화
    const mockDataSource = {
      transaction: jest.fn(async (callback) => {
        const manager = {
          getRepository: (entity) => {
            if (entity === User) return mockUserRepository;
            if (entity === SpecialLecture) return mockLectureRepository;
            if (entity === SpecialLectureRegist) return mockRegistrationRepository;
            return null;
          },
        };
        return callback(manager);
      }),
    };
    
  
    // Service 재정의
    service = new SpecialLectureService(
      mockUserRepository as any,
      mockLectureRepository as any,
      mockRegistrationRepository as any,
      mockDataSource as any,
    );
  
    const results: Array<Promise<any>> = [];
  
    // Act
    for (let i = 0; i < totalRequests; i++) {
      const user = mockUsers[i];
      results.push(
        service.registerForSpecialLecture(user.userId, specialLectureId).catch((error) => error.message),
      );
    }
  
    const resolvedResults = await Promise.all(results);
  
    // Assert
    const successCount = resolvedResults.filter((result) => typeof result !== 'string').length;
    const failCount = resolvedResults.filter((result) => result === 'The lecture is fully booked.').length;
  
    expect(successCount).toBe(30); // 30명 성공
    expect(failCount).toBe(10); // 10명 실패
    expect(mockLectureRepository.save).toHaveBeenCalledTimes(40); // 총 요청 수만큼 호출
    expect(mockRegistrationRepository.save).toHaveBeenCalledTimes(30); // 등록이 30번 저장됨
  });


  it('동일한 유저가 같은 특강에 5번 신청시 1번 성공, 4번 실패하는지 확인', async () => {
    // Arrange
    const specialLectureId = 1;
    const userId = 'efforthye23';
    let currentParticipants = 0;
  
    // Mock User Repository 초기화
    mockUserRepository = {
      findOne: jest.fn(({ where: { userId: id } }) => (id === userId ? { userId } : null)),
    };
  
    // Mock Lecture Repository 초기화
    mockLectureRepository = {
      findOne: jest.fn().mockImplementation(() => ({
        id: specialLectureId,
        currentParticipants,
        maxParticipants: 30,
        status: SpecialLectureStatus.OPEN,
        date: new Date(Date.now() + 100000), // 미래 날짜
      })),
      save: jest.fn().mockImplementation((lecture) => {
        if (currentParticipants >= 30) {
          throw new Error('The lecture is fully booked.');
        }
        currentParticipants++;
        return {
          ...lecture,
          currentParticipants,
        };
      }),
    };
  
    // Mock Registration Repository 초기화
    const registrations = new Set();
    mockRegistrationRepository = {
      create: jest.fn((registration) => registration),
      save: jest.fn().mockImplementation((registration) => {
        const registrationKey = `${registration.userId}_${registration.specialLectureId}`;
        if (registrations.has(registrationKey)) {
          throw new Error('Duplicate registration.');
        }
        registrations.add(registrationKey);
        return registration;
      }),
    };
  
    // Mock DataSource 초기화
    mockDataSource = {
      transaction: jest.fn(async (callback) => {
        const manager = {
          getRepository: (entity) => {
            if (entity === User) return mockUserRepository;
            if (entity === SpecialLecture) return mockLectureRepository;
            if (entity === SpecialLectureRegist) return mockRegistrationRepository;
            return null;
          },
        };
        return callback(manager);
      }),
    };
  
    // Service 재정의
    service = new SpecialLectureService(
      mockUserRepository as any,
      mockLectureRepository as any,
      mockRegistrationRepository as any,
      mockDataSource as any,
    );
  
    const results: Array<Promise<any>> = [];
  
    // Act
    for (let i = 0; i < 5; i++) {
      results.push(
        service.registerForSpecialLecture(userId, specialLectureId).catch((error) => error.message),
      );
    }
  
    const resolvedResults = await Promise.all(results);
  
    // Assert
    const successCount = resolvedResults.filter((result) => typeof result !== 'string').length;
    const failCount = resolvedResults.filter((result) => result === 'Duplicate registration.').length;
  
    expect(successCount).toBe(1); // 1번 성공
    expect(failCount).toBe(4); // 4번 실패
    expect(mockRegistrationRepository.save).toHaveBeenCalledTimes(5); // 총 5번 save 호출
  });
  
});