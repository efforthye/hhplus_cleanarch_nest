import { In, LessThan, Not } from 'typeorm';
import { SpecialLectureService } from '../src/domain/special-lecture/services/special-lecture.service';
import { TEST_SPECIAL_LECTURES, TEST_REGISTRATIONS, TEST_USER } from './consts';
import { SpecialLectureStatus } from 'src/domain/entities/enums';

describe('특강 신청 서비스 테스트', () => {
  // 특강 서비스 정의
  let service: SpecialLectureService;
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


  // 특강 조회 관련 테스트 그룹
  describe('특강 조회 테스트', () => {
    it('신청 가능한 특강 목록을 정상적으로 조회하는지 확인', async () => {
      // Arrange (준비): 특강 조회를 위한 mock repository 설정
      const mockLectureRepository = createMockLectureRepository(TEST_SPECIAL_LECTURES);
      service['lectureRepository'] = mockLectureRepository as any;

      // Act (실행): 신청 가능한 특강 목록 조회 기능 실행
      const result = await service.getAvailableLectures();

      // Assert (검증):
      // 1. 조회된 결과가 예상한 데이터와 일치하는지 확인
      expect(result).toEqual(TEST_SPECIAL_LECTURES);
      // 2. 올바른 조건으로 데이터베이스 조회가 실행되었는지 확인
      expect(mockLectureRepository.find).toHaveBeenCalledWith({
        where: {
          status: SpecialLectureStatus.OPEN,
          date: expect.anything(),
          currentParticipants: LessThan(30),
        },
        relations: ['lecturer'],
        order: { date: 'ASC' },
      });
    });

    it('신청 가능한 특강이 없을 경우 빈 배열을 반환하는지 확인', async () => {
      // Arrange (준비): 신청 가능한 특강이 없는 상황 시뮬레이션
      const mockLectureRepository = createMockLectureRepository([]);
      service['lectureRepository'] = mockLectureRepository as any;

      // Act (실행): 신청 가능한 특강 목록 조회 기능 실행
      const result = await service.getAvailableLectures();

      // Assert (검증): 결과가 빈 배열인지 확인
      expect(result).toEqual([]);
      expect(mockLectureRepository.find).toHaveBeenCalled();
    });

    it('특정 사용자가 신청 가능한 특강 목록을 정상적으로 조회하는지 확인', async () => {
      // Arrange (준비): 사용자와 등록된 특강을 포함한 mock repository 설정
      const mockUserRepository = createMockUserRepository(TEST_USER);
      const mockRegistrationRepository = createMockRegistrationRepository(TEST_REGISTRATIONS);
      const mockLectureRepository = createMockLectureRepository(TEST_SPECIAL_LECTURES);

      service['userRepository'] = mockUserRepository as any;
      service['registrationRepository'] = mockRegistrationRepository as any;
      service['lectureRepository'] = mockLectureRepository as any;

      // Act (실행): 특정 사용자가 신청 가능한 특강 목록 조회 기능 실행
      const result = await service.getAvailableLecturesForUser(TEST_USER.userId);

      // Assert (검증):
      // 1. 조회된 결과가 예상한 데이터와 일치하는지 확인
      expect(result).toEqual(TEST_SPECIAL_LECTURES);
      // 2. 사용자가 존재하는지 확인하기 위한 조회가 실행되었는지 확인
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { userId: TEST_USER.userId } });
      // 3. 해당 사용자의 신청 기록 조회가 실행되었는지 확인
      expect(mockRegistrationRepository.find).toHaveBeenCalledWith({ where: { userId: TEST_USER.userId } });
      // 4. 신청 가능한 특강 조회가 올바른 조건으로 실행되었는지 확인
      expect(mockLectureRepository.find).toHaveBeenCalledWith({
        where: {
          status: SpecialLectureStatus.OPEN,
          date: expect.anything(),
          currentParticipants: LessThan(30),
          id: Not(In([TEST_SPECIAL_LECTURES[0].id])),
        },
        relations: ['lecturer'],
        order: { date: 'ASC' },
      });
    });

    it('특정 사용자가 신청 가능한 특강이 없을 경우 빈 배열을 반환하는지 확인', async () => {
      // Arrange (준비): 사용자가 신청 가능한 특강이 없는 상황 시뮬레이션
      const mockUserRepository = createMockUserRepository(TEST_USER);
      const mockRegistrationRepository = createMockRegistrationRepository(TEST_REGISTRATIONS);
      const mockLectureRepository = createMockLectureRepository([]);

      service['userRepository'] = mockUserRepository as any;
      service['registrationRepository'] = mockRegistrationRepository as any;
      service['lectureRepository'] = mockLectureRepository as any;

      // Act (실행): 특정 사용자가 신청 가능한 특강 목록 조회 기능 실행
      const result = await service.getAvailableLecturesForUser(TEST_USER.userId);

      // Assert (검증): 결과가 빈 배열인지 확인
      expect(result).toEqual([]);
      expect(mockLectureRepository.find).toHaveBeenCalled();
    });
  });

  // 특강 신청 목록 조회 관련 테스트 그룹
  describe('특강 신청 목록 조회 테스트', () => {
    it('사용자의 특강 신청 목록을 정상적으로 조회하는지 확인', async () => {
      // Arrange (준비): 특강 신청 목록 조회를 위한 mock repository 설정
      const mockRegistrationRepository = createMockRegistrationRepository();
      service['registrationRepository'] = mockRegistrationRepository as any;

      // Act (실행): 특강 신청 목록 조회 기능 실행
      const result = await service.getSpecialLectureRegistrations(TEST_USER.userId);

      // Assert (검증)
      // 1. 조회된 결과가 예상한 데이터와 일치하는지 확인
      expect(result).toEqual(TEST_REGISTRATIONS);
      // 2. 올바른 조건으로 데이터베이스 조회가 실행되었는지 확인
      expect(mockRegistrationRepository.find).toHaveBeenCalledWith({
        where: { userId: TEST_USER.userId },
        relations: ['specialLecture'],
      });
    });
  });
});