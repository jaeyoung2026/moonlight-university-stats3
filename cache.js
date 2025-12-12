// Cache Utilities for Moonlight Dashboard
// TTL: 1 minute (60000ms)

const CACHE_TTL = 60 * 1000; // 1분

const CacheKeys = {
    GROUP_STATS: 'moonlight_group_stats',      // 단체 쿠폰 통계
    PERSONAL_STATS: 'moonlight_personal_stats', // 개인 쿠폰 통계
    USED_KEYS: 'moonlight_used_keys',          // 사용된 쿠폰 키 목록
    CSV_DATA: 'moonlight_csv_data'             // CSV 데이터
};

function getCache(key) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age > CACHE_TTL) {
            localStorage.removeItem(key);
            return null;
        }

        return { data, age, remaining: CACHE_TTL - age };
    } catch (e) {
        localStorage.removeItem(key);
        return null;
    }
}

function setCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn('Cache save failed:', e);
    }
}

function clearCache(key) {
    if (key) {
        localStorage.removeItem(key);
    } else {
        Object.values(CacheKeys).forEach(k => localStorage.removeItem(k));
    }
}

function getCacheAge(key) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        const { timestamp } = JSON.parse(cached);
        return Date.now() - timestamp;
    } catch (e) {
        return null;
    }
}
