# 3분할 트레이너 PWA v11 — iOS 스타일 × 갤럭시 Z 폴드7 레이아웃

## 새로운 점
- 시각 디자인: iOS 네이티브 앱 느낌 (반투명 플로팅 탭, 그라디언트 운동 카드, 둥근 카드, 가독성 높은 숫자)
- 폴더블 레이아웃: 접힌 화면은 하단 플로팅 탭 / 펼친 화면은 반투명 왼쪽 탭 + 2열 카드
- 갤럭시 시스템 글꼴 사용 (Apple의 글꼴을 별도로 제공하거나 배포하지 않음)
- 신규 버전 아이콘 파일명 `app-icon-v11-*.png`으로 Chrome이 아이콘 업데이트를 식별할 수 있게 함
- Android 홈 화면용 maskable 아이콘 추가
- 기존 운동 기록 및 사용자 설정 localStorage 키 `threeSplitPWA_v1` 유지
- 저장된 루틴, 그래프, 세트 입력, 운동 중 종목 추가/삭제, 백업 기능 유지

## Github Pages 교체 순서
1. 기존 앱에서 설정 > JSON 내보내기로 **먼저 백업**
2. 이번 압축을 해제해 GitHub Pages의 기존 저장소 루트에 모든 파일 업로드. 반드시 새 `ios-fold7.css`, `app-icon-v11-192.png`, `app-icon-v11-512.png`, `app-icon-maskable-v11-512.png` 포함.
3. Commit 이후 **같은 주소**로 기존 앱을 다시 열어 새 버전 확인.
4. 앱 아이콘은 Chrome에 설치된 앱의 메뉴에서 **앱 업데이트 검토**가 나타나면 승인. 바로 바뀌지 않아도 삭제는 마지막 수단.
5. `manifest.json`의 위치, GitHub Pages URL, PWA `start_url`/`scope`는 유지해야 기존 설치 앱 연속성이 보장됨.

## 운동 기록과 앱 제거
운동기록은 Chrome의 해당 사이트 로컬 저장소에 저장됩니다. 같은 주소로 업데이트하면 대개 기록이 유지됩니다.
Android에서 앱 제거 후 데이터가 남을 수는 있지만 브라우저 사이트 데이터가 삭제되면 복구할 수 없습니다.
Google 계정/Chrome Sync는 이 localStorage 운동기록을 자동으로 복원해 주는 백업 기능이 아닙니다.

## 로컬 테스트
`python -m http.server 8080` 이후 `http://localhost:8080` 접속.
HTTPS GitHub Pages에서 PWA로 설치할 수 있습니다.
