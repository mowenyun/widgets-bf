WidgetMetadata = {
    id: "tmdb_upcoming_center_makka",
    title: "即将上映与热映榜",
    description: "追踪院线即将上映的电影与最新剧集，热度显示，不错过任何一部大片",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    version: "1.0.1", // 增加了横竖版年份日期与类型适配
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",
    modules: [
        {
            title: "🎬 新片追踪",
            functionName: "loadUpcoming",
            type: "list", // 可随时切换为 video 测试竖版
            cacheDuration: 3600, // 缓存1小时
            params: [
                {
                    name: "category",
                    title: "选择频道",
                    type: "enumeration",
                    value: "movie_upcoming",
                    enumOptions: [
                        { title: "🍿 即将上映 (期待榜)", value: "movie_upcoming" },
                        { title: "🔥 正在热映 (院线)", value: "movie_now_playing" },
                        { title: "📺 近期开播 (新剧集)", value: "tv_on_the_air" },
                        { title: "📅 今日首播 (追更)", value: "tv_airing_today" }
                    ]
                },
                { name: "page", title: "页码", type: "page", startPage: 1 }
            ]
        }
    ]
};

// ================= 辅助字典 =================

// TMDB 类型字典映射
const GENRE_MAP = {
    10759: "动作冒险", 16: "动画", 35: "喜剧", 80: "犯罪", 99: "纪录片",
    18: "剧情", 10751: "家庭", 10762: "儿童", 9648: "悬疑", 10763: "新闻",
    10764: "真人秀", 10765: "科幻", 10766: "肥皂剧", 10767: "脱口秀",
    10768: "政治", 37: "西部", 28: "动作", 12: "冒险", 14: "奇幻", 
    878: "科幻", 27: "恐怖", 10749: "爱情", 53: "惊悚", 10752: "战争"
};

// 提取首个类型名称
function getGenreText(ids) {
    if (!ids || !Array.isArray(ids)) return "影视";
    return ids.map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 1).join("") || "影视";
}


// ================= 逻辑处理部分 =================

// 数据格式化函数，包含倒计时计算魔法
function buildItem(item, mediaType) {
    if (!item) return null;
    
    // 兼容电影和剧集的标题与日期字段
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date || "";
    const yearStr = releaseDate ? releaseDate.substring(0, 4) : "";
    
    // 获取类型文本 (如: 科幻)
    const genreText = getGenreText(item.genre_ids);
    
    // 计算上映倒计时
    let dateLabel = `📅 ${releaseDate}`;
    if (releaseDate) {
        const today = new Date();
        // 抹平时间差，只对比日期
        today.setHours(0, 0, 0, 0); 
        const rDate = new Date(releaseDate);
        rDate.setHours(0, 0, 0, 0);
        
        const diffTime = rDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            dateLabel = `⏳ 还有 ${diffDays} 天上映 (${releaseDate})`;
        } else if (diffDays === 0) {
            dateLabel = `🔥 今天首映! (${releaseDate})`;
        } else {
            dateLabel = `✅ 已上映 (${releaseDate})`;
        }
    }

    const score = item.vote_average ? item.vote_average.toFixed(1) : "暂无";
    const popularity = item.popularity ? Math.round(item.popularity) : 0;

    // ✨ 构建副标题：科幻 热度:213 （横版 Forward 会自动在前面拼接 年份 • ）
    const displaySubtitle = `${genreText} 热度:${popularity}`;

    return {
        id: String(item.id),
        tmdbId: parseInt(item.id),
        type: "tmdb", // FW 核心：调起原生页面获取预告片
        mediaType: mediaType,
        title: title,
        
        // 渲染给横版列表的副标题
        genreTitle: displaySubtitle, 
        subTitle: displaySubtitle,
        
        coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
        posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "", // 兼容标准字段
        backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : "",
        
        // 将原先的倒计时魔法和评分放进简介，不丢失信息！
        description: `${dateLabel} | ⭐ 评分: ${score}\n${item.overview || "这部影片目前还没有中文简介，敬请期待！"}`,
        rating: item.vote_average || 0,
        
        // ✨ 新增的核心字段，负责点亮横竖版的时间显示
        year: yearStr,           // 负责横版榜单的最前面年份："2025"
        releaseDate: releaseDate // 负责竖版海报下方的完整日期："2025-05-12"
    };
}

// 主请求函数
async function loadUpcoming(params) {
    const category = params.category || "movie_upcoming";
    const page = params.page || 1;

    let endpoint = "";
    let mediaType = "movie";

    // 路由匹配
    if (category === "movie_upcoming") {
        endpoint = "/movie/upcoming";
    } else if (category === "movie_now_playing") {
        endpoint = "/movie/now_playing";
    } else if (category === "tv_on_the_air") {
        endpoint = "/tv/on_the_air";
        mediaType = "tv";
    } else if (category === "tv_airing_today") {
        endpoint = "/tv/airing_today";
        mediaType = "tv";
    }

    try {
        const queryParams = { 
            language: "zh-CN", 
            page: page,
            region: "US" // 加入 region 参数，保证上映时间的准确性（好莱坞大片以北美时间为主）
        };

        const res = await Widget.tmdb.get(endpoint, { params: queryParams });
        const items = (res.results || []).map(i => buildItem(i, mediaType)).filter(Boolean);
        
        return items;

    } catch (error) {
        console.error("请求失败:", error);
        return [{
            id: "error",
            type: "text",
            title: "加载失败",
            description: "获取最新上映数据失败，请下拉刷新或检查网络"
        }];
    }
}
