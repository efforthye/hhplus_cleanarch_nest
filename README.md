<img width="1126" alt="스크린샷 2024-12-27 오전 4 36 57" src="https://github.com/user-attachments/assets/1036f5fc-9659-4dbc-a62b-da54e01397af" /># 특강 신청 시스템

## ERD Diagram
![alt text](images/erd_diagram.png)


### 테이블
- special_lecture
  - 특강 정보를 저장한다.
  - 한 강사가 여러 특강을 진행할 수 있다.
  - 수강 신청 인원을 관리할 수 있다.
- special_lecture_regist
  - 유저의 특강 신청 정보를 저장한다.
  - 특강 신청 상태를 관리할 수 있다.
  - 중복 신청을 방지할 수 있다.
- lecturer
  - 특강을 진행할 강사의 정보를 저장한다.
  - 한 강사가 여러 특강을 진행할 수 있다.
- user
  - 특강을 신청할 사용자들의 정보를 저장한다.



### 테이블 설계 이유 
- 특강 테이블 (special_lecture): 특강별 데이터를 독립적으로 관리하기 위해 설계.
  - 수강 신청 인원 관리: currentParticipants와 maxParticipants 필드를 통해 특강별 참가자 수를 관리.
  - 강사 정보 연결: lecturerId를 통해 강사와 연결하여 강의와 강사를 효율적으로 관리.
- 특강 신청 테이블 (special_lecture_regist): 사용자별 신청 정보를 기록하고 중복 신청을 방지.
  - 유저와 특강 연결: userId와 specialLectureId를 통해 유저와 특강을 연결.
  - 중복 방지: userId와 specialLectureId 조합을 Unique Key로 설정하여 중복 신청을 방지.
  - 신청 상태 관리: 신청 취소나 완료 상태를 기록하기 위한 필드(status) 추가.
- 강사 테이블 (lecturer): 강사 정보를 분리하여 재사용성과 관리성을 높임.
  - 다중 강의 관리: 한 강사가 여러 특강을 진행할 수 있는 구조.
  - 확장성: 강사 정보(소개, 전문 분야 등)를 쉽게 확장 가능.
- 유저 테이블 (user): 특강 신청자의 정보를 관리하고, 다양한 요청 처리에 대비.
  - 특강 신청 정보와 연결: 유저가 신청한 특강을 추적.
  - 확장성: 사용자 인증 및 권한 관리를 추가할 여지를 남김.


### 테이블 관계 설정
1. 특강1:신청N => 한 특강에 신청 여러개
2. 유저1:특강신청N => 한 유저가 특강 여러개 신청할 수 있음(다른 특강인 경우)
3. 강사1:특강N => 한 강사가 여러 특강 진행
4. 강의신청은 유저아이디와 특강아이디 조합을 유니크로 해 중복을 방지하도록 설계한다.
<br/><br/><br/>


# 클린 레이어드 아키텍처
### 계층 분리
- common: 공통 기능
- domain: 비즈니스 핵심
- infrastructure: 기술 구현
- interfaces: 외부 통신
### 의존성 방향
- 외부(interfaces) → 내부(domain)
- infrastructure는 domain 인터페이스 구현
### 관심사 분리
- 각 계층이 명확한 역할 수행
- 모듈별 독립성 유지

## common
### 특징
- 여러 모듈에서 공통으로 사용하는 유틸리티를 포함시킨다.
### 폴더 구조
- interceptor: 로깅, 인증, 에러 처리, 요청 검증 등 요청/응답 처리 전후에 실행되는 공통 로직을 정의한다. (요청/응답 전후 로직 담당)
### 추후 추가될 수 있는 폴더 구조
- utils: 공통 유틸리티 함수들
- constants: 상수값 정의
- types: 공통 타입 정의
- filters: 요청/응답 필터
- decorators: 공통 데코레이터
- middleware: 공통 미들웨어
- exceptions: 예외 처리 클래스
- guards: 인증/인가 가드

## domain
### 특징
- 비즈니스 핵심 로직을 포함시킨다.
- 다른 계층에 의존하지 않는다. (의존성 역전 원칙에 의하여)
### 폴더 구조
- entities: 모든 도메인의 공통 비즈니스 데이터 모델을 정의할 예정이다. (데이터 구조/타입 정의)
- special-lecture: 특강 관련 로직 및 규칙 개발
- user: 사용자 관련 로직 개발
### 각 도메인 로직 내부에 추가될 수 있는 폴더 구조
- repositories: 조회 및 저장 등 데이터 접근 인터페이스 정의
- services: 실제 비즈니스 로직 및 규칙 구현 
- interfaces: 도메인 계약 정의 및 다른 계층과의 통신 규약 정의
- dto: 요청 DTO 등 실제 계층 간 데이터 전송 객체 정의 및 데이터 검증 로직 정의 (내부 데이터 전송 용도)
- exceptions: 도메인 별 예외 및 비즈니스 예외 정의
- events: 도메인 이벤트 핸들러로 실제 로직 완료 이벤트를 정의
- enums: 도메인 관련 상수 정의

## infrastructure
### 특징
- 외부 시스템 연동 로직을 포함시킨다.
- DB, 외부 API 등 기술적 구현이 여기에 들어간다.
### 폴더 구조
- database: mysql을 추가할 예정이기 때문에 추가하였다. 데이터베이스 연결과 mysql 구성 파일, 데이터베이스 마이그레이션 등의 로직을 정의할 예정이다. (DB 연결/설정만 담당)
- repositories: domain에서 정의한 인터페이스를 실제 구현하는 구현체 역할을 하며 실제 데이터베이스 쿼리를 수행할 것이다. (실제 데이터 조작 로직만 담당)

## interfaces
### 특징
- 외부와의 실제 통신을 담당한다.
### 폴더 구조
- controllers: API 엔드포인트 정의 및 도메인 서비스 호출, 실제 HTTP 요청/응답 처리
- dto: 입력 데이터 검증 및 API 요청/응답 데이터 구조 정의 (외부 API 통신 용도)
### 추후 추가될 수 있는 폴더 구조
- middleware: 요청 전처리/후처리 정의
- pipes: 데이터 변환 및 검증
- guards: 인증/권한 검사
- interceptors: 요청/응답 로깅, 에러 처리 추가
- filters: 예외 처리 정의
- decorators: 컨트롤러/메소드 데코레이터 정의
- validators: 입력 데이터 유효성 검사 추가
<br/><br/><br/>

# 프로젝트 실행 방법
- pnpm install
- pnpm run start
- pnpm run test

## postman example
- 특정 날짜에 신청 가능한 특강 목록 조회
![Uploading 스크린샷 2024-12-27 오전 4.36.57.png…]()
