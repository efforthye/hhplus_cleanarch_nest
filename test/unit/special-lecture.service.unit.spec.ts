import { DataSource } from 'typeorm';
import { SpecialLectureService } from '../../src/domain/special-lecture/services/special-lecture.service';
import { DATABASE_CONFIG, TEST_SPECIAL_LECTURE, TEST_REGISTRATION, TEST_USER } from './consts';

describe('특강 신청 서비스 테스트', () => {
  // 특강 서비스 정의
  let service: SpecialLectureService;

  // Mock Repository 생성을 도와주는 함수 정의
  const createMockUserRepository = (user = TEST_USER) => ({
    findOne: jest.fn().mockResolvedValue(user)
  });
  const createMockLectureRepository = (specialLecture = TEST_SPECIAL_LECTURE) => ({
    findOne: jest.fn().mockResolvedValue(specialLecture)
  });
  const createMockRegistrationRepository = (registration = TEST_REGISTRATION) => ({
    findOne: jest.fn().mockResolvedValue(registration),
    find: jest.fn().mockResolvedValue([registration]),
    create: jest.fn().mockReturnValue(registration),
    save: jest.fn().mockResolvedValue(registration)
  });

  // 각 테스트 실행 전에 서비스 인스턴스를 새로 생성
  beforeEach(() => service = new SpecialLectureService(new DataSource(DATABASE_CONFIG)));

  // 특강 신청 관련 테스트 그룹
  describe('특강 신청 테스트', () => {
    it('특강 신청이 정상적으로 처리되는지 확인', async () => {
      // Arrange (준비): 테스트에 필요한 mock repository 설정
      const mockUserRepository = createMockUserRepository();
      const mockLectureRepository = createMockLectureRepository();
      const mockRegistrationRepository = createMockRegistrationRepository();

      // 서비스에 mock repository 주입
      service['userRepository'] = mockUserRepository as any;
      service['lectureRepository'] = mockLectureRepository as any;
      service['registrationRepository'] = mockRegistrationRepository as any;

      // Act (실행): 특강 신청 기능 실행
      const result = await service.registerForSpecialLecture(TEST_USER.userId, TEST_SPECIAL_LECTURE.id);

      // Assert (검증)
      // 1. 특강 신청이 성공적으로 이루어져서 올바른 등록 정보가 반환되었는지 확인
      expect(result).toEqual(TEST_REGISTRATION);
      // 2. 유저 조회가 올바른 userId로 실행되어 유저 검증이 완료 되었는지 확인
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { userId: TEST_USER.userId } });
      // 3. 특강 조회가 올바른 specialLectureId로 실행되었는지 확인
      expect(mockLectureRepository.findOne).toHaveBeenCalledWith({ where: { id: TEST_SPECIAL_LECTURE.id }});
      // 4. 특강 신청 엔티티 생성 시 올바른 데이터가 전달되었는지 확인(사용자 정보, 특강 정보 등)
      expect(mockRegistrationRepository.create).toHaveBeenCalledWith({
        user: TEST_USER,
        userId: TEST_USER.userId,
        specialLecture: TEST_SPECIAL_LECTURE,
        specialLectureId: TEST_SPECIAL_LECTURE.id,
      });
      // 5. 생성된 특강 신청 엔티티가 실제로 저장소에 저장되었는지 확인
      expect(mockRegistrationRepository.save).toHaveBeenCalledWith(TEST_REGISTRATION);
    });

    it('존재하지 않는 사용자로 특강 신청시 에러가 정상적으로 발생하는지 확인', async () => {
      // Arrange (준비): 사용자를 찾을 수 없는 상황 시뮬레이션
      const mockUserRepository = createMockUserRepository(null);
      service['userRepository'] = mockUserRepository as any;

      // Act & Assert (실행 및 검증): 존재하지 않는 사용자로 특강 신청시 에러 발생 여부 확인
      await expect(
        service.registerForSpecialLecture('invalidUserId', TEST_SPECIAL_LECTURE.id)
      ).rejects.toThrow(`User with ID invalidUserId not found.`);
    });

    it('존재하지 않는 특강 신청시 에러가 정상적으로 발생하는지 확인', async () => {
      // Arrange (준비): 특강을 찾을 수 없는 상황 시뮬레이션
      const mockUserRepository = createMockUserRepository();
      const mockLectureRepository = createMockLectureRepository(null);
      
      service['userRepository'] = mockUserRepository as any;
      service['lectureRepository'] = mockLectureRepository as any;

      // Act & Assert (실행 및 검증): 존재하지 않는 특강으로 신청시 에러 발생 여부 확인
      await expect(
        service.registerForSpecialLecture(TEST_USER.userId, 999)
      ).rejects.toThrow(`Special lecture with ID 999 not found.`);
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
      expect(result).toEqual([TEST_REGISTRATION]);
      // 2. 올바른 조건으로 데이터베이스 조회가 실행되었는지 확인
      expect(mockRegistrationRepository.find).toHaveBeenCalledWith({
        where: { userId: TEST_USER.userId },
        relations: ['specialLecture'],
      });
    });
  });

  // 특강 신청 여부 조회 관련 테스트 그룹
  describe('특강 신청 여부 조회 테스트', () => {
    it('사용자의 특정 특강 신청 여부를 정상적으로 조회 가능한지 확인', async () => {
      // Arrange (준비): 특강 신청 여부 조회를 위한 mock repository 설정
      const mockRegistrationRepository = createMockRegistrationRepository();
      service['registrationRepository'] = mockRegistrationRepository as any;

      // Act (실행): 특정 특강에 대한 신청 여부 조회 기능 실행
      const result = await service.getSpecialLectureRegistration(TEST_USER.userId, TEST_SPECIAL_LECTURE.id);

      // Assert (검증)
      // 1. 조회된 결과가 예상한 데이터와 일치하는지 확인
      expect(result).toEqual(TEST_REGISTRATION);
      // 2. 올바른 조건으로 데이터베이스 조회가 실행되었는지 확인
      expect(mockRegistrationRepository.findOne).toHaveBeenCalledWith({
        where: { userId: TEST_USER.userId, specialLectureId: TEST_SPECIAL_LECTURE.id },
      });
    });
  });
});