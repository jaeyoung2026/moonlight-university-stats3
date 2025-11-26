# 대학별 신청 현황 통계 API 구현 내역서

## 1. 프로젝트 개요

Google Sheets의 대학별 신청 현황 데이터를 정기 집계하여 JSON으로 웹에 게시하고, 외부 서비스에서 읽어갈 수 있도록 하는 시스템.

### 아키텍처
```
[Google Sheets] 
     ↓ (CSV export URL)
[개인 서버 - 크론]
     ↓ Python 집계 스크립트 실행
     ↓ JSON 파일 생성
     ↓ git commit & push
[GitHub Repository]
     ↓ (자동 트리거)
[Vercel 배포]
     ↓
[외부 서비스] ← GET https://{project}.vercel.app/data.json
```

---

## 2. 프로젝트 구조

```
university-stats/
├── public/
│   └── data.json          # 집계 결과 (자동 생성됨)
├── scripts/
│   ├── aggregate.py       # 집계 스크립트
│   ├── config.py          # 도메인-학교 매핑, 제외 목록
│   └── deploy.sh          # git push 자동화 스크립트
├── package.json           # Vercel 배포용
├── vercel.json            # Vercel 설정
├── .github/
│   └── workflows/
│       └── scheduled.yml  # (선택) GitHub Actions 크론
└── README.md
```

---

## 3. 상세 구현 요구사항

### 3.1 집계 스크립트 (scripts/aggregate.py)

**입력:** Google Sheets CSV export URL
```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid=0
```

**SHEET_ID:** `1spV0LRE7alVHKRguBMNqEDwwXdeD4u_GqW9SejEPKtw`

**처리 로직:**
1. CSV 다운로드
2. F열(도메인) 추출
3. 개인 이메일 도메인 제외 (gmail.com, naver.com 등)
4. 도메인별 카운팅
5. 도메인 → 학교명 매핑
6. 카운트 내림차순 정렬
7. JSON 파일 생성

**출력 JSON 형식 (public/data.json):**
```json
{
  "updated_at": "2025-11-26T09:30:00+09:00",
  "total_applications": 30,
  "total_universities": 14,
  "data": [
    {
      "rank": 1,
      "domain": "yonsei.ac.kr",
      "university": "연세대학교",
      "count": 10
    },
    {
      "rank": 2,
      "domain": "cau.ac.kr",
      "university": "중앙대학교",
      "count": 4
    }
  ],
  "excluded_personal_emails": 2
}
```

### 3.2 설정 파일 (scripts/config.py)

```python
# Google Sheets 설정
SHEET_ID = "1spV0LRE7alVHKRguBMNqEDwwXdeD4u_GqW9SejEPKtw"
CSV_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid=0"

# 도메인 컬럼 인덱스 (0-based)
DOMAIN_COLUMN_INDEX = 5  # F열

# 제외할 개인 이메일 도메인
EXCLUDED_DOMAINS = {
    'gmail.com',
    'naver.com', 
    'hanmail.net',
    'daum.net',
    'kakao.com',
    'hotmail.com',
    'outlook.com',
    'yahoo.com',
    'icloud.com',
    'nate.com',
}

# 도메인 → 학교명 매핑
DOMAIN_TO_UNIVERSITY = {
    # 서울 주요대
    'snu.ac.kr': '서울대학교',
    'yonsei.ac.kr': '연세대학교',
    'korea.ac.kr': '고려대학교',
    'skku.edu': '성균관대학교',
    'hanyang.ac.kr': '한양대학교',
    'cau.ac.kr': '중앙대학교',
    'khu.ac.kr': '경희대학교',
    'konkuk.ac.kr': '건국대학교',
    'ewha.ac.kr': '이화여자대학교',
    'sogang.ac.kr': '서강대학교',
    
    # 경기/인천
    'ajou.ac.kr': '아주대학교',
    'inha.ac.kr': '인하대학교',
    'dankook.ac.kr': '단국대학교',
    
    # 과기원
    'kaist.ac.kr': 'KAIST',
    'postech.ac.kr': 'POSTECH',
    'unist.ac.kr': 'UNIST',
    'gist.ac.kr': 'GIST',
    'dgist.ac.kr': 'DGIST',
    
    # 지방 국립대
    'pusan.ac.kr': '부산대학교',
    'kyungpook.ac.kr': '경북대학교',
    'cnu.ac.kr': '충남대학교',
    'o.cnu.ac.kr': '충남대학교',
    'cbnu.ac.kr': '충북대학교',
    'jnu.ac.kr': '전남대학교',
    'jbnu.ac.kr': '전북대학교',
    'gnu.ac.kr': '경상국립대학교',
    'pukyong.ac.kr': '국립부경대학교',
    'kangwon.ac.kr': '강원대학교',
    
    # 지방 사립대
    'yu.ac.kr': '영남대학교',
    'donga.ac.kr': '동아대학교',
    'inje.ac.kr': '인제대학교',
    
    # 필요시 추가
}
```

### 3.3 배포 스크립트 (scripts/deploy.sh)

```bash
#!/bin/bash
set -e

cd "$(dirname "$0")/.."

# 집계 실행
python3 scripts/aggregate.py

# 변경사항 있으면 push
if [[ -n $(git status --porcelain public/data.json) ]]; then
    git add public/data.json
    git commit -m "Update stats: $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    echo "✅ 배포 완료"
else
    echo "ℹ️ 변경사항 없음"
fi
```

### 3.4 Vercel 설정 (vercel.json)

```json
{
  "version": 2,
  "public": true,
  "headers": [
    {
      "source": "/data.json",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "public, max-age=60, stale-while-revalidate=300" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/public/$1" }
  ]
}
```

### 3.5 package.json

```json
{
  "name": "university-stats",
  "version": "1.0.0",
  "private": true
}
```

---

## 4. 크론 설정

### 옵션 A: 개인 서버 crontab
```bash
# 매시간 정각 실행
0 * * * * /path/to/university-stats/scripts/deploy.sh >> /var/log/university-stats.log 2>&1
```

### 옵션 B: GitHub Actions (.github/workflows/scheduled.yml)
```yaml
name: Update Stats

on:
  schedule:
    - cron: '0 * * * *'  # 매시간
  workflow_dispatch:      # 수동 실행 가능

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: pip install requests
      
      - name: Run aggregation
        run: python scripts/aggregate.py
      
      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add public/data.json
          git diff --staged --quiet || git commit -m "Update stats"
          git push
```

---

## 5. 배포 절차

### 5.1 초기 설정 (1회)

1. GitHub 레포지토리 생성: `university-stats`

2. Vercel 연결:
   - vercel.com 접속 → Import Project
   - GitHub 레포 선택
   - Framework: Other
   - Output Directory: `public`
   - Deploy

3. (옵션) 커스텀 도메인 설정

### 5.2 운영

- Google Sheets 데이터 추가 → 크론이 자동 집계 → GitHub push → Vercel 자동 배포
- 새 도메인 발견 시 `config.py`의 `DOMAIN_TO_UNIVERSITY`에 추가

---

## 6. API 사용 예시

### 엔드포인트
```
GET https://university-stats.vercel.app/data.json
```

### 응답 예시
```json
{
  "updated_at": "2025-11-26T09:30:00+09:00",
  "total_applications": 30,
  "total_universities": 14,
  "data": [
    {"rank": 1, "domain": "yonsei.ac.kr", "university": "연세대학교", "count": 10},
    {"rank": 2, "domain": "cau.ac.kr", "university": "중앙대학교", "count": 4},
    {"rank": 3, "domain": "hanyang.ac.kr", "university": "한양대학교", "count": 3},
    {"rank": 3, "domain": "snu.ac.kr", "university": "서울대학교", "count": 3}
  ],
  "excluded_personal_emails": 2
}
```

### 외부 서비스에서 사용
```javascript
// JavaScript
const res = await fetch('https://university-stats.vercel.app/data.json');
const stats = await res.json();
console.log(`총 ${stats.total_applications}건, ${stats.total_universities}개 대학`);
```

```python
# Python
import requests
stats = requests.get('https://university-stats.vercel.app/data.json').json()
print(f"1위: {stats['data'][0]['university']} ({stats['data'][0]['count']}건)")
```

---

## 7. 미등록 도메인 처리

집계 시 `DOMAIN_TO_UNIVERSITY`에 없는 도메인 발견 시:
- 콘솔에 경고 출력
- JSON에 `"university": "[미등록]"` 로 표시
- 주기적으로 확인하여 config.py에 추가

---

## 8. 요약

| 항목 | 내용 |
|------|------|
| 데이터 소스 | Google Sheets (CSV export) |
| 집계 주기 | 매시간 (cron) |
| 호스팅 | Vercel (무료) |
| 자동 배포 | GitHub push → Vercel |
| 캐시 | 60초 (stale-while-revalidate 5분) |
| CORS | 전체 허용 (*) |