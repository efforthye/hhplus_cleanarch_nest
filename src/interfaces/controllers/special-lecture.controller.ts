import { Controller, Post, Get, Param, BadRequestException } from '@nestjs/common';
import { SpecialLectureService } from 'src/domain/special-lecture/services/special-lecture.service';

@Controller('special-lecture')
export class SpecialLectureController {
  constructor(
    private readonly specialLectureService: SpecialLectureService,
  ) {}

  /**
   * 신청 가능한 특강 목록 조회
   * @returns 현재 신청 가능한 특강 목록
   */
  @Get('available/lectures')
  async getAvailableLectures() {
    return await this.specialLectureService.getAvailableLectures();
  }

  /**
   * 특정 사용자가 신청 가능한 특강 목록 조회
   * @param userId 조회하려는 사용자의 ID
   * @returns 해당 사용자가 신청 가능한 특강 목록
   * 
   * 조건:
   * 1. OPEN 상태인 특강
   * 2. 현재 날짜 이후의 특강
   * 3. 신청 인원이 마감되지 않은 특강
   * 4. 해당 사용자가 아직 신청하지 않은 특강
   */
  @Get('available/lectures/user/:userId')
  async getAvailableLecturesForUser(
    @Param('userId') userId: string,
  ) {
    return await this.specialLectureService.getAvailableLecturesForUser(userId);
  }

  /**
    * 특강 신청 API
    * @param userId 신청하려는 사용자의 아이디
    * @param specialLectureId 신청하려는 특강 아이디
    * @returns 생성된 특강 신청 정보
    * 
    * 조건:
    * 1. 유효한 사용자 아이디
    * 2. 유효한 특강 아이디
    * 3. 신청 가능한 상태의 특강(OPEN)
    * 4. 수강 인원이 마감되지 않은 특강
  */
  @Post(':userId/:specialLectureId')
  async registerLecture(
    @Param('userId') userId: string,
    @Param('specialLectureId') specialLectureId: number,
  ) {
    try {
      return await this.specialLectureService.registerForSpecialLecture(userId, specialLectureId);
    } catch (error) {
      if (error.message === 'The lecture is fully booked.') {
        throw new BadRequestException('신청 가능한 인원이 초과되었습니다.');
      }
      throw error;
    }
  }

  /**
    * 사용자의 모든 특강 신청 목록 조회 API
    * @param userId 조회하려는 유저의 아이디
    * @returns 해당 사용자가 신청한 모든 특강 목록
    * 
    * 특징:
    * 1. 특강 정보를 함께 포함하여 반환
    * 2. 과거의 특강이나 신청 취소된 특강도 포함
    */
  @Get(':userId')
  async getRegistrations(
    @Param('userId') userId: string,
  ) {
    return await this.specialLectureService.getSpecialLectureRegistrations(userId);
  }

  /**
    * 특정 특강 신청 여부 조회 API
    * @param userId 조회하려는 유저 아이디
    * @param specialLectureId 조회하려는 특강 아이디
    * @returns 해당 특강의 신청 정보 (신청하지 않은 경우 null)
    * 
    * 특징:
    * 1. 특정 사용자가 특정 특강을 신청했는지 여부 확인
    * 2. 특강 상세 정보도 함께 반환
    */
  @Get(':userId/:specialLectureId')
  async getRegistration(
    @Param('userId') userId: string,
    @Param('specialLectureId') specialLectureId: number,
  ) {
    return await this.specialLectureService.getSpecialLectureRegistration(
      userId,
      specialLectureId
    );
  }
}