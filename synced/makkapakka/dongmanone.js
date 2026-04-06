// =========================================================================
// 核心配置 (Bangumi 增强源 - 纯动态爬取版)
// =========================================================================

const currentYear = new Date().getFullYear();
const startYear = Math.max(currentYear + 1, 2026); 
const yearOptions = [];
for (let year = startYear; year >= 1940; year--) { 
    yearOptions.push({ title: `${year}`, value: `${year}` });
}

// =========================================================================
// Widget Metadata (全境聚合版)
// =========================================================================
var WidgetMetadata = {
    id: "anime_omni_fix_pro",
    title: "二次元全境聚合",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    description: "一站式聚合多平台动漫榜单 (纯享TMDB海报版 - 实时爬取)。",
    version: "2.5.0", // 🚀 升级：彻底剥离外部JSON，全线转为官方API与实时网页爬取
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",

    modules: [
        {
            title: "Bangumi 追番日历",
            functionName: "loadBangumiCalendar",
            type: "video",
            cacheDuration: 3600,
            params: [
                {
                    name: "sort_by", 
                    title: "选择日期",
                    type: "enumeration",
                    value: "today",
                    enumOptions: [
                        { title: "📅 今日更新", value: "today" },
                        { title: "周一 (月)", value: "1" },
                        { title: "周二 (火)", value: "2" },
                        { title: "周三 (水)", value: "3" },
                        { title: "周四 (木)", value: "4" },
                        { title: "周五 (金)", value: "5" },
                        { title: "周六 (土)", value: "6" },
                        { title: "周日 (日)", value: "7" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        },
        {
            title: "Bilibili 热榜",
            functionName: "loadBilibiliRank",
            type: "video", 
            cacheDuration: 1800,
            params: [
                {
                    name: "sort_by", 
                    title: "榜单分区",
                    type: "enumeration",
                    value: "1",
                    enumOptions: [
                        { title: "📺 B站番剧 (日漫)", value: "1" },
                        { title: "🇨🇳 B站国创 (国漫)", value: "4" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        },
        {
            title: "Bangumi 近期热门",
            description: "实时爬取 Bangumi 近期热门浏览榜",
            requiresWebView: false,
            functionName: "fetchRecentHot",
            type: "video",
            cacheDuration: 7200,
            params: [
                { name: "category", title: "分类", type: "enumeration", value: "anime", enumOptions: [ { title: "动画", value: "anime" } ] },
                { name: "page", title: "页码", type: "page", value: "1" }
            ]
        },
        {
            title: "Bangumi 年度/季度榜单",
            description: "实时爬取 Bangumi 年月检索数据",
            requiresWebView: false,
            functionName: "fetchAirtimeRanking",
            type: "video",
            cacheDuration: 7200,
            params: [
                { name: "category", title: "分类", type: "enumeration", value: "anime", enumOptions: [ { title: "动画", value: "anime" }, { title: "三次元", value: "real" } ] },
                { 
                    name: "year", 
                    title: "年份", 
                    type: "enumeration",
                    description: "选择一个年份进行浏览。", 
                    value: `${currentYear}`, 
                    enumOptions: yearOptions 
                },
                { name: "month", title: "月份/季度", type: "enumeration", value: "all", description: "选择全年或特定季度对应的月份。留空则为全年。", enumOptions: [ { title: "全年", value: "all" }, { title: "冬季 (1月)", value: "1" }, { title: "春季 (4月)", value: "4" }, { title: "夏季 (7月)", value: "7" }, { title: "秋季 (10月)", value: "10" } ] },
                { name: "sort", title: "排序方式", type: "enumeration", value: "collects", enumOptions: [ { title: "排名", value: "rank" }, { title: "热度", value: "trends" }, { title: "收藏数", value: "collects" }, { title: "发售日期", value: "date" }, { title: "名称", "value": "title" } ] },
                { name: "page", title: "页码", type: "page", value: "1" }
            ]
        },
        {
            title: "Bangumi 每日放送 (高级筛选)",
            description: "调用 Bangumi 官方 API 实时获取每日放送数据",
            requiresWebView: false,
            functionName: "fetchDailyCalendarApi",
            type: "video",
            cacheDuration: 7200,
            params: [
                {
                    name: "filterType",
                    title: "筛选范围",
                    type: "enumeration",
                    value: "today",
                    enumOptions: [
                        { title: "今日放送", value: "today" },
                        { title: "指定单日", value: "specific_day" },
                        { title: "本周一至四", value: "mon_thu" },
                        { title: "本周五至日", value: "fri_sun" },
                        { title: "整周放送", value: "all_week" }
                    ]
                },
                {
                    name: "specificWeekday",
                    title: "选择星期",
                    type: "enumeration",
                    value: "1",
                    description: "仅当筛选范围为“指定单日”时有效。",
                    enumOptions: [
                        { title: "星期一", value: "1" }, { title: "星期二", value: "2" },
                        { title: "星期三", value: "3" }, { title: "星期四", value: "4" },
                        { title: "星期五", value: "5" }, { title: "星期六", value: "6" },
                        { title: "星期日", value: "7" }
                    ],
                    belongTo: { paramName: "filterType", value: ["specific_day"] }
                },
                {
                    name: "dailySortOrder", title: "排序方式", type: "enumeration",
                    value: "popularity_rat_bgm",
                    enumOptions: [
                        { title: "热度(评分人数)", value: "popularity_rat_bgm" },
                        { title: "评分", value: "score_bgm_desc" },
                        { title: "放送日(更新日期)", value: "airdate_desc" },
                        { title: "默认", value: "default" }
                    ]
                }
            ]
        },
        {
            title: "TMDB 热门/新番",
            functionName: "loadTmdbAnimeRanking",
            type: "video",
            cacheDuration: 3600,
            params: [
                {
                    name: "sort_by",
                    title: "榜单类型",
                    type: "enumeration",
                    value: "trending",
                    enumOptions: [
                        { title: "🔥 实时流行 (Trending)", value: "trending" },
                        { title: "📅 最新首播 (New)", value: "new" },
                        { title: "👑 高分神作 (Top Rated)", value: "top" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        },
        {
            title: "AniList 流行榜",
            functionName: "loadAniListRanking",
            type: "video",
            cacheDuration: 7200,
            params: [
                {
                    name: "sort_by",
                    title: "排序方式",
                    type: "enumeration",
                    value: "TRENDING_DESC",
                    enumOptions: [
                        { title: "📈 近期趋势 (Trending)", value: "TRENDING_DESC" },
                        { title: "💖 历史人气 (Popularity)", value: "POPULARITY_DESC" },
                        { title: "⭐ 评分最高 (Score)", value: "SCORE_DESC" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        },
        {
            title: "MAL 权威榜单",
            functionName: "loadMalRanking",
            type: "video",
            cacheDuration: 7200,
            params: [
                {
                    name: "sort_by",
                    title: "榜单类型",
                    type: "enumeration",
                    value: "airing",
                    enumOptions: [
                        { title: "🔥 当前热播 Top", value: "airing" },
                        { title: "🏆 历史总榜 Top", value: "all" },
                        { title: "🎥 最佳剧场版", value: "movie" },
                        { title: "🔜 即将上映", value: "upcoming" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        }
    ]
};

// =========================================================================
// 核心工具函数与 TMDB 严格匹配器
// =========================================================================

const GENRE_MAP = {
    16: "动画", 10759: "动作冒险", 35: "喜剧", 18: "剧情", 14: "奇幻", 
    878: "科幻", 9648: "悬疑", 10749: "爱情", 27: "恐怖", 10765: "科幻奇幻"
};

function getGenreText(ids) {
    if (!ids || !Array.isArray(ids)) return "动画";
    const genres = ids.filter(id => id !== 16).map(id => GENRE_MAP[id]).filter(Boolean);
    return genres.length > 0 ? genres.slice(0, 2).join(" / ") : "动画";
}

function parseDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    let match = dateStr.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (match) return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
    match = dateStr.match(/^(\d{4})年(\d{1,2})月/);
    if (match) return `${match[1]}-${String(match[2]).padStart(2, '0')}-01`;
    match = dateStr.match(/^(\d{4})$/);
    if (match) return `${match[1]}-01-01`;
    return dateStr;
}

/** * 🚨 核心武器：专供动漫的 TMDB 严格映射器
 * 只映射带有 "16(动画)" 标签的影视，且带年份降级重搜机制！
 */
async function searchTmdbAnimeStrict(title1, title2, year) {
    async function doSearch(query) {
        if (!query || typeof query !== 'string') return null;
        const cleanQuery = query.replace(/第[一二三四五六七八九十\d]+[季章]/g, "").replace(/Season \d+/i, "").trim();
        
        try {
            // 1. 搜剧集 (TV)
            let params = { query: cleanQuery, language: "zh-CN", include_adult: false };
            if (year) params.first_air_date_year = year;
            
            let res = await Widget.tmdb.get("/search/tv", { params });
            let candidates = res.results || [];
            
            if (candidates.length === 0 && year) {
                delete params.first_air_date_year;
                res = await Widget.tmdb.get("/search/tv", { params });
                candidates = res.results || [];
            }
            
            let animeTvs = candidates.filter(r => r.genre_ids?.includes(16));
            if (animeTvs.length > 0) return animeTvs.find(r => r.poster_path) || animeTvs[0];

            // 2. 搜电影 (Movie - 剧场版)
            let mParams = { query: cleanQuery, language: "zh-CN", include_adult: false };
            if (year) mParams.primary_release_year = year;
            res = await Widget.tmdb.get("/search/movie", { params: mParams });
            candidates = res.results || [];

            if (candidates.length === 0 && year) {
                delete mParams.primary_release_year;
                res = await Widget.tmdb.get("/search/movie", { params: mParams });
                candidates = res.results || [];
            }
            
            let animeMovies = candidates.filter(r => r.genre_ids?.includes(16));
            if (animeMovies.length > 0) return animeMovies.find(r => r.poster_path) || animeMovies[0];

        } catch (e) {}
        return null;
    }

    let match = await doSearch(title1);
    if (!match && title2 && title1 !== title2) {
        match = await doSearch(title2);
    }
    return match;
}

/** * 🚨 宁缺毋滥的清洗器：
 * 将 Bangumi 原生数据映射到 TMDB，如果找不到，直接返回 null 抛弃该数据！
 */
async function sanitizeAndEnsureTmdb(items) {
    if (!items || !Array.isArray(items)) return [];
    const promises = items.map(async (item) => {
        
        const title = item.name_cn || item.title || item.name;
        const subTitle = item.title !== title ? item.title : null; 
        const rawDate = item.releaseDate || item.description || item.air_date || item.info || "";
        const yearMatch = rawDate.match(/(\d{4})/);
        const year = yearMatch ? yearMatch[1] : null;

        const tmdbMatch = await searchTmdbAnimeStrict(title, subTitle, year);
        
        if (tmdbMatch) {
            return {
                id: String(tmdbMatch.id),
                tmdbId: parseInt(tmdbMatch.id),
                type: "tmdb",
                mediaType: tmdbMatch.title ? "movie" : "tv",
                title: tmdbMatch.name || tmdbMatch.title || title,
                genreTitle: getGenreText(tmdbMatch.genre_ids),
                description: tmdbMatch.first_air_date || tmdbMatch.release_date || parseDate(rawDate) || "即将播出",
                releaseDate: tmdbMatch.first_air_date || tmdbMatch.release_date || parseDate(rawDate),
                posterPath: tmdbMatch.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMatch.poster_path}` : "",
                backdropPath: tmdbMatch.backdrop_path ? `https://image.tmdb.org/t/p/w780${tmdbMatch.backdrop_path}` : "",
                rating: tmdbMatch.vote_average ? tmdbMatch.vote_average.toFixed(1) : (item.rating || "0.0")
            };
        }
        
        return null; 
    });
    
    const results = await Promise.all(promises);
    return results.filter(Boolean);
}

function buildTmdbItem(item, forceType) {
    const isMovie = forceType === "movie" || item.title;
    return {
        id: String(item.id),
        tmdbId: parseInt(item.id),
        type: "tmdb",
        mediaType: isMovie ? "movie" : "tv",
        title: item.name || item.title,
        genreTitle: getGenreText(item.genre_ids),
        description: item.first_air_date || item.release_date || "未知",
        releaseDate: item.first_air_date || item.release_date || "",
        posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
        backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : "",
        rating: item.vote_average ? item.vote_average.toFixed(1) : "0.0"
    };
}

function buildItem({ id, tmdbId, type, title, date, poster, backdrop, rating, genreText, subTitle, desc }) {
    return {
        id: String(id),
        tmdbId: parseInt(tmdbId),
        type: "tmdb", 
        mediaType: type || "tv",
        title: title,
        genreTitle: genreText || "动画", 
        description: date || subTitle || "暂无日期", 
        releaseDate: date,
        posterPath: poster ? `https://image.tmdb.org/t/p/w500${poster}` : "",
        backdropPath: backdrop ? `https://image.tmdb.org/t/p/w780${backdrop}` : "",
        rating: rating ? Number(rating).toFixed(1) : "0.0"
    };
}


// =========================================================================
// API 爬取与映射函数
// =========================================================================

// --- 🌟 模块 0：直观的 Bangumi 追番日历 ---
async function loadBangumiCalendar(params = {}) {
    const { sort_by = "today", page = 1 } = params;
    let targetDayId = parseInt(sort_by);
    if (sort_by === "today") {
        const jsDay = new Date().getDay();
        targetDayId = jsDay === 0 ? 7 : jsDay;
    }
    
    try {
        const res = await Widget.http.get("https://api.bgm.tv/calendar");
        const dayData = (res.data || []).find(d => d.weekday && d.weekday.id === targetDayId);
        if (!dayData) return [];
        
        const pageSize = 20;
        const pageItems = dayData.items.slice((page - 1) * pageSize, page * pageSize);

        const promises = pageItems.map(async (item) => {
            const cleanTitle = (item.name_cn || item.name).replace(/第[一二三四五六七八九十\d]+[季章]/g, "").trim();
            const year = item.air_date ? item.air_date.substring(0, 4) : null;
            
            const tmdbItem = await searchTmdbAnimeStrict(cleanTitle, item.name, year);
            if (!tmdbItem) return null;

            return buildItem({
                id: tmdbItem.id,
                tmdbId: tmdbItem.id,
                type: "tv",
                title: tmdbItem.name || tmdbItem.title || item.name_cn || item.name,
                date: tmdbItem.first_air_date || item.air_date,
                poster: tmdbItem.poster_path,
                backdrop: tmdbItem.backdrop_path,
                rating: tmdbItem.vote_average || item.rating?.score,
                genreText: getGenreText(tmdbItem.genre_ids),
                desc: tmdbItem.overview || item.summary || "暂无简介"
            });
        });
        
        const results = await Promise.all(promises);
        return results.filter(Boolean);
    } catch (e) { return []; }
}


// --- 模块 1：Bangumi 榜单 (纯动态爬取版) ---

async function fetchRecentHot(params = {}) {
    const category = params.category || "anime";
    const page = parseInt(params.page || "1", 10);
    // 直接爬取 Bangumi 原站浏览器热门
    const url = `https://bgm.tv/${category}/browser?sort=rank&page=${page}`; 
    const rawItems = await DynamicDataProcessor.processBangumiPage(url, category);
    // 🛡️ 洗脱 Bangumi 封面，重铸 TMDB 护甲！
    return await sanitizeAndEnsureTmdb(rawItems);
}

async function fetchAirtimeRanking(params = {}) {
    const category = params.category || "anime";
    const year = params.year || `${new Date().getFullYear()}`;
    const month = params.month || "all";
    const sort = params.sort || "collects";
    const page = parseInt(params.page || "1", 10);

    // 直接构造归档/榜单 URL 并爬取
    const monthStr = month === "all" ? "" : `/${month}`;
    const url = `https://bgm.tv/${category}/browser/airtime/${year}${monthStr}?sort=${sort}&page=${page}`;
    
    const rawItems = await DynamicDataProcessor.processBangumiPage(url, category);
    return await sanitizeAndEnsureTmdb(rawItems);
}

async function fetchDailyCalendarApi(params = {}) {
    // 直接调用 Bangumi 官方日历 API
    const items = await DynamicDataProcessor.processDailyCalendar();
    
    const { filterType = "today", specificWeekday = "1", dailySortOrder = "popularity_rat_bgm" } = params;
    const JS_DAY_TO_BGM_API_ID = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
    
    let filteredByDay = [];
    if (filterType === "all_week") {
        filteredByDay = items;
    } else {
        const today = new Date();
        const currentJsDay = today.getDay();
        const targetBgmIds = new Set();
        switch (filterType) {
            case "today": targetBgmIds.add(JS_DAY_TO_BGM_API_ID[currentJsDay]); break;
            case "specific_day": targetBgmIds.add(parseInt(specificWeekday, 10)); break;
            case "mon_thu": [1, 2, 3, 4].forEach(id => targetBgmIds.add(id)); break;
            case "fri_sun": [5, 6, 7].forEach(id => targetBgmIds.add(id)); break;
        }
        filteredByDay = items.filter(item => item.bgm_weekday_id && targetBgmIds.has(item.bgm_weekday_id));
    }

    let sortedResults = [...filteredByDay];
    if (dailySortOrder !== "default") {
        sortedResults.sort((a, b) => {
            // 根据官方 API 数据结构提取排序字段
            if (dailySortOrder === "popularity_rat_bgm") return (b.rating?.total || 0) - (a.rating?.total || 0);
            if (dailySortOrder === "score_bgm_desc") return (b.rating?.score || 0) - (a.rating?.score || 0);
            if (dailySortOrder === "airdate_desc") {
                const dateA = a.air_date || 0;
                const dateB = b.air_date || 0;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            }
            return 0;
        });
    }
    return await sanitizeAndEnsureTmdb(sortedResults);
}

// --- 模块 2：第三方直接抓取模块 ---

async function loadBilibiliRank(params = {}) {
    const { sort_by = "1", page = 1 } = params; 
    const url = `https://api.bilibili.com/pgc/web/rank/list?day=3&season_type=${sort_by}`; 
    try {
        const res = await Widget.http.get(url, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://www.bilibili.com/" } });
        const data = res.data || {};
        const fullList = data.result?.list || data.data?.list || [];
        const pageSize = 20;
        const slicedList = fullList.slice((page - 1) * pageSize, page * pageSize);

        const promises = slicedList.map(async (item) => {
            const cleanTitle = item.title.replace(/第[一二三四五六七八九十\d]+[季章]/g, "").trim();
            const tmdbItem = await searchTmdbAnimeStrict(cleanTitle, item.title, null);
            if (!tmdbItem) return null; 
            return buildTmdbItem(tmdbItem);
        });
        const results = await Promise.all(promises);
        return results.filter(Boolean); 
    } catch (e) { return []; }
}

async function loadTmdbAnimeRanking(params = {}) {
    const { sort_by = "trending", page = 1 } = params; 
    let queryParams = { language: "zh-CN", page: page, with_genres: "16", with_original_language: "ja" };
    
    if (sort_by === "trending") queryParams.sort_by = "popularity.desc"; 
    else if (sort_by === "new") queryParams.sort_by = "first_air_date.desc"; 
    else if (sort_by === "top") queryParams.sort_by = "vote_average.desc"; 

    try {
        const res = await Widget.tmdb.get("/discover/tv", { params: queryParams });
        return (res.results || []).map(item => buildTmdbItem(item, "tv"));
    } catch (e) { return []; }
}

async function loadAniListRanking(params = {}) {
    const { sort_by = "TRENDING_DESC", page = 1 } = params; 
    const query = `query ($page: Int, $perPage: Int) { Page (page: $page, perPage: $perPage) { media (sort: ${sort_by}, type: ANIME) { title { native romaji english } averageScore seasonYear } } }`; 
    try {
        const res = await Widget.http.post("https://graphql.anilist.co", { query, variables: { page, perPage: 20 } });
        const data = res.data?.data?.Page?.media || [];
        const promises = data.map(async (media) => {
            const tmdbItem = await searchTmdbAnimeStrict(media.title.native || media.title.romaji, media.title.english, media.seasonYear);
            if (!tmdbItem) return null; 
            return buildTmdbItem(tmdbItem);
        });
        const results = await Promise.all(promises);
        return results.filter(Boolean);
    } catch (e) { return []; }
}

async function loadMalRanking(params = {}) {
    const { sort_by = "airing", page = 1 } = params; 
    let apiParams = { page: page };
    if (sort_by === "airing") apiParams.filter = "airing"; 
    else if (sort_by === "upcoming") apiParams.filter = "upcoming"; 

    try {
        const res = await Widget.http.get("https://api.jikan.moe/v4/top/anime", { params: apiParams });
        const data = res.data?.data || [];
        const promises = data.map(async (item) => {
            const tmdbItem = await searchTmdbAnimeStrict(item.title_japanese || item.title, item.title_english, null);
            if (!tmdbItem) return null; 
            return buildTmdbItem(tmdbItem);
        });
        const results = await Promise.all(promises);
        return results.filter(Boolean);
    } catch (e) { return []; }
}

// =========================================================================
// Bangumi 动态页面抓取器 (不负责封面，只负责原站提取)
// =========================================================================
const DynamicDataProcessor = (() => {
    function parseBangumiListItems(htmlContent) {
        const $ = Widget.html.load(htmlContent);
        const items = [];
        $('ul#browserItemList li.item').each((_, element) => {
            const $item = $(element);
            const id = $item.attr('id')?.substring(5);
            if (!id) return;
            const title = $item.find('h3 a.l').text().trim();
            const info = $item.find('p.info.tip').text().trim();
            const rating = $item.find('small.fade').text().trim();
            items.push({ id, title, info, rating });
        });
        return items;
    }

    async function processBangumiPage(url, category) {
        try {
            const listHtmlResp = await Widget.http.get(url);
            return parseBangumiListItems(listHtmlResp.data);
        } catch (error) { return []; }
    }

    async function processDailyCalendar() {
        try {
            const apiResponse = await Widget.http.get("https://api.bgm.tv/calendar");
            const allItems = [];
            apiResponse.data.forEach(dayData => {
                if (dayData.items) {
                    dayData.items.forEach(item => {
                        item.bgm_weekday_id = dayData.weekday?.id;
                        allItems.push(item);
                    });
                }
            });
            return allItems;
        } catch (error) { return []; }
    }
    return { processBangumiPage, processDailyCalendar };
})();
