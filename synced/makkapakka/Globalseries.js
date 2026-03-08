/**
 * 全球万能影视专区
 * 核心逻辑: 利用 TMDB discover 接口，动态切换制片国家/地区和语言
 * 支持：大陆、港台、欧美、日韩、拉美等十几个国家地区的影剧分类与混合排序
 */

WidgetMetadata = {
    id: "global_series_makka",
    title: "全球影视专区",
    description: "自由切换全球十几个国家与地区，探索纯正的本土电影与剧集",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    version: "2.1.1", // 🚀 修复：精准绑定 sort_by 触发右上角下拉菜单
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",
    modules: [
        // ================= 模块 1：全球探索发现 =================
        {
            title: "🌍 全球探索发现",
            functionName: "loadGlobalList",
            type: "video", // 保留你需要的自适应排版
            cacheDuration: 3600,
            params: [
                {
                    name: "region",
                    title: "选择国家/地区",
                    type: "enumeration",
                    value: "CN",
                    enumOptions: [
                        { title: "🇨🇳 大陆 (Mainland China)", value: "CN" },
                        { title: "🇭🇰 香港 (Hong Kong)", value: "HK" },
                        { title: "🇹🇼 台湾 (Taiwan)", value: "TW" },
                        { title: "🇺🇸 美国 (United States)", value: "US" },
                        { title: "🇬🇧 英国 (United Kingdom)", value: "GB" },
                        { title: "🇯🇵 日本 (Japan)", value: "JP" },
                        { title: "🇰🇷 韩国 (South Korea)", value: "KR" },
                        { title: "🇪🇺 欧洲综合 (法/德/意/荷)", value: "EU" },
                        { title: "💃 西语世界 (西班牙/拉美)", value: "ES_LANG" },
                        { title: "🇲🇽 墨西哥 (Mexico)", value: "MX" },
                        { title: "🇸🇪 瑞典 (Sweden)", value: "SE" },
                        { title: "🇮🇳 印度 (India)", value: "IN" },
                        { title: "🇹🇭 泰国 (Thailand)", value: "TH" }
                    ]
                },
                {
                    name: "mediaType",
                    title: "影视类型",
                    type: "enumeration",
                    value: "all",
                    enumOptions: [
                        { title: "🌟 全部 (影+剧混合)", value: "all" },
                        { title: "🎬 仅看电影 (Movie)", value: "movie" },
                        { title: "📺 仅看剧集 (TV)", value: "tv" }
                    ]
                },
                {
                    // 👉 关键修复：改为 sort_by
                    name: "sort_by",
                    title: "排序榜单",
                    type: "enumeration",
                    value: "hot",
                    enumOptions: [
                        { title: "🔥 近期热播榜", value: "hot" },
                        { title: "🆕 最新上线榜", value: "new" },
                        { title: "🏆 历史高分榜", value: "top" }
                    ]
                },
                { name: "page", title: "页码", type: "page", startPage: 1 }
            ]
        },
        // ================= 模块 2：高级类型榜单 =================
        {
            title: "🏷️ 高级类型榜单",
            functionName: "loadGenreRank",
            type: "video", // 保留你需要的自适应排版
            cacheDuration: 3600,
            params: [
                {
                    name: "mediaType",
                    title: "影视类型",
                    type: "enumeration",
                    value: "movie",
                    enumOptions: [
                        { title: "🎬 电影 (Movie)", value: "movie" },
                        { title: "📺 电视剧 (TV)", value: "tv" }
                    ]
                },
                {
                    name: "genre",
                    title: "题材流派",
                    type: "enumeration",
                    value: "scifi",
                    enumOptions: [
                        { title: "🛸 科幻 (Sci-Fi)", value: "scifi" },
                        { title: "🔍 悬疑 (Mystery)", value: "mystery" },
                        { title: "👻 恐怖 (Horror)", value: "horror" },
                        { title: "🔪 犯罪 (Crime)", value: "crime" },
                        { title: "💥 动作 (Action)", value: "action" },
                        { title: "😂 喜剧 (Comedy)", value: "comedy" },
                        { title: "❤️ 爱情 (Romance)", value: "romance" },
                        { title: "🎭 剧情 (Drama)", value: "drama" },
                        { title: "🐉 奇幻 (Fantasy)", value: "fantasy" },
                        { title: "🎨 动画 (Animation)", value: "animation" },
                        { title: "🎥 纪录片 (Documentary)", value: "documentary" }
                    ]
                },
                {
                    name: "region",
                    title: "国家/地区",
                    type: "enumeration",
                    value: "all",
                    enumOptions: [
                        { title: "🌍 全球 (所有国家)", value: "all" },
                        { title: "🇨🇳 中国大陆", value: "cn" },
                        { title: "🇭🇰 中国香港", value: "hk" },
                        { title: "🇹🇼 中国台湾", value: "tw" },
                        { title: "🏮 港台 (香港+台湾)", value: "hktw" },
                        { title: "🇯🇵 日本", value: "jp" },
                        { title: "🇰🇷 韩国", value: "kr" },
                        { title: "🌸 日韩合集", value: "jpkr" },
                        { title: "🇹🇭 泰国", value: "th" },
                        { title: "🇸🇬 新加坡", value: "sg" },
                        { title: "🇲🇾 马来西亚", value: "my" },
                        { title: "🇮🇳 印度", value: "in" },
                        { title: "🌏 亚太大区", value: "apac" },
                        { title: "🇺🇸 美国", value: "us" },
                        { title: "🇬🇧 英国", value: "gb" },
                        { title: "🇩🇪 德国", value: "de" },
                        { title: "🇸🇪 瑞典", value: "se" },
                        { title: "🇪🇺 欧洲全境", value: "europe" },
                        { title: "🇪🇸 西班牙", value: "es" },
                        { title: "🇲🇽 墨西哥", value: "mx" },
                        { title: "💃 西语/拉丁美洲", value: "latin" }
                    ]
                },
                {
                    // 👉 关键修复：改为 sort_by
                    name: "sort_by",
                    title: "排序规则",
                    type: "enumeration",
                    value: "popularity",
                    enumOptions: [
                        { title: "🔥 热门趋势", value: "popularity" },
                        { title: "⭐ 评分最高", value: "rating" },
                        { title: "📅 最新上线", value: "time" }
                    ]
                },
                { name: "page", title: "页码", type: "page", startPage: 1 }
            ]
        }
    ]
};

// =========================================================================
// 2. 模块 1 专属逻辑 (全球探索发现)
// =========================================================================

const GLOBAL_GENRE_MAP = {
    28: "动作", 12: "冒险", 16: "动画", 35: "喜剧", 80: "犯罪", 99: "纪录片",
    18: "剧情", 10751: "家庭", 14: "奇幻", 36: "历史", 27: "恐怖", 10402: "音乐",
    9648: "悬疑", 10749: "爱情", 878: "科幻", 10770: "电视电影", 53: "惊悚",
    10752: "战争", 37: "西部", 10759: "动作冒险"
};

function getGenreText(ids) {
    if (!ids || !Array.isArray(ids)) return "";
    return ids.map(id => GLOBAL_GENRE_MAP[id]).filter(Boolean).slice(0, 3).join(" / ");
}

function buildItem(item, forceMediaType) {
    if (!item) return null;
    
    const mediaType = forceMediaType || item.media_type || (item.title ? "movie" : "tv");
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date || "";
    const score = item.vote_average ? item.vote_average.toFixed(1) : "暂无";
    const genreText = getGenreText(item.genre_ids) || "影视";
    
    const typeTag = mediaType === "movie" ? "🎬电影" : "📺剧集";

    return {
        id: String(item.id),
        tmdbId: parseInt(item.id),
        type: "tmdb", 
        mediaType: mediaType,
        title: title,
        releaseDate: releaseDate, 
        genreTitle: genreText,    
        subTitle: "",            
        posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "", 
        backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : "", 
        description: `${typeTag} | ⭐ ${score}\n${item.overview || "暂无简介"}`,
        rating: item.vote_average || 0,
        _popularity: item.popularity || 0,
        _date: releaseDate || "1970-01-01"
    };
}

async function fetchFromTmdb(endpoint, sort_by, page, regionKey) { // 👉 改为 sort_by
    const today = new Date().toISOString().split('T')[0];
    
    let queryParams = {
        language: "zh-CN",
        page: page
    };

    if (regionKey === "ES_LANG") {
        queryParams.with_original_language = "es";
    } else if (regionKey === "EU") {
        queryParams.with_origin_country = "FR|DE|IT|NL|DK|NO|FI"; 
    } else {
        queryParams.with_origin_country = regionKey;
    }

    const isMovie = endpoint.includes("movie");

    if (sort_by === "hot") { // 👉 改为 sort_by
        queryParams.sort_by = "popularity.desc";
        queryParams["vote_count.gte"] = 5; 
    } 
    else if (sort_by === "new") { // 👉 改为 sort_by
        queryParams.sort_by = isMovie ? "primary_release_date.desc" : "first_air_date.desc";
        if (isMovie) {
            queryParams["primary_release_date.lte"] = today;
        } else {
            queryParams["first_air_date.lte"] = today;
        }
        queryParams["vote_count.gte"] = 1;
    } 
    else if (sort_by === "top") { // 👉 改为 sort_by
        queryParams.sort_by = "vote_average.desc";
        queryParams["vote_count.gte"] = isMovie ? 50 : 20; 
    }

    const res = await Widget.tmdb.get(endpoint, { params: queryParams });
    const mediaType = isMovie ? "movie" : "tv";
    return (res.results || []).map(i => buildItem(i, mediaType)).filter(Boolean);
}

async function loadGlobalList(params) {
    const region = params.region || "CN";
    const mediaType = params.mediaType || "all";
    const sort_by = params.sort_by || "hot"; // 👉 改为 sort_by
    const page = parseInt(params.page) || 1;

    try {
        let items = [];

        if (mediaType === "all") {
            const [movies, tvs] = await Promise.all([
                fetchFromTmdb("/discover/movie", sort_by, page, region),
                fetchFromTmdb("/discover/tv", sort_by, page, region)
            ]);
            
            items = [...movies, ...tvs];

            items.sort((a, b) => {
                if (sort_by === "hot") { // 👉 改为 sort_by
                    return b._popularity - a._popularity; 
                } else if (sort_by === "new") { // 👉 改为 sort_by
                    return new Date(b._date) - new Date(a._date); 
                } else if (sort_by === "top") { // 👉 改为 sort_by
                    return b.rating - a.rating; 
                }
                return 0;
            });
            
            items = items.slice(0, 20);

        } else {
            const endpoint = mediaType === "movie" ? "/discover/movie" : "/discover/tv";
            items = await fetchFromTmdb(endpoint, sort_by, page, region);
        }

        if (items.length === 0) {
             return page === 1 ? [{ id: "empty", type: "text", title: "无数据", description: "该区域下暂无满足条件的影片" }] : [];
        }

        return items;

    } catch (error) {
        console.error("数据请求异常:", error);
        return [{ id: "error", type: "text", title: "网络异常", description: "请下拉刷新重试" }];
    }
}

// =========================================================================
// 3. 模块 2 专属逻辑 (高级类型榜单)
// =========================================================================

const ADVANCED_GENRE_MAP = {
    "scifi": { movie: "878", tv: "10765" },       
    "mystery": { movie: "9648", tv: "9648" },
    "horror": { movie: "27", tv: "27" },          
    "crime": { movie: "80", tv: "80" },
    "action": { movie: "28", tv: "10759" },       
    "comedy": { movie: "35", tv: "35" },
    "romance": { movie: "10749", tv: "10749" },   
    "drama": { movie: "18", tv: "18" },
    "fantasy": { movie: "14", tv: "10765" },      
    "animation": { movie: "16", tv: "16" },
    "documentary": { movie: "99", tv: "99" }
};

const REGION_MAP = {
    "all": "",
    "cn": "CN",
    "hk": "HK",
    "tw": "TW",
    "hktw": "HK|TW",
    "jp": "JP",
    "kr": "KR",
    "jpkr": "JP|KR",
    "th": "TH",
    "sg": "SG",
    "my": "MY",
    "in": "IN",
    "apac": "CN|HK|TW|JP|KR|TH|SG|MY|IN",
    "us": "US",
    "gb": "GB",
    "de": "DE",
    "se": "SE",
    "europe": "GB|DE|FR|IT|ES|SE|NO|DK|FI|NL|BE|CH|AT|IE",
    "es": "ES",
    "mx": "MX",
    "latin": "ES|MX|AR|CO|CL|PE|VE"
};

async function loadGenreRank(params = {}) {
    const page = parseInt(params.page) || 1;
    console.log(`[GenreHub] 正在请求高级类型榜单 第 ${page} 页...`);

    // 👉 关键修复：改为 sort_by = "popularity"
    const { mediaType = "movie", genre = "scifi", region = "all", sort_by = "popularity" } = params;

    const genreId = ADVANCED_GENRE_MAP[genre] ? ADVANCED_GENRE_MAP[genre][mediaType] : "";
    const originCountry = REGION_MAP[region] || "";

    let tmdbSortBy = "popularity.desc";
    if (sort_by === "rating") { // 👉 改为 sort_by
        tmdbSortBy = "vote_average.desc";
    } else if (sort_by === "time") { // 👉 改为 sort_by
        tmdbSortBy = mediaType === "movie" ? "primary_release_date.desc" : "first_air_date.desc";
    }

    const queryParams = {
        language: "zh-CN",
        page: page,
        sort_by: tmdbSortBy,
        include_adult: false,
        include_video: false
    };

    if (genreId) queryParams.with_genres = genreId;
    if (originCountry) queryParams.with_origin_country = originCountry;

    if (sort_by === "rating") { // 👉 改为 sort_by
        queryParams["vote_count.gte"] = 200; 
    } else {
        queryParams["vote_count.gte"] = 10; 
    }

    if (sort_by === "time") { // 👉 改为 sort_by
        const today = new Date();
        today.setMonth(today.getMonth() + 1);
        const maxDate = today.toISOString().split('T')[0];
        
        if (mediaType === "movie") {
            queryParams["primary_release_date.lte"] = maxDate;
        } else {
            queryParams["first_air_date.lte"] = maxDate;
        }
    }

    try {
        const res = await Widget.tmdb.get(`/discover/${mediaType}`, { params: queryParams });
        const items = res.results || [];

        if (items.length === 0) {
            return page === 1 ? [{ id: "empty", type: "text", title: "未找到符合条件的影视", description: "请尝试更换国家或类型" }] : [];
        }

        return items.map(item => {
            const date = item.release_date || item.first_air_date || "";
            const year = date ? date.substring(0, 4) : "未知";
            const score = item.vote_average ? item.vote_average.toFixed(1) : "暂无评分";
            
            return {
                id: String(item.id),
                tmdbId: parseInt(item.id),
                type: "tmdb",
                mediaType: mediaType,
                title: item.title || item.name,
                subTitle: `⭐ ${score} | ${year}`,
                description: `${date} · ⭐ ${score}\n${item.overview || "暂无简介"}`,
                releaseDate: date,
                year: year,
                posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
                backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : "",
                rating: parseFloat(score) || 0
            };
        });

    } catch (error) {
        console.error("加载榜单失败:", error);
        return [{ id: "err", type: "text", title: "加载失败", description: "网络连接异常，请重试" }];
    }
}
