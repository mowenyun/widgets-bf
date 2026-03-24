// =============UserScript=============
// @name        影视聚合终极版 (内置Key)
// @description 三合一：豆瓣全能推荐 | TMDB探索 | Trakt猜你喜欢
// @author      MakkaPakka 
// =============UserScript=============

// 🔑 已内置您提供的 Key
var DEFAULT_TMDB_KEY = "d913a144d0ba98fdca978f53a1ce27a5";
var UA_PC = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
// ============================================================================
// 1. 常量定义 (API 映射与类型映射)
// ============================================================================

const DOUBAN_URLS = {
    // 📺 剧集组
    "tv_american": "https://m.douban.com/rexxar/api/v2/subject_collection/tv_american/items",
    "tv_korean": "https://m.douban.com/rexxar/api/v2/subject_collection/tv_korean/items",
    "tv_japanese": "https://m.douban.com/rexxar/api/v2/subject_collection/tv_japanese/items",
    "tv_domestic": "https://m.douban.com/rexxar/api/v2/subject_collection/tv_domestic/items",
    "tv_animation": "https://m.douban.com/rexxar/api/v2/subject_collection/tv_animation/items",
    // 🎬 电影组
    "movie_hot": "https://m.douban.com/rexxar/api/v2/subject_collection/movie_real_time_hotest/items",
    "movie_weekly": "https://m.douban.com/rexxar/api/v2/subject_collection/movie_weekly_best/items",
    "movie_top250": "https://m.douban.com/rexxar/api/v2/subject_collection/movie_top250/items",
    "movie_showing": "https://m.douban.com/rexxar/api/v2/subject_collection/movie_showing/items",
    // 🎤 综艺组
    "show_domestic": "https://m.douban.com/rexxar/api/v2/subject_collection/show_domestic/items",
    "show_foreign": "https://m.douban.com/rexxar/api/v2/subject_collection/show_foreign/items",
    // 🏆 榜单组
    "tv_global_best": "https://m.douban.com/rexxar/api/v2/subject_collection/tv_global_best_weekly/items",
    "tv_chinese_best": "https://m.douban.com/rexxar/api/v2/subject_collection/tv_chinese_best_weekly/items"
};

const GENRE_MAP = {
    28: "动作", 12: "冒险", 16: "动画", 35: "喜剧", 80: "犯罪", 99: "纪录片",
    18: "剧情", 10751: "家庭", 14: "奇幻", 36: "历史", 27: "恐怖", 10402: "音乐",
    9648: "悬疑", 10749: "爱情", 878: "科幻", 10770: "电视电影", 53: "惊悚",
    10752: "战争", 37: "西部", 10759: "动作冒险", 10765: "科幻奇幻"
};

var WidgetMetadata = {
    id: "forward.combined.makkapakka",
    title: "影视榜单Lite",
    description: "豆瓣全能推荐 | TMDB探索 | 猜你想看",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    version: "1.3.1", // 🚀 升级版本号：优化豆瓣匹配逻辑，丢弃无TMDB数据项
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",

    globalParams: [],
    modules: [
        // =================================================
        // 🟢 一级栏目 1：豆瓣 (Douban)
        // =================================================
        {
            title: "🟢 豆瓣",
            description: "剧集 / 电影 / 综艺 / 榜单",
            functionName: "loadDoubanModule",
            type: "video",
            params: [
                {
                    name: "sort_by",
                    title: "选择栏目",
                    type: "enumeration",
                    value: "tv_american",
                    enumOptions: [
                        { value: "tv_american", title: "📺 英美剧" },
                        { value: "tv_korean", title: "📺 韩剧" },
                        { value: "tv_japanese", title: "📺 日剧" },
                        { value: "tv_domestic", title: "📺 国产剧" },
                        { value: "tv_animation", title: "🌸 日本动画" },
                        { value: "movie_hot", title: "🎬 实时热门电影" },
                        { value: "movie_weekly", title: "🎬 一周口碑电影" },
                        { value: "movie_top250", title: "🎬 豆瓣 Top250" },
                        { value: "movie_showing", title: "🎬 院线热映" },
                        { value: "show_domestic", title: "🎤 国内综艺" },
                        { value: "show_foreign", title: "🎤 国外综艺" },
                        { value: "tv_global_best", title: "🏆 全球口碑剧集" },
                        { value: "tv_chinese_best", title: "🏆 华语口碑剧集" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        },
      // =================================================
        // 🗓 一级栏目：追剧日历 (Airing Calendar)
        // =================================================
        {
            title: "🗓 周更",
            description: "本周最新影视更新追踪",
            functionName: "loadCalendarModule",
            type: "video",
            params: [
                {
                    name: "dateStr",
                    title: "更新日期",
                    type: "enumeration",
                    value: "today",
                    enumOptions: [
                        { value: "today", title: "📺 今天更新" },
                        { value: "1", title: "🔹 周一 (Monday)" },
                        { value: "2", title: "🔹 周二 (Tuesday)" },
                        { value: "3", title: "🔹 周三 (Wednesday)" },
                        { value: "4", title: "🔹 周四 (Thursday)" },
                        { value: "5", title: "🔹 周五 (Friday)" },
                        { value: "6", title: "🔹 周六 (Saturday)" },
                        { value: "7", title: "🔹 周日 (Sunday)" }
                    ]
                },
                {
                    name: "showType",
                    title: "影视分类",
                    type: "enumeration",
                    value: "all",
                    enumOptions: [
                        { value: "all", title: "综合影剧" },
                        { value: "tv", title: "📺 纯净剧集" },
                        { value: "movie", title: "🎬 院线电影" },
                        { value: "anime", title: "🌸 二次元动漫" },
                        { value: "show", title: "🎤 娱乐综艺" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        },

        // =================================================
        // 🔵 一级栏目 2：TMDB (The Movie Database)
        // =================================================
        {
            title: "🔵 TMDB",
            description: "探索电影与剧集",
            functionName: "loadTMDBModule",
            type: "video",
            params: [
                {
                    name: "sort_by",
                    title: "模式", 
                    type: "enumeration", 
                    value: "movie",
                    enumOptions: [ { value: "movie", title: "🎬 电影筛选" }, { value: "tv", title: "📺 剧集筛选" } ]
                },
                {
                    name: "genre", title: "类型", type: "enumeration", value: "",
                    enumOptions: [
                        { title: "全部", value: "" },
                        { title: "动作/冒险", value: "28" }, { title: "科幻/奇幻", value: "878" },
                        { title: "剧情", value: "18" }, { title: "喜剧", value: "35" },
                        { title: "动画", value: "16" }, { title: "悬疑/犯罪", value: "9648" },
                        { title: "恐怖/惊悚", value: "27" }, { title: "爱情", value: "10749" }
                    ]
                },
                { name: "year", title: "年份", type: "input", description: "例如: 2024", value: "" },
                {
                    name: "sortBy",
                    title: "排序", 
                    type: "enumeration", 
                    value: "popularity.desc",
                    enumOptions: [
                        { title: "🔥 热度最高", value: "popularity.desc" },
                        { title: "⭐️ 评分最高", value: "vote_average.desc" },
                        { title: "🆕 最新上映", value: "primary_release_date.desc" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        }
    ]
};

// ============================================================================
// 工具函数
// ============================================================================

function safeJsonParse(data) {
    try {
        if (typeof data === 'object') return data;
        return JSON.parse(data);
    } catch (e) { return null; }
}

function getTmdbImage(path) {
    if (!path) return undefined;
    if (path.startsWith("/")) return "https://image.tmdb.org/t/p/w500" + path;
    return path;
}

function getGenreString(ids) {
    if (!ids || !ids.length) return "";
    return ids.map(function(id) { return GENRE_MAP[id]; })
              .filter(Boolean)
              .slice(0, 3) 
              .join(" / ");
}

// 🔴 新增：清洗豆瓣剧名，剥离季数等后缀提高匹配率
function cleanDoubanTitle(rawTitle) {
    if (!rawTitle) return "";
    var title = rawTitle.trim();
    // 剔除 "第一季"、"第2部"、"Season 1" 等
    title = title.replace(/第[一二三四五六七八九十百\d]+[季部]/g, '');
    title = title.replace(/season\s*\d+/ig, '');
    // 压缩多余空格
    title = title.replace(/\s+/g, ' ').trim();
    return title;
}

// ============================================================================
// 🟢 模块逻辑 1：豆瓣 (统一入口)
// ============================================================================

async function searchTmdb(title, year, apiKey, isTv) {
    if (!title) return null;
    var url = "https://api.themoviedb.org/3/search/multi?api_key=" + apiKey + "&language=zh-CN&query=" + encodeURIComponent(title);
    try {
        var res = await Widget.http.get(url);
        var data = safeJsonParse(res.data);
        if (!data || !data.results || data.results.length === 0) return null;
        
        var validItems = data.results.filter(function(item) {
            return item.media_type === 'movie' || item.media_type === 'tv';
        });
        if (validItems.length === 0) return null;

        if (year) {
            var targetYear = parseInt(year);
            var match = validItems.find(function(item) {
                var d = item.release_date || item.first_air_date || "0000";
                var y = parseInt(d.substring(0, 4));
                return Math.abs(y - targetYear) <= 1;
            });
            if (match) return match;
        }

        if (isTv) {
             var tvMatch = validItems.find(function(item) { return item.media_type === 'tv'; });
             if (tvMatch) return tvMatch;
        }
        return validItems[0];
    } catch (e) { return null; }
}

async function loadDoubanModule(params) {
    var categoryKey = params.sort_by || "tv_american";
    var url = DOUBAN_URLS[categoryKey];
    
    if (!url) return [{ title: "配置错误", subTitle: "未找到API", type: "text" }];

    var page = params.page || 1;
    var apiKey = DEFAULT_TMDB_KEY;
    var isTv = (url.indexOf("tv") > -1 || url.indexOf("show") > -1);

    var count = 20;
    var start = (page - 1) * count;
    var finalUrl = url.includes("?") ? `${url}&start=${start}&count=${count}` : `${url}?start=${start}&count=${count}`;

    try {
        var headers = { "Referer": "https://m.douban.com/", "User-Agent": UA_PC };
        var res = await Widget.http.get(finalUrl, { headers: headers });
        var data = safeJsonParse(res.data);
        
        if (!data || !data.subject_collection_items) return [{ title: "列表为空", type: "text" }];

        var items = data.subject_collection_items;
        var promises = items.map(async function(item) {
            var rawTitle = item.title;
            // 🔴 关键改动：搜索前先清洗剧名
            var cleanTitle = cleanDoubanTitle(rawTitle);
            
            var year = item.year;
            var sub = item.card_subtitle || "";
            var rate = item.rating ? item.rating.value.toFixed(1) : "0.0";
            
            var tmdbItem = await searchTmdb(cleanTitle, year, apiKey, isTv);

            // 🔴 关键改动：如果匹配成功则返回数据，匹配失败则直接丢弃 (返回 null)
            if (tmdbItem) {
                var dateStr = tmdbItem.release_date || tmdbItem.first_air_date || (year + "");
                var yearStr = dateStr.substring(0, 4);
                var genreStr = getGenreString(tmdbItem.genre_ids);
                var finalGenreTitle = genreStr || (isTv ? "剧集" : "电影");

                return {
                    id: String(tmdbItem.id),
                    tmdbId: tmdbItem.id,
                    type: "tmdb",
                    mediaType: tmdbItem.media_type,
                    title: tmdbItem.title || tmdbItem.name || rawTitle, // 界面显示依然保留原始名或TMDB名
                    
                    genreTitle: finalGenreTitle, 
                    subTitle: dateStr ? `⭐ ${rate} | ${dateStr}` : `⭐ ${rate}`,
                    description: dateStr ? `${dateStr} · ⭐ ${rate}\n${item.info || tmdbItem.overview || "暂无简介"}` : (item.info || tmdbItem.overview),
                    
                    posterPath: getTmdbImage(tmdbItem.poster_path),
                    backdropPath: getTmdbImage(tmdbItem.backdrop_path),
                    rating: parseFloat(rate) || tmdbItem.vote_average,
                    releaseDate: dateStr,
                    year: yearStr
                };
            }
            
            return null; // 搜不到直接抛弃
        });
        
        var results = await Promise.all(promises);
        
        // 🔴 关键改动：过滤掉所有 null 的数据，不给客户端返回
        var finalResults = results.filter(function(r) { return r !== null; });
        
        if (finalResults.length === 0) return [{ title: "数据为空", subTitle: "本页无匹配TMDB的数据", type: "text" }];
        
        return finalResults;
        
    } catch (e) { return [{ title: "错误", subTitle: e.message, type: "text" }]; }
}

// ============================================================================
// 🔵 模块逻辑 2：TMDB (统一入口)
// ============================================================================

function buildTmdbItem(item, mediaType) {
    var title = item.title || item.name;
    var dateStr = item.release_date || item.first_air_date || "";
    var yearStr = dateStr.substring(0, 4);
    var vote = item.vote_average ? item.vote_average.toFixed(1) : "0.0";
    var genreNames = getGenreString(item.genre_ids);

    return {
        id: String(item.id),
        tmdbId: item.id,
        type: "tmdb",
        mediaType: mediaType,
        title: title,
        
        genreTitle: genreNames || (mediaType === "tv" ? "剧集" : "电影"),
        subTitle: dateStr ? `⭐ ${vote} | ${dateStr}` : `⭐ ${vote}`,
        description: dateStr ? `${dateStr} · ⭐ ${vote}\n${item.overview || "暂无简介"}` : (item.overview || ""),
        
        posterPath: getTmdbImage(item.poster_path),
        backdropPath: getTmdbImage(item.backdrop_path),
        releaseDate: dateStr,
        year: yearStr,
        rating: item.vote_average
    };
}

async function loadTMDBModule(params) {
    var mode = params.sort_by || "movie"; 
    var page = params.page || 1;
    var sortMethod = params.sortBy || "popularity.desc"; 
    
    var queryParams = {
        api_key: DEFAULT_TMDB_KEY,
        language: "zh-CN",
        page: page,
        sort_by: sortMethod,
        include_adult: false
    };

    if (params.genre) queryParams.with_genres = params.genre;
    if (params.year) {
        if (mode === "movie") queryParams.primary_release_year = params.year;
        else queryParams.first_air_date_year = params.year;
    }
    if (sortMethod && sortMethod.includes("vote_average")) queryParams["vote_count.gte"] = 100;

    var endpoint = (mode === "movie") ? "/discover/movie" : "/discover/tv";
    var baseUrl = "https://api.themoviedb.org/3";

    try {
        var queryString = Object.keys(queryParams).map(k => k + '=' + queryParams[k]).join('&');
        var res = await Widget.http.get(`${baseUrl}${endpoint}?${queryString}`);
        var data = safeJsonParse(res.data);
        var items = (data && data.results) ? data.results : [];
        return items.map(function(item) { return buildTmdbItem(item, mode); });
    } catch (e) { return []; }
}
// ============================================================================
// 🗓 模块逻辑：追剧日历 (实时计算本周更新)
// ============================================================================

async function loadCalendarModule(params) {
    var dateChoice = params.dateStr || "today";
    var showType = params.showType || "all";
    var page = params.page || 1;
    
    // 📅 核心黑科技 1：实时计算目标日期 (算出本周一到周日的具体是哪一天 YYYY-MM-DD)
    var targetDate = new Date();
    if (dateChoice !== "today") {
        var currentDay = targetDate.getDay(); 
        var currentIsoDay = currentDay === 0 ? 7 : currentDay; // 强制转换：周日从 0 变成 7
        var targetIsoDay = parseInt(dateChoice); // 获取下拉框里选择的 1 ~ 7
        var diffDays = targetIsoDay - currentIsoDay; // 算出相差的天数
        targetDate.setDate(targetDate.getDate() + diffDays);
    }
    
    var year = targetDate.getFullYear();
    var month = ("0" + (targetDate.getMonth() + 1)).slice(-2);
    var day = ("0" + targetDate.getDate()).slice(-2);
    var exactDateStr = year + "-" + month + "-" + day; // 最终得到比如 2024-05-20
    
    // 🌐 核心黑科技 2：拿着精准日期，去 TMDB “点杀”获取当天的影视
    var baseUrl = "https://api.themoviedb.org/3/discover";
    var commonParams = `api_key=${DEFAULT_TMDB_KEY}&language=zh-CN&page=${page}&sort_by=popularity.desc`;
    var rawResults = [];

    try {
        // 📺 抓取剧集类 (包含 TV、动漫、综艺)
        if (showType === 'tv' || showType === 'anime' || showType === 'show' || showType === 'all') {
            var tvUrl = `${baseUrl}/tv?${commonParams}&air_date.gte=${exactDateStr}&air_date.lte=${exactDateStr}`;
            
            // 精准过滤流派 (剔除动漫和综艺，让剧集更纯粹)
            if (showType === 'anime') tvUrl += "&with_genres=16";
            if (showType === 'show') tvUrl += "&with_genres=10764";
            if (showType === 'tv' || showType === 'all') tvUrl += "&without_genres=16,10764"; 

            var resTv = await Widget.http.get(tvUrl);
            var dataTv = safeJsonParse(resTv.data);
            if (dataTv && dataTv.results) {
                // 打上 media_type 标签，方便后续构建
                dataTv.results.forEach(item => { item.media_type = 'tv'; rawResults.push(item); });
            }
        }

        // 🎬 抓取电影类 (电影的日期字段和剧集不一样，是 primary_release_date)
        if (showType === 'movie' || showType === 'all') {
            var movieUrl = `${baseUrl}/movie?${commonParams}&primary_release_date.gte=${exactDateStr}&primary_release_date.lte=${exactDateStr}`;
            var resMovie = await Widget.http.get(movieUrl);
            var dataMovie = safeJsonParse(resMovie.data);
            if (dataMovie && dataMovie.results) {
                dataMovie.results.forEach(item => { item.media_type = 'movie'; rawResults.push(item); });
            }
        }

        // 🌟 将结果按 TMDB 的流行度 (Popularity) 从高到低排序，避免好剧被烂剧挤下去
        rawResults.sort(function(a, b) {
            return (b.popularity || 0) - (a.popularity || 0);
        });

        if (rawResults.length === 0) {
            return [{ title: "今日无更新", subTitle: "去别的日子看看吧", type: "text" }];
        }

        // 最终通过现有的 buildTmdbItem 渲染成卡片
        return rawResults.map(function(item) {
            return buildTmdbItem(item, item.media_type);
        });

    } catch (e) {
        return [{ title: "错误", subTitle: e.message, type: "text" }];
    }
}
