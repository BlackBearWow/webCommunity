# webCommunity

## 사용 언어 및 라이브러리
- nodejs
- express
- express-session
- mysql2

## 만들며 고민했던 내용
- python flask로 만들었을 때는 flask내부에서 session을 지원하여 편하게 구현했지만, express는 자체적으로 session을 지원하지 않아 express-session 모듈을 사용해 세션을 구현했다.
- express는 동기적으로 동작한다. 하지만 mysql2는 비동기적으로 작동한다. js문법상 동기 함수에서 비동기 함수 호출 결과를 읽을 수 없기 때문에 고민했다. koa.js가 비동기 함수를 쉽게 다룰 수 있게 만들어진 모듈이라고 하지만, npm사이트를 보니 express가 koa보다 18배정도 다운로드 수가 차이나는것을 보니 express로 진행하기로 했다. 
- 하지만 https://programmingsummaries.tistory.com/399 블로그에서는 예상치 못한 오류가 발생한다면 문제가 발생할 수 있다고 한다. 해당 블로그에서는 데코레이션 패턴을 사용해 해결하였다고 하니, 나도 데코레이션 패턴을 사용해 해결해 보자.

## 새로 추가한 내용

### 보안
- [] https지원
- [x] 입력값 xss, csrf검사

### 모듈화
- [x] 로그인, 로그아웃 때 navbar 내용 달라지는것 통일(새로운 페이지를 만들 때 마다 기존 문서를 수정해야되는 불편함 해소)

### 게시판 기능
로그인 한 상태에서 게시판 글 작성이 가능하게 한다. 로그인을 하지 않는다면 불가능.
- [x] 게시판 글 리스트 보이기
- [x] 게시판 글 보이기

- [x] 게시판 글 쓰기 기능
- [x] 게시판 글 삭제 기능
    - [x] 게시판 댓글들까지 삭제
- [x] 게시판 글 수정 기능

- [x] 게시판 글 내 댓글 보이기

- [x] 게시판 글 내 댓글 쓰기 기능
- [x] 게시판 글 내 댓글 삭제 기능
- [] 게시판 글 내 댓글 수정 기능

### 채팅 기능
메인 화면을 채팅 화면으로 만든다.
- [x] 현재 접속한 사람 리스트 보이기
- [x] 새로운 채팅방을 만드는 기능
- [x] 채팅 전송 기능
- [x] 특정인을 초대하는 기능
- [x] 누군가에게 채팅방을 초대받으면, 해당 채팅방에서 초대되었다고 뜬다.
- [] 비밀번호 채팅방 기능

### 내 정보 기능
내 정보를 보여주고 관리하는 페이지를 따로 만든다.
- [x] 내 정보 보여주기
- [x] 닉네임 변경 기능
- [] 비밀번호 변경 기능

### 크아 게임
lockstep 동기화 기법을 이용한 멀티플레이 게임 통신
- [x] 크아게임 시작 전, 크아채팅방에 초대 기능
- [x] 크아채팅방에서 둘 모두 레디라면 게임 시작
- [x] lockstep 사용하여 테스트
- [x] class를 적절히 활용해 initialize
- [x] logic, draw
- [x] 각종 소리 추가

### 등등 게임