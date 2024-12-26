// 특강 신청 상태 정의
enum RegistrationStatus {
    PENDING = 'PENDING', // 진행중
    APPROVED = 'APPROVED', // 신청완료
    REJECTED = 'REJECTED' // 신청실패
}

// 강의 상태 정의
enum SpecialLectureStatus {
    OPEN = 'OPEN', // 신청 가능
    CLOSED = 'CLOSED' // 신청 종료
}

export {
    RegistrationStatus, SpecialLectureStatus
}