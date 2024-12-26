import { Controller, Post, Get, Param } from '@nestjs/common';
import { SpecialLectureService } from 'src/domain/special-lecture/services/special-lecture.service';

@Controller('special-lecture')
export class SpecialLectureController {
  constructor(
    private readonly specialLectureService: SpecialLectureService,
  ) {}

  // 특강 신청 API
  @Post(':userId/:lectureId')
  async registerLecture(
    @Param('userId') userId: string,
    @Param('lectureId') lectureId: number,
  ) {
    return await this.specialLectureService.registerForSpecialLecture(
      userId,
      lectureId
    );
  }

  // 사용자의 모든 특강 신청 목록 조회 API
  @Get(':userId')
  async getRegistrations(
    @Param('userId') userId: string,
  ) {
    return await this.specialLectureService.getSpecialLectureRegistrations(userId);
  }

  // 특정 특강 신청 여부 조회 API
  @Get(':userId/:lectureId')
  async getRegistration(
    @Param('userId') userId: string,
    @Param('lectureId') lectureId: number,
  ) {
    return await this.specialLectureService.getSpecialLectureRegistration(
      userId,
      lectureId
    );
  }
}