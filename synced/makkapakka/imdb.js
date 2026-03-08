WidgetMetadata = {
    id: "imdb_cn_fix_",
    title: "IMDb热榜",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    description: "IMDb全球榜单，支持日/周维度切换。",
    version: "1.0.5", // 🚀 升级版本号：将榜单类型移至右上角快捷菜单
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",
    globalParams: [],
    modules: [
        {
            title: "🔥 影视榜单",
            functionName: "loadImdbList",
            type: "video", // 升级为 video 排版模式，保持 UI 统一
            cacheDuration: 3600,
            params: [
                {
                    name: "sort_by", // 👈 魔法字段：把 category 改为 sort_by 触发右上角菜单
                    title: "榜单类型",
                    type: "enumeration",
                    value: "trending_week",
                    enumOptions: [
                        { title: "📅 本周热榜 (Trending Week)", value: "trending_week" },
                        { title: "🔥 今日热榜 (Trending Day)", value: "trending_day" },
                        { title: "🌊 流行趋势 (Popular)", value: "popular" },
                        { title: "💎 高分神作 (Top Rated)", value: "top_rated" },
                        { title: "🇨🇳 国产剧热度 (模拟云合)", value: "china_tv" },
                        { title: "🇨🇳 国产电影热度 (模拟)", value: "china_movie" }
                    ]
                },
                {
                    name: "mediaType",
                    title: "范围 (仅全球榜有效)",
                    type: "enumeration",
                    value: "all",
                    // 👇 联动依赖名同步修改为 sort_by
                    belongTo: { paramName: "sort_by", value: ["trending_week", "trending_day", "popular", "top_rated"] },
                    enumOptions: [
                        { title: "全部 (剧集+电影)", value: "all" },
                        { title: "电影", value: "movie" },
                        { title: "剧集", value: "tv" }
                    ]
                },
                { name: "page", title: "页码", type: "page" }
            ]
        }
    ]
};

// ================= 逻辑部分 =================

const GENRE_MAP = {
    28: "动作", 12: "冒险", 16: "动画", 35: "喜剧", 80: "犯罪", 99: "纪录片",
    18: "剧情", 10751: "家庭", 14: "奇幻", 36: "历史", 27: "恐怖", 10402: "音乐",
    9648: "悬疑", 10749: "爱情", 878: "科幻", 10770: "电视电影", 53: "惊悚",
    10752: "战争", 37: "西部", 10759: "动作冒险", 10762: "儿童", 10763: "新闻",
    10764: "真人秀", 10765: "科幻奇幻", 10766: "肥皂剧", 10767: "脱口秀", 10768: "战争政治"
};

function getGenreText(ids) {
    if (!ids || !Array.isArray(ids)) return "";
    return ids.map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 3).join(" / ");
}

function buildItem(item, forceType) {
    if (!item) return null;
    const type = forceType || item.media_type || (item.title ? "movie" : "tv");
    const title = item.title || item.name;
    const fullDate = item.release_date || item.first_air_date || ""; // 提取完整日期
    const year = fullDate.substring(0, 4);
    const score = item.vote_average ? item.vote_average.toFixed(1) : "0.0";
    const genre = getGenreText(item.genre_ids);

    return {
        id: String(item.id),
        tmdbId: parseInt(item.id),
        type: "tmdb",
        mediaType: type,
        title: title,
        
        // 横竖版适配：将完整日期拼接到副标题或简介位置
        subTitle: fullDate ? `⭐ ${score} | ${fullDate}` : `⭐ ${score}`,
        description: fullDate ? `${fullDate} · ⭐ ${score}\n${item.overview || "暂无简介"}` : item.overview,
        
        // 传递给内核，提取横版年份
        releaseDate: fullDate,
        
        posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
        backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : "",
        rating: parseFloat(score) || 0,
        year: year,
        genreTitle: genre || (type === "tv" ? "剧集" : "电影") // 优化横版类型显示
    };
}

async function loadImdbList(params) {
    // 👈 逻辑接管：从 sort_by 获取分类，如果没有则默认取 trending_week
    const category = params.sort_by || "trending_week";
    const mediaType = params.mediaType || "all";
    const page = params.page || 1;

    try {
        let items = [];

        // --- 1. 国产热度 (模拟) ---
        if (category.startsWith("china_")) {
            const isTv = category === "china_tv";
            const endpoint = isTv ? "tv" : "movie";
            const res = await Widget.tmdb.get(`/discover/${endpoint}`, {
                params: {
                    language: "zh-CN",
                    page: page,
                    sort_by: "popularity.desc",
                    with_original_language: "zh",
                    "vote_count.gte": 2 // 稍微放宽限制
                }
            });
            items = (res.results || []).map(i => buildItem(i, endpoint));
            return items;
        }

        // --- 2. 全球榜单 (Trending / Popular / Top Rated) ---
        
        // 2.1 实时热度 (Day / Week)
        if (category.startsWith("trending_")) {
            const timeWindow = category === "trending_day" ? "day" : "week";
            const res = await Widget.tmdb.get(`/trending/${mediaType}/${timeWindow}`, { 
                params: { language: "zh-CN", page: page } 
            });
            items = (res.results || []).map(i => buildItem(i));
        } 
        
        // 2.2 流行 & 高分 (混合处理)
        else {
            if (mediaType === "all") {
                const [resM, resT] = await Promise.all([
                    Widget.tmdb.get(`/movie/${category}`, { params: { language: "zh-CN", page: page } }),
                    Widget.tmdb.get(`/tv/${category}`, { params: { language: "zh-CN", page: page } })
                ]);
                const movies = (resM.results || []).map(i => buildItem(i, "movie"));
                const tvs = (resT.results || []).map(i => buildItem(i, "tv"));
                
                // 混合排序
                items = [...movies, ...tvs].sort((a, b) => {
                    if (category === "top_rated") return parseFloat(b.rating) - parseFloat(a.rating);
                    return 0; // Popular 本身没有统一标准值，简单合并
                }).slice(0, 20);
            } else {
                const res = await Widget.tmdb.get(`/${mediaType}/${category}`, { 
                    params: { language: "zh-CN", page: page } 
                });
                items = (res.results || []).map(i => buildItem(i, mediaType));
            }
        }

        return items;

    } catch (e) {
        return [{
            id: "error",
            type: "text",
            title: "加载异常",
            description: "网络波动，请下拉刷新"
        }];
    }
}
