WidgetMetadata = {
  id: "makka.platform.originals",
  title: "流媒体·独家原创Pro（更新时间版）",
  author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
  description: "各平台独播剧，支持右上角快捷切换出品平台。",
  version: "1.1.0", // 🚀 升级版本号：加入右上角平台切换菜单
  requiredVersion: "0.0.1",
  site: "https://t.me/MakkaPakkaOvO",
  modules: [
    {
      title: "独家原创 & 追更日历",
      functionName: "loadPlatformOriginals",
      type: "video", // 可随意改为 list 横版
      requiresWebView: false,
      params: [
        // 1. 平台选择 (已修改为右上角触发)
        {
          name: "sort_by", // 👈 核心修改：将 network 改为 sort_by 触发右上角菜单
          title: "出品平台",
          type: "enumeration",
          value: "213",
          enumOptions: [
            { title: "Netflix (网飞)", value: "213" },
            { title: "HBO (Max)", value: "49" },
            { title: "Apple TV+", value: "2552" },
            { title: "Disney+", value: "2739" },
            { title: "Amazon Prime", value: "1024" },
            { title: "Hulu", value: "453" },
            { title: "Peacock", value: "3353" },
            { title: "Paramount+", value: "4330" },
            { title: "腾讯视频", value: "2007" },
            { title: "爱奇艺", value: "1330" },
            { title: "Bilibili (B站)", value: "1605" },
            { title: "优酷视频", value: "1419" },
            { title: "芒果TV", value: "1631" },
            { title: "TVING (韩)", value: "4096" }
          ],
        },
        // 2. 内容类型
        {
          name: "contentType",
          title: "内容类型",
          type: "enumeration",
          value: "tv",
          enumOptions: [
            { title: "📺 剧集 (默认)", value: "tv" },
            { title: "🎬 电影", value: "movie" },
            { title: "🌸 动漫/动画", value: "anime" },
            { title: "🎤 综艺/真人秀", value: "variety" }
          ]
        },
        // 3. 排序与功能
        {
          name: "sortBy", // 这里保持 camelCase，不会与上面的 sort_by 冲突
          title: "排序与功能",
          type: "enumeration",
          value: "popularity.desc",
          enumOptions: [
            { title: "🔥 综合热度", value: "popularity.desc" },
            { title: "⭐ 最高评分", value: "vote_average.desc" },
            { title: "🆕 最新首播", value: "first_air_date.desc" },
            { title: "📅 按更新时间 (追更模式)", value: "next_episode" },
            { title: "📆 今日播出 (每日榜单)", value: "daily_airing" }
          ],
        },
        // 4. 页码
        {
          name: "page",
          title: "页码",
          type: "page"
        }
      ],
    },
  ],
};

// ==========================================
// 题材映射表
// ==========================================
const GENRE_MAP = {
    10759: "动作冒险", 16: "动画", 35: "喜剧", 80: "犯罪", 99: "纪录片",
    18: "剧情", 10751: "家庭", 10762: "儿童", 9648: "悬疑", 10763: "新闻",
    10764: "真人秀", 10765: "科幻", 10766: "肥皂剧", 10767: "脱口秀",
    10768: "政治", 37: "西部", 28: "动作", 12: "冒险", 14: "奇幻", 
    878: "科幻", 27: "恐怖", 10749: "爱情", 53: "惊悚", 10752: "战争"
};

// ==========================================
// 工具函数
// ==========================================

function formatShortDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${m}-${d}`;
}

function getGenreName(ids) {
    if (!ids || ids.length === 0) return "";
    return GENRE_MAP[ids[0]] || "";
}

// ==========================================
// 主逻辑
// ==========================================

async function loadPlatformOriginals(params) {
  // 👈 逻辑接管：从 sort_by 获取出品平台 ID
  const networkId = params.sort_by || "213";
  const contentType = params.contentType || "tv";
  const sortBy = params.sortBy || "popularity.desc";
  const page = params.page || 1;

  let endpoint = "/discover/tv";
  let queryParams = {
      with_networks: networkId,
      language: "zh-CN",
      include_null_first_air_dates: false,
      page: page
  };

  if (contentType === "movie") {
    endpoint = "/discover/movie";
    if (sortBy === "first_air_date.desc") queryParams.sort_by = "release_date.desc";
    else if (sortBy === "next_episode" || sortBy === "daily_airing") queryParams.sort_by = "popularity.desc"; 
    else queryParams.sort_by = sortBy;
  } else {
    // TV 类型
    if (contentType === "anime") queryParams.with_genres = "16"; 
    else if (contentType === "variety") queryParams.with_genres = "10764|10767"; 

    // 排序预处理
    if (sortBy === "daily_airing") {
        const today = new Date().toISOString().split("T")[0]; 
        queryParams["air_date.gte"] = today;
        queryParams["air_date.lte"] = today;
        queryParams.sort_by = "popularity.desc";
    } else if (sortBy === "next_episode") {
        queryParams.sort_by = "popularity.desc";
    } else {
        if (sortBy.includes("vote_average")) queryParams["vote_count.gte"] = 100;
        queryParams.sort_by = sortBy;
    }
  }

  try {
    const res = await Widget.tmdb.get(endpoint, { params: queryParams });
    const items = res?.results || [];

    if (items.length === 0) {
      return page === 1 ? [{ title: "暂无数据", subTitle: "尝试切换类型或平台", type: "text" }] : [];
    }

    // === 2. 详情获取与格式化 ===
    const isUpdateMode = (sortBy === "next_episode" || sortBy === "daily_airing");
    const needDetails = (contentType !== "movie" && isUpdateMode);
    const processCount = needDetails ? 20 : 20;

    const processedItems = await Promise.all(items.slice(0, processCount).map(async (item) => {
        let fullDate = item.first_air_date || item.release_date || "";
        let sortDate = fullDate || "1900-01-01";
        const rawYear = fullDate ? fullDate.substring(0, 4) : "未知";

        // 强力兜底类型
        let fallbackGenre = "剧集";
        if (contentType === "movie") fallbackGenre = "电影";
        if (contentType === "anime") fallbackGenre = "动漫";
        if (contentType === "variety") fallbackGenre = "综艺";
        const genre = getGenreName(item.genre_ids) || fallbackGenre;
        
        let displaySubtitle = ""; 
        let finalYear = rawYear;

        // 如果是追更或今日播出，且不是电影，则去查集数
        if (needDetails) {
            try {
                const detail = await Widget.tmdb.get(`/tv/${item.id}`, { params: { language: "zh-CN" } });
                if (detail) {
                    const nextEp = detail.next_episode_to_air;
                    const lastEp = detail.last_episode_to_air;
                    let targetEp = nextEp || lastEp;
                    
                    if (targetEp) {
                        sortDate = targetEp.air_date || sortDate; 
                        fullDate = sortDate; 
                        const shortDate = formatShortDate(sortDate);
                        
                        const s = String(targetEp.season_number).padStart(2,'0');
                        const e = String(targetEp.episode_number).padStart(2,'0');
                        
                        // 组装格式: 02-23 S01-E03 动漫
                        displaySubtitle = `${shortDate} S${s}-E${e} ${genre}`;
                    }
                }
            } catch(e) {}
        }

        // 核心排版逻辑
        if (isUpdateMode) {
            // 【追更/今日播出 模式】
            if (!displaySubtitle) {
                if (contentType === "movie") {
                    displaySubtitle = `${fullDate} ${genre}`; // 如: 2025-07-11 电影
                } else {
                    displaySubtitle = `${formatShortDate(fullDate)} 首播 ${genre}`; 
                }
            }
            // 🚨 关键：将年份强制设为空，防止 Forward 自动把年份加在前面！
            finalYear = ""; 
        } else {
            // 【常规榜单 模式】(综合热度等)
            // 🚨 关键：只传类型，保留年份，Forward 会自动拼成: 年份 • 类型 (如 2026 • 科幻)
            displaySubtitle = genre; 
            finalYear = rawYear; 
        }

        return {
            ...item,
            _fullDate: fullDate,
            _year: finalYear,          // 给内核用的无重复年份
            _genre: genre,
            _sortDate: sortDate,
            _displaySubtitle: displaySubtitle // 给副标题用的文字
        };
    }));

    // === 3. 严谨的本地排序 ===
    let finalItems = processedItems;
    
    if (sortBy === "next_episode" && contentType !== "movie") {
        const today = new Date().toISOString().split("T")[0];

        finalItems.sort((a, b) => {
            const dateA = a._sortDate;
            const dateB = b._sortDate;

            const isAFuture = dateA >= today;
            const isBFuture = dateB >= today;

            if (isAFuture && !isBFuture) return -1; 
            if (!isAFuture && isBFuture) return 1;

            if (isAFuture && isBFuture) {
                if (dateA === dateB) return 0;
                return dateA > dateB ? 1 : -1;
            }

            if (dateA === dateB) return 0;
            return dateB > dateA ? 1 : -1; 
        });
    }

    return finalItems.map(item => buildCard(item, contentType));

  } catch (e) {
    return [{ title: "请求失败", subTitle: e.message, type: "text" }];
  }
}

function buildCard(item, contentType) {
    const isMovie = contentType === "movie";
    const scoreNum = item.vote_average ? item.vote_average.toFixed(1) : "0.0";
    
    return {
        id: String(item.id),
        tmdbId: parseInt(item.id),
        type: "tmdb",
        mediaType: isMovie ? "movie" : "tv",
        title: item.name || item.title || item.original_name,
        
        // 赋予副标题
        genreTitle: item._displaySubtitle, 
        subTitle: item._displaySubtitle,
        
        description: `${item._displaySubtitle} · ⭐ ${scoreNum}\n${item.overview || "暂无简介"}`,
        
        posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
        backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : "",
        
        // ✨ 底层年份字段，这里已做严格区分处理
        rating: parseFloat(scoreNum) || 0,
        year: item._year || "",
        releaseDate: item._fullDate || ""
    };
}
