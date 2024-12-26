// 특강 신청 테이블 정의
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Unique } from 'typeorm';
import { SpecialLecture } from './special-lecture.entity';
import { User } from './user.entity';
import { RegistrationStatus } from './enums';

@Entity('special_lecture_regist') // 엔티티 정의
@Unique(['userId', 'specialLectureId']) // 유니크(동일 사용자의 중복 신청 방지)
export class SpecialLectureRegist {
    // 특강 신청 아이디
    @PrimaryGeneratedColumn()
    id: number;

    // 유저 엔티티 관계 추가(특강신청N:유저1 관계)
    @ManyToOne(() => User, user => user.registrations)
    @JoinColumn({ name: 'user_id' })
    user: User;

    // 특강 신청한 유저 아이디(FK)
    @Column()
    userId: string;

    // 신청 상태 (PENDING(대기중), APPROVED(승인됨), REJECTED(거절됨))
    @Column({ 
        type: 'enum', 
        enum: RegistrationStatus, 
        default: RegistrationStatus.PENDING 
    })
    status: RegistrationStatus;

    // 신청한 특강 정보(특강신청N:특강1 관계)
    @ManyToOne(() => SpecialLecture, specialLecture => specialLecture.registrations)
    @JoinColumn({ name: 'special_lecture_id' })
    specialLecture: SpecialLecture;

    // 특강 아이디(FK)
    @Column()
    specialLectureId: number;

    // 특강 신청일
    @CreateDateColumn()
    createdAt: Date;

    // 신청 데이터 수정일
    @UpdateDateColumn()
    updatedAt: Date;
}