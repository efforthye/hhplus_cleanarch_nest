// 특강 테이블 정의
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, UpdateDateColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SpecialLectureRegist } from './special-lecture-regist.entity';
import { Lecturer } from './lecturer.entity';
import { SpecialLectureStatus } from './enums';

@Entity('special_lecture')
export class SpecialLecture {
    // 특강 아이디
    @PrimaryGeneratedColumn()
    id: number;

    // 특강 제목
    @Column()
    title: string;

    // 특강 강사 정보(특강N:강사1 관계)
    @ManyToOne(() => Lecturer, lecturer => lecturer.lectures)
    @JoinColumn({ name: 'lecturer_id' })
    lecturer: Lecturer;

    // 강사 아이디(FK)
    @Column()
    lecturerId: number;

    // 특강 일
    @Column()
    date: Date;

    // 최대 수강 인원 수 (기본 30명)
    @Column({ default: 30 })
    maxParticipants: number;

    // 현재 신청한 인원 수
    @Column({ default: 0 })
    currentParticipants: number;

    // 특강 상태 (OPEN, CLOSED)
    @Column({ 
        type: 'enum', 
        enum: SpecialLectureStatus, 
        default: SpecialLectureStatus.OPEN 
    })
    status: SpecialLectureStatus;

    // 특강 데이터 생성일
    @CreateDateColumn()
    createdAt: Date;

    // 특강 데이터 수정일
    @UpdateDateColumn()
    updatedAt: Date;

    // 특강 신청 목록 (특강1:신청목록N 관계)
    @OneToMany(() => SpecialLectureRegist, registration => registration.specialLecture)
    registrations: SpecialLectureRegist[];
}