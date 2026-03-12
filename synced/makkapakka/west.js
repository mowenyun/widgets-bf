WidgetMetadata = {
    id: "western_trends_hub",
    title: "欧美风向标|口碑与热度",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    description: "聚合烂番茄(口碑)与流媒体平台(热度)，高精度抓取无Emoji纯净版。",
    version: "1.1.0", // 🚀 升级：引入高精度 FlixPatrol 抓取引擎，全面纯净化 UI
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",

    modules: [
        {
            title: "欧美风向标",
            functionName: "loadWesternTrends",
            type: "video", 
            cacheDuration: 3600,
            params: [
                {
                    name: "sort_by", 
                    title: "选择榜单",
                    type: "enumeration",
                    value: "rt_movies_home",
                    enumOptions: [
                        { title: "烂番茄 - 流媒体热映", value: "rt_movies_home" },
                        { title: "烂番茄 - 院线 热映", value: "rt_movies_theater" },
                        { title: "烂番茄 - 热门 剧集", value: "rt_tv_popular" },
                        { title: "烂番茄 - 最新 剧集", value: "rt_tv_new" },
                        { title: "烂番茄 - 最佳流媒体", value: "rt_movies_best" },
                        { title: "Netflix Top10", value: "fp_netflix" },
                        { title: "HBO Top10", value: "fp_hbo" },
                        { title: "Disney+ Top10", value: "fp_disney" },
                        { title: "Apple TV+ Top10", value: "fp_apple" },
                        { title: "Amazon Top10", value: "fp_amazon" }
                    ]
                },
                {
                    name: "region",
                    title: "地区 (仅热度榜)",
                    type: "enumeration",
                    value: "united-states",
                    belongTo: { 
                        paramName: "sort_by",
                        value: ["fp_netflix", "fp_hbo", "fp_disney", "fp_apple", "fp_amazon"] 
                    },
                    enumOptions: [
                        { title: "美国", value: "united-states" },
                        { title: "英国", value: "united-kingdom" },
                        { title: "韩国", value: "south-korea" },
                        { title: "日本", value: "japan" },
                        { title: "台灣", value: "taiwan" },
                        { title: "香港", value: "hong-kong" }
                    ]
                },
                {
                    name: "mediaType",
                    title: "类型 (仅热度榜)",
                    type: "enumeration",
                    value: "tv",
                    belongTo: { 
                        paramName: "sort_by",
                        value: ["fp_netflix", "fp_hbo", "fp_disney", "fp_apple", "fp_amazon"] 
                    },
                    enumOptions: [
                        { title: "剧集", value: "tv" },
                        { title: "电影", value: "movie" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        }
    ]
};

// =========================================================================
// 0. 通用配置
// =========================================================================

const GENRE_MAP = {
    28: "动作", 12: "冒险", 16: "动画", 35: "喜剧", 80: "犯罪", 99: "纪录片",
    18: "剧情", 10751: "家庭", 14: "奇幻", 36: "历史", 27: "恐怖", 10402: "音乐",
    9648: "悬疑", 10749: "爱情", 878: "科幻", 10770: "电视电影", 53: "惊悚",
    10752: "战争", 37: "西部", 10759: "动作冒险", 10765: "科幻奇幻"
};

const RT_URLS = {
    "rt_movies_theater": "https://www.rottentomatoes.com/browse/movies_in_theaters/sort:popular?minTomato=75",
    "rt_movies_home": "https://www.rottentomatoes.com/browse/movies_at_home/sort:popular?minTomato=75",
    "rt_movies_best": "https://www.rottentomatoes.com/browse/movies_at_home/sort:critic_highest?minTomato=90",
    "rt_tv_popular": "https://www.rottentomatoes.com/browse/tv_series_browse/sort:popular?minTomato=75",
    "rt_tv_new": "https://www.rottentomatoes.com/browse/tv_series_browse/sort:newest?minTomato=75"
};

// =========================================================================
// 1. 入口分流
// =========================================================================

async function loadWesternTrends(params = {}) {
    const sort_by = params.sort_by || "rt_movies_home"; 
    const page = params.page || 1;
    
    if (sort_by.startsWith("rt_")) return await loadRottenTomatoes(sort_by, page);
    if (sort_by.startsWith("fp_")) {
        const platform = sort_by.replace("fp_", ""); 
        return await loadFlixPatrol(platform, params.region, params.mediaType);
    }
}

// =========================================================================
// 2. 烂番茄逻辑 (口碑榜)
// =========================================================================

async function loadRottenTomatoes(listType, page) {
    const pageSize = 15;
    const allItems = await fetchRottenTomatoesList(listType);
    if (allItems.length === 0) return [];
    
    const start = (page - 1) * pageSize;
    const pageItems = allItems.slice(start, start + pageSize);
    const promises = pageItems.map((item, i) => searchTmdb(item, start + i + 1));
    return (await Promise.all(promises)).filter(Boolean);
}

async function fetchRottenTomatoesList(type) {
    const url = RT_URLS[type] || RT_URLS["rt_movies_home"];
    try {
        const res = await Widget.http.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = Widget.html.load(res.data || "");
        const items = [];
        $('[data-qa="discovery-media-list-item"]').each((i, el) => {
            const $el = $(el);
            const title = $el.find('[data-qa="discovery-media-list-item-title"]').text().trim();
            if (!title) return;
            const scoreEl = $el.find('score-pairs');
            items.push({
                title: title,
                tomatoScore: scoreEl.attr('critics-score') || "",
                popcornScore: scoreEl.attr('audiencescore') || "",
                mediaType: type.includes("tv") ? "tv" : "movie"
            });
        });
        return items;
    } catch (e) { return []; }
}

async function searchTmdb(rtItem, rank) {
    const cleanTitle = rtItem.title.replace(/\s\(\d{4}\)$/, "");
    try {
        const res = await Widget.tmdb.get(`/search/${rtItem.mediaType}`, {
            params: { query: cleanTitle, language: "zh-CN", page: 1 }
        });
        const match = (res.results || [])[0];
        if (!match) return null;

        // 去除 Emoji，采用纯净文字
        let scores = [];
        if (rtItem.tomatoScore) scores.push(`新鲜度 ${rtItem.tomatoScore}%`);
        if (rtItem.popcornScore) scores.push(`爆米花 ${rtItem.popcornScore}%`);
        
        return buildItem(match, rtItem.mediaType, {
            customSub: scores.join(" | ") || "烂番茄认证榜"
        });
    } catch (e) { return null; }
}

// =========================================================================
// 3. FlixPatrol 逻辑 (高精度抓取替换版)
// =========================================================================

async function loadFlixPatrol(platform, region = "united-states", mediaType = "tv") {
    const titles = await fetchFlixPatrolData(platform, region, mediaType);
    if (titles.length === 0) return await fetchTmdbFallback(platform, region, mediaType);
    const promises = titles.slice(0, 10).map((title, i) => searchTmdbFP(title, mediaType, i + 1));
    return (await Promise.all(promises)).filter(Boolean);
}

async function fetchFlixPatrolData(platform, region, mediaType) {
    const url = `https://flixpatrol.com/top10/${platform}/${region}/`;
    try {
        const res = await Widget.http.get(url, { 
            headers: { 
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1" 
            } 
        });
        const html = typeof res === 'string' ? res : (res.data || "");
        if (!html) return [];

        const $ = Widget.html.load(html);
        const tables = $('.card-table tbody');
        
        // 精准定位 Movie 或 TV 表格
        let targetTable = null;
        if (tables.length >= 2) {
            targetTable = mediaType === "movie" ? tables.eq(0) : tables.eq(1);
        } else if (tables.length === 1) {
            targetTable = tables.eq(0);
        } else {
            return [];
        }

        const titles = [];
        targetTable.find('tr').each((i, el) => {
            if (i >= 10) return; // 取 Top 10

            const textLink = $(el).find('a.hover\\:underline').text().trim();
            const textTd = $(el).find('td').eq(2).text().trim();
            
            const finalTitle = textLink || textTd;
            if (finalTitle && finalTitle.length > 1) {
                // 去除可能存在的年份后缀
                titles.push(finalTitle.split('(')[0].trim());
            }
        });

        return titles;
    } catch (e) { return []; }
}

async function searchTmdbFP(title, mediaType, rank) {
    const cleanTitle = title.trim();
    try {
        const res = await Widget.tmdb.get(`/search/${mediaType}`, {
            params: { query: cleanTitle, language: "zh-CN", page: 1 }
        });
        const match = (res.results || [])[0];
        if (!match) return null;
        
        return buildItem(match, mediaType, { rank: rank });
    } catch (e) { return null; }
}

async function fetchTmdbFallback(platform, region, mediaType) {
    // 匹配 western_trends_hub 的平台枚举命名
    const map = { "netflix":"8", "disney":"337", "hbo":"1899|118", "apple":"350", "amazon":"119" };
    const regMap = { "united-states":"US", "united-kingdom":"GB", "south-korea":"KR", "japan":"JP", "taiwan":"TW", "hong-kong":"HK" };
    
    try {
        const res = await Widget.tmdb.get(`/discover/${mediaType}`, {
            params: {
                watch_region: regMap[region] || "US",
                with_watch_providers: map[platform] || "8",
                sort_by: "popularity.desc",
                language: "zh-CN",
                page: 1
            }
        });
        return (res.results || []).slice(0, 10).map((item, i) => buildItem(item, mediaType, { rank: i + 1 }));
    } catch (e) { return []; }
}

// =========================================================================
// 4. 通用 Item 构建器 (统一纯净UI排版)
// =========================================================================

function buildItem(item, mediaType, { rank, customSub } = {}) {
    const dateStr = item.first_air_date || item.release_date || "";
    
    // 只取真实类型，丢弃“剧集/电影”这种笼统前缀
    const genreNames = (item.genre_ids || [])
        .map(id => GENRE_MAP[id])
        .filter(Boolean)
        .slice(0, 2)
        .join(" / ");
        
    // 根据是烂番茄还是平台榜单决定副文本显示逻辑
    let descInfo = "";
    if (rank) {
        descInfo = `TOP ${rank} | 评分 ${item.vote_average ? item.vote_average.toFixed(1) : "0.0"}`;
    } else if (customSub) {
        descInfo = customSub;
    } else {
        descInfo = `评分 ${item.vote_average ? item.vote_average.toFixed(1) : "0.0"}`;
    }

    return {
        id: String(item.id),
        tmdbId: parseInt(item.id),
        type: "tmdb",
        mediaType: mediaType,
        
        title: item.name || item.title, // 纯净原版标题，无前缀
        
        // 核心规范：日期和纯类型的精妙组合
        genreTitle: genreNames || "影视",
        releaseDate: dateStr, 
        subTitle: "", 
        
        // 核心规范：严格的海报双重输出
        posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
        backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : "",
        
        // 信息降级到竖版的卡片下边
        description: `${descInfo}\n${item.overview || "暂无简介"}`,
        rating: item.vote_average || 0
    };
}
