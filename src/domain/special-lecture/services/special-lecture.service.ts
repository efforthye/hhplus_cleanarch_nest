import { DataSource, In, LessThan, MoreThan, MoreThanOrEqual, Not, Raw, Repository } from 'typeorm';
import { User } from 'src/domain/entities/user.entity';
import { SpecialLecture } from 'src/domain/entities/special-lecture.entity';
import { SpecialLectureRegist } from 'src/domain/entities/special-lecture-regist.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegistrationStatus, SpecialLectureStatus } from 'src/domain/entities/enums';

export class SpecialLectureService {   /**
    * SpecialLectureService 생성자
    * NestJS의 DI(Dependency Injection)를 통해 레포지토리들을 주입받는다.
    * 
    * @param userRepository - 사용자 정보 관리를 위한 TypeORM 레포지토리
    * @InjectRepository(User) 데코레이터를 통해 User 엔티티에 대한 레포지토리 주입
    * @param lectureRepository - 특강 정보 관리를 위한 TypeORM 레포지토리
    * @InjectRepository(SpecialLecture) 데코레이터를 통해 SpecialLecture 엔티티에 대한 레포지토리 주입
    * @param registrationRepository - 특강 신청 정보 관리를 위한 TypeORM 레포지토리
    * @InjectRepository(SpecialLectureRegist) 데코레이터를 통해 SpecialLectureRegist 엔티티에 대한 리포지토리 주입
    */
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(SpecialLecture)
        private lectureRepository: Repository<SpecialLecture>,
        @InjectRepository(SpecialLectureRegist)
        private registrationRepository: Repository<SpecialLectureRegist>,
        // 트랜잭션을 위해 데이터 소스 주입
        private dataSource: DataSource, 
    ) {}


    /**
     * 신청 가능한 특강 목록 조회
     * @returns 현재 신청 가능한 특강 목록
     * 
     * 조건:
     * 1. OPEN 상태인 특강
     * 2. 현재 날짜 이후의 특강
     * 3. 신청 인원이 마감되지 않은 특강
     */
    async getAvailableLectures() {
        const currentDate = new Date(); // 현재 날짜
        return await this.lectureRepository.find({
            where: {
                status: SpecialLectureStatus.OPEN,
                date: MoreThanOrEqual(currentDate),
                currentParticipants: LessThan(30)
            },
            relations: ['lecturer'],
            order: {date: 'ASC'}, // 날짜 오름차순 정렬
        });
    }

    /**
     * 특정 사용자가 신청 가능한 특강 목록 조회
     * @param userId 조회할 사용자의 ID
     * @returns 해당 사용자가 신청 가능한 특강 목록
     */
    async getAvailableLecturesForUser(userId: string) {
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            // 사용자가 존재하지 않는 경우 빈 배열 반환
            return [];
        }

        const userRegistrations = await this.registrationRepository.find({ where: { userId } });
        const registeredLectureIds = userRegistrations.map(reg => reg.specialLectureId);

        const whereCondition: any = {
            status: SpecialLectureStatus.OPEN,
            date: MoreThanOrEqual(new Date()),
            currentParticipants: LessThan(30)
        };

        // 사용자가 이미 신청한 특강은 제외
        if (registeredLectureIds.length > 0) {
            whereCondition.id = Not(In(registeredLectureIds));
        }

        return await this.lectureRepository.find({
            where: whereCondition,
            relations: ['lecturer'],
            order: {
                date: 'ASC'
            }
        });
    }

    /**
     * 특강 신청 함수
     * @param userId - 신청 유저 아이디
     * @param specialLectureId - 신청하는 특강 아이디
     * @returns 신청 정보
     * 
     * 사용자와 특강 정보를 조회한 후, 특강 신청 엔티티를 생성하고 저장한다.
     * 신청 유저 아이디와 특강 아이디가 존재하지 않는 경우 오류를 발생시킨다.
     */
    async registerForSpecialLecture(userId: string, specialLectureId: number) {
        return await this.dataSource.transaction(async (manager) => {
          // 유저 정보 확인
          const user = await manager.getRepository(User).findOne({ where: { userId } });
          if (!user) throw new Error(`User with ID ${userId} not found.`);
      
          // 특강 정보 확인 및 잠금 적용
          const lecture = await manager.getRepository(SpecialLecture).findOne({
            where: { id: specialLectureId },
            lock: { mode: 'pessimistic_write' }, // 트랜잭션 잠금
          });
          if (!lecture) throw new Error(`Special lecture with ID ${specialLectureId} not found.`);
      
          // 현재 시간과 참가자 제한 확인
          const now = new Date();
          let registrationStatus: RegistrationStatus;
      
          if (lecture.currentParticipants >= lecture.maxParticipants || now >= lecture.date) {
            // 강의 상태를 CLOSED로 변경
            lecture.status = SpecialLectureStatus.CLOSED;
            await manager.getRepository(SpecialLecture).save(lecture);
            // 신청 상태를 REJECTED로 설정
            registrationStatus = RegistrationStatus.REJECTED;
          } else {
            // 신청 성공
            lecture.currentParticipants += 1; // 참가자 수 증가
            await manager.getRepository(SpecialLecture).save(lecture);
            registrationStatus = RegistrationStatus.APPROVED;
          }
      
          // 신청 정보 생성
          const registration = manager.getRepository(SpecialLectureRegist).create({
            user,
            userId: user.userId,
            specialLecture: lecture,
            specialLectureId: lecture.id,
            status: registrationStatus,
          });
      
          // 신청 정보 저장
          await manager.getRepository(SpecialLectureRegist).save(registration);
      
          return registration;
        });
    }
      

    /**
     * 사용자의 특강 신청 목록 조회 함수
     * @param userId - 조회할 유저 아이디
     * @returns 유저의 특강 신청 목록 응답
     * 
     * 유저 아이디에 해당하는 특강 신청 목록을 조회한다.
     */
    async getSpecialLectureRegistrations(userId: string) {
        const registrations = await this.registrationRepository.find({
            where: { userId },
            relations: ['specialLecture'],
        });

        return registrations;
    }

    /**
     * 특정 사용자의 특정 특강 신청 여부 조회 함수
     * @param userId - 조회할 유저 아이디
     * @param specialLectureId - 조회할 특강 아이디
     * @returns 특강 신청 정보 (신청되어 있으면 해당 신청 정보, 신청되어 있지 않으면 null)
     * 
     * 주어진 유저 아이디와 특강 아이디에 해당하는 특강 신청 정보를 조회한다.
     */
    async getSpecialLectureRegistration(userId: string, specialLectureId: number) {
        const registration = await this.registrationRepository.findOne({
            where: { userId, specialLectureId },
        });

        return registration;
    }
}