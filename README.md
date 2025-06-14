https://webpro-vercel-three.vercel.app/
host: vercel.com
database:  Neon Postgres

## 프로젝트 발표 정리

### 1. 프로젝트 요약
- **배포 환경:** Vercel (서버리스 구조)
- **DB:** PostgreSQL (Neon 등 클라우드 서비스)
- **주요 기능:** 스레드(게시글) 작성/조회, 그림판, 여러 공지, 셔틀버스 안내, 주요 사이트 바로가기

---

### 2. 주요 기술 스택
- **프론트엔드:** HTML, CSS, JavaScript (fetch API)
- **백엔드(API):** Vercel 서버리스 함수(`api/threads.js`), node-postgres(`pg`)
- **배포:** Vercel (환경변수로 DB 접속 정보 관리)

---

### 3. 폴더 및 파일 구조
webproVercel/
├── api/
│   └── threads.js      # 서버리스 함수(API)
├── public/
│   ├── index.html      # 메인 페이지 HTML
│   ├── main.js         # 프론트엔드 JS
│   └── style.css       # CSS
├── package.json        # 프로젝트 설정 및 의존성

---

### 4. 주요 구현 내용
- **api/threads.js:** 서버리스 함수로 스레드(게시글) 조회/작성 API 구현
- **public/main.js:** 스레드 목록 표시, 글 작성, 그림판 등 프론트엔드 기능
- **public/style.css:** 반응형 디자인, 버튼/섹션 스타일, 배경색 등
- **환경변수:** Vercel 대시보드에서 `DATABASE_URL`(Postgres 접속 정보) 등록
- **기타:** 셔틀버스 안내(iframe), 포털/LMS/수강신청 바로가기 버튼

---

### 5. 배포 및 테스트
- GitHub에 코드 push → Vercel에서 자동 배포
- 배포된 Vercel URL에서 기능 정상 동작 확인
- 문제 발생 시 Vercel의 배포 로그 및 환경변수
