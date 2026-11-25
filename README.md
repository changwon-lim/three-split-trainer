# 3분할 트레이너 v10 — Galaxy Z Fold7 / One UI 스타일

## 변경 내용
- iOS 기준이었던 레이아웃·타이포그래피를 Android / Samsung One UI에 어울리는 색상과 시스템 글꼴로 수정
- 갤럭시 Z 폴드7 커버 화면(접힌 상태): 세로 스크롤과 엄지 조작에 맞춘 단일 열, 하단 4탭 내비게이션
- 갤럭시 Z 폴드7 메인 화면(펼친 상태): 반응형 왼쪽 탐색 레일 + 홈 화면 2열 + 운동 종목 카드 2열 + 설정 2열
- 시스템 글꼴 사용: 기기에 설치된 기본 서체(`system-ui`)를 우선 적용. SamsungOne/Roboto/Noto Sans KR 폴백
- 다크 / 라이트 / 기기 설정 자동 추종 유지
- 기존 기능 보존: A/B/C 루틴, 운동 중 종목 추가/삭제, 드래그 재정렬, 세트별 kg·횟수·RIR, 휴식 타이머, 상세 기록, 그래프, 백업/복원
- 원래 운동 데이터의 `localStorage` 키(`threeSplitPWA_v1`) 유지. 동일 사이트 도메인/경로면 데이터가 계속 보임
- 오프라인 캐시 이름 변경: `3split-v10-oneui-fold7`

## GitHub Pages 배포
1. 앱 `설정 > JSON 내보내기`에서 운동 기록 백업
2. ZIP 압축을 풀고 **모든 파일을 repository 루트에** 업로드
3. GitHub에서 commit 후 GitHub Pages 빌드 완료 확인
4. 이전 버전의 `ios-native.css`는 더 이상 사용하지 않으며, 이번 버전의 `base-ui.css`, `oneui-fold7.css`가 반드시 필요
5. Android Chrome/Samsung Internet에서 홈 화면에 추가/앱 설치. 업데이트가 늦으면 앱을 완전히 종료 후 다시 실행

기록은 브라우저/앱 로컬 저장소에만 저장됩니다. 다른 브라우저나 앱 설치 컨테이너에서는 공유되지 않을 수 있으므로 JSON 백업을 주기적으로 보관하세요.
