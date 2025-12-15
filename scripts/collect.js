const fs = require('fs');
const path = require('path');

// KST 시간대 헬퍼 함수 (UTC+9)
function toKST(date) {
    return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}

function getKSTHour(date) {
    return toKST(date).getUTCHours();
}

function getKSTMinute(date) {
    return toKST(date).getUTCMinutes();
}

function getKSTDateStr(date) {
    return toKST(date).toISOString().slice(0, 10);
}

// 대학교 목록 (index.html에서 추출)
const universities = {
    "이화여자대학교": { key: "91PBI6D7", group: "A" },
    "서울대학교": { key: "B04UBD2S", group: "B" },
    "한양대학교": { key: "UM36B0Z0", group: "B" },
    "고려대학교": { key: "NAV5IWFJ", group: "B" },
    "중앙대학교": { key: "3FZHOVDR", group: "B" },
    "성균관대학교": { key: "MNZT2ZN1", group: "B" },
    "성신여자대학교": { key: "ICPYD5IO", group: "B" },
    "연세대학교": { key: "0HFUGZP4", group: "B" },
    "서울여자대학교": { key: "0T1C1WB0", group: "B" },
    "KAIST": { key: "E4FLTD62", group: "B" },
    "POSTECH": { key: "9M6OFMEH", group: "B" },
    "세종대학교": { key: "P8FUPI25", group: "B" },
    "숙명여자대학교": { key: "0UUB4KJP", group: "B" },
    "경북대학교": { key: "J8J9BL5W", group: "B" },
    "건국대학교": { key: "JZY1K564", group: "B" },
    "경희대학교": { key: "SLLFQBP3", group: "B" },
    "아주대학교": { key: "93YFSLZ2", group: "B" },
    "GIST": { key: "IQKHLMGE", group: "B" },
    "인하대학교": { key: "V2M1JC05", group: "B" },
    "명지대학교": { key: "0ENFCN61", group: "C" },
    "부산대학교": { key: "M7PF7H4X", group: "C" },
    "전남대학교": { key: "62VW6GQ4", group: "C" },
    "국립공주대학교": { key: "2TJ2IVKT", group: "C" },
    "서울과학종합대학원대학교": { key: "D352F7Z3", group: "C" },
    "경상국립대학교": { key: "U680UONZ", group: "C" },
    "한국항공대학교": { key: "OU9THUQ0", group: "C" },
    "서울시립대학교": { key: "ZSKHGN48", group: "C" },
    "서울과학기술대학교": { key: "3R762EBB", group: "C" },
    "국립부경대학교": { key: "TJ8VM8DR", group: "C" },
    "단국대학교": { key: "BS4I79E2", group: "C" },
    "UNIST": { key: "R553D6N2", group: "C" },
    "서강대학교": { key: "ML35JJWS", group: "C" },
    "숭실대학교": { key: "A0VIXNTH", group: "C" },
    "가천대학교": { key: "UX12GL4S", group: "C" },
    "인천대학교": { key: "XLFOTGXA", group: "C" },
    "충남대학교": { key: "S1M23NVB", group: "C" },
    "조선대학교": { key: "9AQ1A0Y6", group: "C" },
    "가톨릭대학교": { key: "UAKZNHJ5", group: "C" },
    "강원대학교": { key: "U7EMPSWV", group: "C" },
    "전북대학교": { key: "788PW5CZ", group: "C" },
    "차의과학대학교": { key: "JN9ZZSN4", group: "C" },
    "충북대학교": { key: "KLFTCD8N", group: "C" },
    "국민대학교": { key: "YDNHJYHT", group: "C" },
    "홍익대학교": { key: "V4EGADET", group: "C" },
    "국립금오공과대학교": { key: "917XY1FQ", group: "C" },
    "영남대학교": { key: "JEEFB4Z9", group: "C" },
    "계명대학교": { key: "RL4G3ALF", group: "C" },
    "동국대학교": { key: "32GQSRAR", group: "C" },
    "한국공학대학교": { key: "VV792AHB", group: "C" },
    "덕성여자대학교": { key: "LURJ9YQQ", group: "C" },
    "한경국립대학교": { key: "INO3CTN1", group: "C" },
    "경기대학교": { key: "VAC5R3W1", group: "C" },
    "광운대학교": { key: "HZN5EAGO", group: "C" },
    "동아대학교": { key: "M2O60TVW", group: "C" },
    "창원대학교": { key: "0RZ9H9ZT", group: "C" },
    "한국외국어대학교": { key: "M5XJX98L", group: "C" },
    "상명대학교": { key: "GLGEBKIU", group: "C" },
    "선문대학교": { key: "JPM3QZ47", group: "C" },
    "제주대학교": { key: "BDS7GEXO", group: "C" },
    "DGIST": { key: "00W2VHQ7", group: "C" },
    "경성대학교": { key: "KGT5QY3J", group: "C" },
    "대구대": { key: "SO4GK06L", group: "C" },
    "울산대학교": { key: "4H5A0T69", group: "C" },
    "한국기술교육대학교": { key: "M0XBNC48", group: "C" },
    "KENTECH": { key: "V8Z5H17M", group: "C" },
    "강릉원주대학교": { key: "5Z7GHGRZ", group: "C" },
    "국립한밭대학교": { key: "7ZQ3HSML", group: "C" },
    "군산대학교": { key: "105MHHID", group: "C" },
    "대구가톨릭대학교": { key: "IABAO6BI", group: "C" },
    "목포대학교": { key: "LCU374PT", group: "C" },
    "전주대학교": { key: "1MHUGDWQ", group: "C" },
    "한국교원대학교": { key: "LRSRAK50", group: "C" },
    "한국교통대학교": { key: "Q41QZP9R", group: "C" },
    "한국방송통신대학교": { key: "2JJJ4S2F", group: "C" },
    "한국해양대학교": { key: "40K800ZM", group: "C" },
    "한동대학교": { key: "GZEGPKOH", group: "C" },
    "한신대": { key: "8DIGIJ2T", group: "C" },
    "가톨릭관동대학교": { key: "EIG3T3VL", group: "C" },
    "강남대학교": { key: "7UPWETAK", group: "C" },
    "경남대학교": { key: "T7FV5N1F", group: "C" },
    "경희사이버대학교": { key: "ATTWIF85", group: "C" },
    "국제뇌교육종합대학원대학교": { key: "DTI65IMJ", group: "C" },
    "대전대학교": { key: "8Y55RFY7", group: "C" },
    "동덕여자대학교": { key: "NIAMHU96", group: "C" },
    "동의대학교": { key: "KCTY9E3T", group: "C" },
    "배재대학교": { key: "5DVC1M9J", group: "C" },
    "베를린 공과대학교": { key: "NBNVKAHE", group: "C" },
    "부산외국어대학교": { key: "7TOVB5DX", group: "C" },
    "삼육대학교": { key: "HDDSG7Y3", group: "C" },
    "수원대학교": { key: "4X6CW73S", group: "C" },
    "순천향대학교": { key: "MWDTVXTS", group: "C" },
    "장로회신학대학교": { key: "FICLI5BB", group: "C" },
    "춘천교육대학교": { key: "4QUM6JWI", group: "C" },
    "한국전통문화대학교": { key: "K59D9YHM", group: "C" },
    "한남대학교": { key: "D9N5RYAE", group: "C" },
    "한성대학교": { key: "WARSWILM", group: "C" },
    "협성대학교": { key: "48BDZ48B", group: "C" },
    "호서대학교": { key: "Y4IZLUSL", group: "C" }
};

// CSV 파일 경로
const csvFiles = [
    { file: 'couponA.csv', group: 'A' },
    { file: 'couponB.csv', group: 'B' },
    { file: 'couponC.csv', group: 'C' }
];

const API_BASE = 'https://www.themoonlight.io/api/organization';
const HISTORY_DIR = path.join(__dirname, '..', 'history');
const CURRENT_FILE = path.join(HISTORY_DIR, 'current.json');
const DAILY_DIR = path.join(HISTORY_DIR, 'daily');
const MAX_SNAPSHOTS = 14; // 5분 간격 × 12 = 1시간 + 버퍼 2개
const RETENTION_DAYS = 30;

// API 호출: 단체 쿠폰 데이터
async function fetchGroupCoupons() {
    const keys = Object.values(universities).map(u => u.key);

    const response = await fetch(`${API_BASE}/coupon-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
}

// API 호출: 사용된 쿠폰 키 목록
async function fetchUsedKeys() {
    const response = await fetch(`${API_BASE}/coupon-batch-used`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '대학제휴' })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return new Set(Array.isArray(data) ? data : (data.keys || []));
}

// CSV 파일 읽기: 개인 쿠폰 데이터
function loadPersonalCoupons() {
    const result = {};

    for (const csvInfo of csvFiles) {
        const csvPath = path.join(__dirname, '..', csvInfo.file);

        if (!fs.existsSync(csvPath)) {
            console.warn(`CSV not found: ${csvInfo.file}`);
            continue;
        }

        const content = fs.readFileSync(csvPath, 'utf-8');
        const lines = content.split('\n').slice(1); // 헤더 제외

        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length >= 3) {
                const university = parts[1].trim();
                const couponKey = parts[2].trim();

                if (university && couponKey) {
                    if (!result[university]) {
                        result[university] = { keys: [], total: 0 };
                    }
                    result[university].keys.push(couponKey);
                    result[university].total++;
                }
            }
        }
    }

    return result;
}

// 스냅샷 생성
async function createSnapshot() {
    const now = new Date();
    const timestamp = now.toISOString();

    console.log(`[${timestamp}] Creating snapshot...`);

    // 1. 단체 쿠폰 데이터 수집
    const groupApiData = await fetchGroupCoupons();

    // 2. 사용된 쿠폰 키 수집
    const usedKeys = await fetchUsedKeys();

    // 3. 개인 쿠폰 데이터 로드
    const personalCoupons = loadPersonalCoupons();

    // 4. 데이터 변환 (학교명 기준)
    const group = {};
    const personal = {};

    // 단체 쿠폰: API 키 -> 학교명 매핑
    for (const [uniName, uniData] of Object.entries(universities)) {
        const apiData = groupApiData[uniData.key];
        if (apiData) {
            const used = apiData.coupon_count_total - apiData.coupon_count;
            group[uniName] = {
                used,
                total: apiData.coupon_count_total
            };
        }
    }

    // 개인 쿠폰: 학교별 사용 현황
    for (const [uniName, data] of Object.entries(personalCoupons)) {
        const usedCount = data.keys.filter(key => usedKeys.has(key)).length;
        personal[uniName] = {
            used: usedCount,
            total: data.total
        };
    }

    return {
        time: timestamp,
        group,
        personal
    };
}

// current.json 읽기
function loadCurrent() {
    if (!fs.existsSync(CURRENT_FILE)) {
        return { lastUpdated: null, snapshots: [] };
    }

    const content = fs.readFileSync(CURRENT_FILE, 'utf-8');
    return JSON.parse(content);
}

// current.json 저장
function saveCurrent(data) {
    fs.writeFileSync(CURRENT_FILE, JSON.stringify(data, null, 2));
}

// daily 파일에 시간별 집계 추가
function addHourlyAggregate(snapshots, hour, date) {
    const dateStr = date.toISOString().slice(0, 10);
    const dailyFile = path.join(DAILY_DIR, `${dateStr}.json`);

    // 기존 daily 파일 로드 또는 새로 생성
    let dailyData;
    if (fs.existsSync(dailyFile)) {
        dailyData = JSON.parse(fs.readFileSync(dailyFile, 'utf-8'));
    } else {
        dailyData = { date: dateStr, hours: [] };
    }

    // 해당 시간대 스냅샷 필터링 (KST 기준)
    const hourSnapshots = snapshots.filter(s => {
        const snapTime = new Date(s.time);
        return getKSTHour(snapTime) === hour && getKSTDateStr(snapTime) === dateStr;
    });

    if (hourSnapshots.length === 0) {
        console.log(`No snapshots for hour ${hour}`);
        return;
    }

    // 시간별 집계 계산
    const groupAgg = {};
    const personalAgg = {};

    // 모든 학교 목록 수집
    const allGroupUnis = new Set();
    const allPersonalUnis = new Set();

    for (const snap of hourSnapshots) {
        Object.keys(snap.group || {}).forEach(u => allGroupUnis.add(u));
        Object.keys(snap.personal || {}).forEach(u => allPersonalUnis.add(u));
    }

    // 단체 쿠폰 집계
    for (const uni of allGroupUnis) {
        const values = hourSnapshots
            .map(s => s.group[uni]?.used)
            .filter(v => v !== undefined);

        if (values.length > 0) {
            groupAgg[uni] = {
                avg: values.reduce((a, b) => a + b, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values)
            };
        }
    }

    // 개인 쿠폰 집계
    for (const uni of allPersonalUnis) {
        const values = hourSnapshots
            .map(s => s.personal[uni]?.used)
            .filter(v => v !== undefined);

        if (values.length > 0) {
            personalAgg[uni] = {
                avg: values.reduce((a, b) => a + b, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values)
            };
        }
    }

    // 기존 시간 데이터 업데이트 또는 추가
    const existingIdx = dailyData.hours.findIndex(h => h.hour === hour);
    const hourData = {
        hour,
        samples: hourSnapshots.length,
        group: groupAgg,
        personal: personalAgg
    };

    if (existingIdx >= 0) {
        dailyData.hours[existingIdx] = hourData;
    } else {
        dailyData.hours.push(hourData);
        dailyData.hours.sort((a, b) => a.hour - b.hour);
    }

    fs.writeFileSync(dailyFile, JSON.stringify(dailyData, null, 2));
    console.log(`Updated daily file: ${dateStr}, hour: ${hour}, samples: ${hourSnapshots.length}`);
}

// 30일 초과 daily 파일 삭제
function cleanupOldDailyFiles() {
    const files = fs.readdirSync(DAILY_DIR);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const dateStr = file.replace('.json', '');
        const fileDate = new Date(dateStr);

        if (fileDate < cutoffDate) {
            const filePath = path.join(DAILY_DIR, file);
            fs.unlinkSync(filePath);
            console.log(`Deleted old daily file: ${file}`);
        }
    }
}

// 메인 실행
async function main() {
    try {
        const now = new Date();
        const currentMinute = getKSTMinute(now);
        const currentHour = getKSTHour(now);

        console.log(`Current KST time: ${getKSTDateStr(now)} ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);

        // 1. 새 스냅샷 생성
        const snapshot = await createSnapshot();

        // 2. current.json 업데이트
        const current = loadCurrent();
        current.snapshots.push(snapshot);

        // 60개 초과 시 오래된 것 제거 (FIFO)
        while (current.snapshots.length > MAX_SNAPSHOTS) {
            current.snapshots.shift();
        }

        current.lastUpdated = snapshot.time;
        saveCurrent(current);
        console.log(`Saved snapshot. Total: ${current.snapshots.length}`);

        // 3. 0~4분 사이일 때 이전 시간 데이터를 daily에 머지
        // (GitHub Actions 지연 대비: 정각에 실행 안되어도 0~4분 사이면 집계)
        if (currentMinute < 5 && current.snapshots.length > 0) {
            // 이전 시간(현재 시간 - 1)의 스냅샷을 집계 (KST 기준)
            const prevHour = (currentHour + 23) % 24;
            // KST 기준 이전 날짜 계산
            const kstNow = toKST(now);
            const prevDate = new Date(kstNow);
            if (currentHour === 0) {
                prevDate.setUTCDate(prevDate.getUTCDate() - 1);
            }

            addHourlyAggregate(current.snapshots, prevHour, prevDate);

            // 30일 초과 파일 정리
            cleanupOldDailyFiles();
        }

        console.log('Collection completed successfully.');

    } catch (error) {
        console.error('Collection failed:', error);
        process.exit(1);
    }
}

main();
