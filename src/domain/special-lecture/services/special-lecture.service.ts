import { DataSource, Repository } from 'typeorm';
import { User } from 'src/domain/entities/user.entity';
import { SpecialLecture } from 'src/domain/entities/special-lecture.entity';
import { SpecialLectureRegist } from 'src/domain/entities/special-lecture-regist.entity';
import { InjectRepository } from '@nestjs/typeorm';

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
    ) {}

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
        // 유저 정보를 조회한다.
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) throw new Error(`User with ID ${userId} not found.`);

        // 특강 정보를 조회한다.
        const lecture = await this.lectureRepository.findOne({ where: { id: specialLectureId }});
        if (!lecture) throw new Error(`Special lecture with ID ${specialLectureId} not found.`);

        // 특강 신청 객체를 생성한다.
        const registration = this.registrationRepository.create({
            user,
            userId: user.userId,
            specialLecture: lecture,
            specialLectureId: lecture.id,
        });

        // 특강 신청 정보를 데이터베이스에 저장한다.
        await this.registrationRepository.save(registration);

        return registration;
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