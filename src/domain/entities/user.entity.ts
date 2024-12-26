// 유저 엔티티 정의
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { SpecialLectureRegist } from "./special-lecture-regist.entity";

@Entity('users')
export class User {
    // 유저 고유 아이디
    @PrimaryGeneratedColumn()
    id: number;

    // 임의의 유저 사용자 아이디
    @Column({ unique: true })
    userId: string;

    // 유저 이름
    @Column({})
    name: string;  // 사용자 이름

    // 유저의 특강 신청 목록(유저1:특강N 관계)
    @OneToMany(() => SpecialLectureRegist, regist => regist.user)
    registrations: SpecialLectureRegist[];

    // 유저 데이터 생성일
    @CreateDateColumn()
    createdAt: Date;

    // 유저 데이터 수정일
    @UpdateDateColumn()
    updatedAt: Date;
}