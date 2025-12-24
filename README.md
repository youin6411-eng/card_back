# 카드 뒤집기 게임 (Card Flipping Game)

Canvas API와 Supabase를 이용한 간단하고 재미있는 카드 뒤집기 게임입니다.

## 🎮 게임 특징
- **Canvas 기반**: HTML5 Canvas를 사용하여 부드러운 애니메이션과 렌더링을 제공합니다.
- **실시간 리더보드**: Supabase를 연동하여 상위 5명의 점수를 실시간으로 저장하고 표시합니다.
- **반응형 디자인**: 다양한 화면 크기에서도 즐길 수 있는 깔끔한 레이아웃을 갖추고 있습니다.

## 🚀 시작하기

이 프로젝트는 브라우저 보안 정책(CORS)으로 인해 로컬 서버 환경에서 실행해야 합니다.

1. **터미널에서 아래 명령어를 실행하여 로컬 서버를 띄웁니다:**
   ```bash
   npx -y http-server -p 8081 -c-1
   ```
2. **브라우저를 열고 아래 주소로 접속합니다:**
   `http://localhost:8081`

## 📂 파일 구성
- `index.html`: 게임의 구조 및 라이브러리 로드
- `style.css`: 게임의 시각적 디자인
- `script.js`: 게임 로직 및 데이터베이스 연동

## 🛠️ 기술 스택
- HTML5, CSS3, JavaScript
- [Supabase](https://supabase.com/) (Backend as a Service)
