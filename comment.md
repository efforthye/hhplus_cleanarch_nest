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