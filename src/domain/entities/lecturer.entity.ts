// 특강 강연자 엔티티 정의
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { SpecialLecture } from "./special-lecture.entity";

@Entity('lecturers')
export class Lecturer {
    // 강사 아이디
    @PrimaryGeneratedColumn()
    id: number;  

    // 강사 이름
    @Column({})
    name: string;  

    // 강사 소개
    @Column({ nullable: true })
    description: string;  

    // 강사가 진행하는 특강 목록(강사1:특강N 관계)
    @OneToMany(() => SpecialLecture, lecture => lecture.lecturer)
    lectures: SpecialLecture[];  

    // 데이터 생성일
    @CreateDateColumn()
    createdAt: Date;  

    // 데이터 수정일
    @UpdateDateColumn()
    updatedAt: Date;  
}