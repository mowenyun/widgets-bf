// ==================== 常量定义 ====================
const DEFAULT_BASE_URL = "https://hanime1.me";
const REQUEST_TIMEOUT = 10000;
const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": DEFAULT_BASE_URL,
  "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7"
};

// ==================== 辅助函数（内部导出） ====================
function normalizeImageUrl(src) {
  if (!src) return "";
  if (src.startsWith("//")) return "https:" + src;
  if (src.startsWith("/")) return DEFAULT_BASE_URL + src;
  if (!src.startsWith("http")) return DEFAULT_BASE_URL + "/" + src;
  return src;
}
const _normalizeImageUrl = normalizeImageUrl;

function mapSortToApi(sortValue) {
  const map = {
    "new_release": "最新上市",
    "latest_upload": "最新上傳",
    "daily_rank": "本日排行",
    "weekly_rank": "本週排行",
    "monthly_rank": "本月排行",
    "watching": "他們在看"
  };
  return map[sortValue] || "";
}
const _mapSortToApi = mapSortToApi;

function mapGenreToApi(genreValue) {
  const map = {
    "rifan": "裏番",
    "paomian": "泡麵番",
    "motion": "Motion Anime",
    "3dcg": "3DCG",
    "2d": "2D動畫",
    "cosplay": "Cosplay"
  };
  return map[genreValue] || "";
}
const _mapGenreToApi = mapGenreToApi;

// ==================== API 封装类 ====================
class Hanime1API {
  async get(url, options = {}) {
    const finalOptions = {
      headers: { ...DEFAULT_HEADERS, ...options.headers },
      timeout: options.timeout || REQUEST_TIMEOUT
    };
    try {
      const resp = await Widget.http.get(url, finalOptions);
      if (!resp || resp.statusCode !== 200) {
        throw new Error(`HTTP ${resp?.statusCode || "unknown"}`);
      }
      return resp.data;
    } catch (error) {
      console.error(`请求失败 [${url}]:`, error);
      throw error;
    }
  }

  async getHtml(url, options = {}) {
    const data = await this.get(url, options);
    return Widget.html.load(data);
  }
}

const _api = new Hanime1API();

// ==================== 元数据生成辅助 ====================
function generateParams(module, extraParams = []) {
  return {
    title: module.title,
    description: module.description,
    requiresWebView: false,
    functionName: module.functionName,
    cacheDuration: module.cacheDuration || 1800,
    params: [
      ...extraParams,
      { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
    ]
  };
}

// ==================== 元数据定义 ====================
WidgetMetadata = {
  id: "hanime1_me_style",
  title: "Hanime1",
  description: "获取 Hanime1 动画，折扣码HAZE",
  author: "skywazzle",
  site: "https://hanime1.me",
  version: "6.2.0",
  requiredVersion: "0.0.2",
  detailCacheDuration: 300,
  // 顶级搜索模块（全局搜索入口）
  search: {
    title: "搜索影片",
    functionName: "searchVideos",
    params: [
      {
        name: "keyword",
        title: "搜索关键词",
        type: "input",
        description: "输入搜索关键词（标题、番号、作者等）",
        value: ""
      },
      {
        name: "genre",
        title: "分类",
        type: "enumeration",
        description: "筛选分类（可选）",
        value: "all",
        enumOptions: [
          { title: "全部", value: "all" },
          { title: "里番", value: "rifan" },
          { title: "泡面番", value: "paomian" },
          { title: "Motion Anime", value: "motion" },
          { title: "3DCG", value: "3dcg" },
          { title: "2D 动画", value: "2d" },
          { title: "Cosplay", value: "cosplay" }
        ]
      },
      {
        name: "sort_by",
        title: "排序",
        type: "enumeration",
        description: "排序方式",
        value: "all",
        enumOptions: [
          { title: "全部", value: "all" },
          { title: "最新上市", value: "new_release" },
          { title: "最新上传", value: "latest_upload" },
          { title: "本日排行", value: "daily_rank" },
          { title: "本周排行", value: "weekly_rank" },
          { title: "本月排行", value: "monthly_rank" },
          { title: "他们在看", value: "watching" }
        ]
      },
      { name: "page", title: "页码", type: "page", description: "页码", value: "1" }
    ]
  },
  modules: [
    generateParams({ title: "本日热门", description: "本日热门影片", functionName: "loadDailyHot" }),
    generateParams({ title: "本周热门", description: "本周热门影片", functionName: "loadWeeklyHot" }),
    generateParams({ title: "本月热门", description: "本月热门影片", functionName: "loadMonthlyHot" }),
    generateParams({ title: "最新上市", description: "最新上市影片", functionName: "loadNewRelease" }),
    generateParams({
      title: "中文字幕",
      description: "中文字幕影片",
      functionName: "loadChineseSubtitle"
    }, [
      {
        name: "genre", title: "分类", type: "enumeration", description: "筛选分类", value: "all",
        enumOptions: [
          { title: "全部", value: "all" },
          { title: "里番", value: "rifan" }, { title: "泡面番", value: "paomian" },
          { title: "Motion Anime", value: "motion" }, { title: "3DCG", value: "3dcg" },
          { title: "2D 动画", value: "2d" }, { title: "Cosplay", value: "cosplay" }
        ]
      },
      {
        name: "sort_by", title: "排序", type: "enumeration", description: "排序方式", value: "all",
        enumOptions: [
          { title: "全部", value: "all" },
          { title: "最新上市", value: "new_release" }, { title: "最新上传", value: "latest_upload" },
          { title: "本日排行", value: "daily_rank" }, { title: "本月排行", value: "monthly_rank" }
        ]
      }
    ]),
    generateParams({
      title: "影片分类",
      description: "浏览不同分类的影片",
      functionName: "loadByGenre"
    }, [
      {
        name: "genre", title: "选择分类", type: "enumeration", description: "选择具体分类", value: "all",
        enumOptions: [
          { title: "全部", value: "all" },
          { title: "里番", value: "rifan" }, { title: "泡面番", value: "paomian" },
          { title: "Motion Anime", value: "motion" }, { title: "3DCG", value: "3dcg" },
          { title: "2D 动画", value: "2d" }, { title: "Cosplay", value: "cosplay" }
        ]
      },
      {
        name: "sort_by", title: "排序", type: "enumeration", description: "排序方式", value: "all",
        enumOptions: [
          { title: "全部", value: "all" },
          { title: "最新上市", value: "new_release" }, { title: "最新上传", value: "latest_upload" },
          { title: "本日排行", value: "daily_rank" }, { title: "本月排行", value: "monthly_rank" }
        ]
      }
    ]),
    {
      title: "新番预告",
      description: "查看即将上映的新番",
      requiresWebView: false,
      functionName: "loadPreviews",
      cacheDuration: 3600,
      params: []
    }
  ]
};

// ==================== 通用列表解析函数（用于非搜索模块） ====================
async function fetchAndParse(url) {
  try {
    const $ = await _api.getHtml(url);
    const items = [];
    $('a[href*="/watch?v="]').each((i, el) => {
      const $a = $(el);
      const href = $a.attr('href');
      if (!href) return;
      let link = href.startsWith('http') ? href : DEFAULT_BASE_URL + (href.startsWith('/') ? '' : '/') + href;
      if (items.some(it => it.link === link)) return;

      let poster = "";
      const $img = $a.find('img').first();
      if ($img.length) {
        poster = $img.attr('data-src') || $img.attr('src') || $img.attr('data-original') || "";
      }
      if (!poster) {
        const $cardImg = $a.closest('.search-doujin-videos, .home-rows-videos-div, .video-item, .list-item').find('img').first();
        if ($cardImg.length) {
          poster = $cardImg.attr('data-src') || $cardImg.attr('src') || $cardImg.attr('data-original') || "";
        }
      }
      if (!poster) {
        const bgStyle = $a.find('.img, .thumbnail, .cover').attr('style');
        if (bgStyle) {
          const match = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
          if (match) poster = match[1];
        }
      }
      poster = _normalizeImageUrl(poster);

      let title = $a.find('.card-mobile-title, .home-rows-videos-title, [class*="title"]').first().text().trim();
      if (!title) title = $img.attr('alt') || $a.attr('title') || "";
      if (!title) return;

      const duration = $a.find('.card-mobile-duration, .duration, [class*="time"]').first().text().trim();
      const author = $a.find('.card-mobile-user, .author, [class*="user"]').first().text().trim();

      items.push({
        id: link, type: "url", title, backdropPath: poster, mediaType: "movie",
        durationText: duration, description: author, link
      });
    });
    return items;
  } catch (e) {
    console.error(`解析失败 [${url}]:`, e);
    return [];
  }
}
const _fetchAndParse = fetchAndParse;

// ==================== 专门的搜索结果解析函数 ====================
async function fetchAndParseSearch(url) {
  try {
    console.log("正在解析搜索页面:", url);
    const $ = await _api.getHtml(url);
    console.log("页面标题:", $('title').text());

    const items = [];
    // 搜索结果可能使用不同的容器类，尝试多种常见选择器
    const selectors = ['.search-item', '.search-result', '.video-item', 'a[href*="/watch?v="]'];
    let $containers = $();
    for (const sel of selectors) {
      $containers = $(sel);
      if ($containers.length > 0) {
        console.log(`使用选择器 "${sel}" 找到 ${$containers.length} 个元素`);
        break;
      }
    }

    $containers.each((i, el) => {
      // 确保我们操作的是 <a> 标签，如果不是则找内部的 <a>
      const $a = $(el).is('a') ? $(el) : $(el).find('a[href*="/watch?v="]').first();
      const href = $a.attr('href');
      if (!href) return;

      let link = href.startsWith('http') ? href : DEFAULT_BASE_URL + (href.startsWith('/') ? '' : '/') + href;
      if (items.some(it => it.link === link)) return;

      // 图片提取（针对搜索页优化）
      let poster = "";
      // 1. 从当前元素内的 <img> 提取
      const $img = $(el).find('img').first();
      if ($img.length) {
        poster = $img.attr('data-src') || $img.attr('src') || $img.attr('data-original') || "";
      }
      // 2. 如果没找到，尝试从父级或兄弟找缩略图
      if (!poster) {
        const $parentImg = $(el).closest('div').find('img.thumbnail, img.cover').first();
        if ($parentImg.length) {
          poster = $parentImg.attr('data-src') || $parentImg.attr('src') || "";
        }
      }
      // 3. 尝试背景图
      if (!poster) {
        const bgDiv = $(el).find('.img, .thumb, .cover').first();
        const bgStyle = bgDiv.attr('style');
        if (bgStyle) {
          const match = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
          if (match) poster = match[1];
        }
      }
      poster = _normalizeImageUrl(poster);

      // 标题提取
      let title = $(el).find('.title, .name, .video-title, [class*="title"]').first().text().trim();
      if (!title) title = $img.attr('alt') || $a.attr('title') || "";
      if (!title) {
        console.log("跳过无标题项");
        return;
      }

      const duration = $(el).find('.duration, .time, [class*="time"]').first().text().trim();
      const author = $(el).find('.author, .uploader, .user, [class*="user"]').first().text().trim();

      items.push({
        id: link,
        type: "url",
        title,
        backdropPath: poster,
        mediaType: "movie",
        durationText: duration,
        description: author,
        link
      });
    });

    console.log(`搜索结果解析完成，共 ${items.length} 项`);
    return items;
  } catch (e) {
    console.error("搜索解析失败:", e);
    return [];
  }
}

// ==================== 模块功能函数 ====================
async function searchVideos(params) {
  (_params = params).keyword || (_params.keyword = "");
  (_params = params).genre || (_params.genre = "all");
  (_params = params).sort_by || (_params.sort_by = "all");
  (_params = params).page || (_params.page = 1);

  const keyword = params.keyword;
  const genre = _mapGenreToApi(params.genre);
  const sort = _mapSortToApi(params.sort_by);
  const page = params.page;

  let url = `${DEFAULT_BASE_URL}/search?query=${encodeURIComponent(keyword)}`;
  if (genre) url += `&genre=${encodeURIComponent(genre)}`;
  if (sort) url += `&sort=${encodeURIComponent(sort)}`;
  if (page > 1) url += `&page=${page}`;

  return fetchAndParseSearch(url);
}

async function loadDailyHot(params) {
  (_params = params).page || (_params.page = 1);
  let url = `${DEFAULT_BASE_URL}/search?sort=${encodeURIComponent('本日排行')}`;
  if (params.page > 1) url += `&page=${params.page}`;
  return _fetchAndParse(url);
}

async function loadWeeklyHot(params) {
  (_params = params).page || (_params.page = 1);
  let url = `${DEFAULT_BASE_URL}/search?sort=${encodeURIComponent('本週排行')}`;
  if (params.page > 1) url += `&page=${params.page}`;
  return _fetchAndParse(url);
}

async function loadMonthlyHot(params) {
  (_params = params).page || (_params.page = 1);
  let url = `${DEFAULT_BASE_URL}/search?sort=${encodeURIComponent('本月排行')}`;
  if (params.page > 1) url += `&page=${params.page}`;
  return _fetchAndParse(url);
}

async function loadNewRelease(params) {
  (_params = params).page || (_params.page = 1);
  let url = `${DEFAULT_BASE_URL}/search?sort=${encodeURIComponent('最新上市')}`;
  if (params.page > 1) url += `&page=${params.page}`;
  return _fetchAndParse(url);
}

async function loadChineseSubtitle(params) {
  (_params = params).page || (_params.page = 1);
  (_params = params).sort_by || (_params.sort_by = "all");
  (_params = params).genre || (_params.genre = "all");

  const sort = _mapSortToApi(params.sort_by);
  const genre = _mapGenreToApi(params.genre);
  const page = params.page;

  let url = `${DEFAULT_BASE_URL}/search?tags%5B%5D=${encodeURIComponent('中文字幕')}`;
  if (sort) url += `&sort=${encodeURIComponent(sort)}`;
  if (genre) url += `&genre=${encodeURIComponent(genre)}`;
  if (page > 1) url += `&page=${page}`;
  return _fetchAndParse(url);
}

async function loadByGenre(params) {
  (_params = params).page || (_params.page = 1);
  (_params = params).sort_by || (_params.sort_by = "all");
  (_params = params).genre || (_params.genre = "all");

  const genre = _mapGenreToApi(params.genre);
  const sort = _mapSortToApi(params.sort_by);
  const page = params.page;

  let url = `${DEFAULT_BASE_URL}/search`;
  const queryParts = [];
  if (genre) queryParts.push(`genre=${encodeURIComponent(genre)}`);
  if (sort) queryParts.push(`sort=${encodeURIComponent(sort)}`);
  if (page > 1) queryParts.push(`page=${page}`);

  if (queryParts.length > 0) url += '?' + queryParts.join('&');
  return _fetchAndParse(url);
}

async function loadPreviews(params) {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const url = `${DEFAULT_BASE_URL}/previews/${year}${month}`;

  try {
    const $ = await _api.getHtml(url);
    const items = [];
    $('.hidden-sm.hidden-md.hidden-lg .preview-image-modal-trigger').each((i, el) => {
      const $img = $(el);
      const poster = $img.attr('src') || $img.attr('data-src');
      if (!poster) return;

      let title = $img.attr('alt') || "";
      if (!title) {
        const $caption = $img.closest('div').find('h5.caption');
        if ($caption.length) title = $caption.text().trim().split('\n')[0];
      }
      if (!title) title = "新番预告";
      if (title.length > 40) title = title.substring(0, 40) + "...";

      items.push({
        id: url,
        type: "url",
        title,
        backdropPath: _normalizeImageUrl(poster),
        mediaType: "movie",
        description: "新番预告",
        link: url
      });
    });
    return items;
  } catch (e) {
    console.error("预览加载失败", e);
    return [];
  }
}

// ==================== 详情加载 ====================
async function loadDetail(link) {
  try {
    const $ = await _api.getHtml(link);

    let videoUrl = "";
    const qualityIds = ['#video-sd', '#video-hd', '#video-720p', '#video-1080p'];
    for (const id of qualityIds) {
      const val = $(id).val();
      if (val) { videoUrl = val; break; }
    }

    if (!videoUrl) {
      const match = $.html().match(/source\s*=\s*['"](https:\/\/[^'"]+)['"]/);
      if (match) videoUrl = match[1];
    }
    if (!videoUrl) videoUrl = $('video source').attr('src');
    if (!videoUrl) throw new Error("video_url_not_found");

    videoUrl = videoUrl.replace(/&amp;/g, '&');

    const title = $('meta[property="og:title"]').attr('content') || "标题未知";
    const desc = $('meta[property="og:description"]').attr('content') || "";
    const cover = $('meta[property="og:image"]').attr('content') || "";

    const childItems = [];
    $('.home-rows-videos-div a[href*="/watch?v="]').each((i, el) => {
      if (i >= 10) return false;
      const $a = $(el);
      let recLink = $a.attr('href');
      if (!recLink) return;
      if (!recLink.startsWith('http')) {
        recLink = DEFAULT_BASE_URL + (recLink.startsWith('/') ? '' : '/') + recLink;
      }

      const $img = $a.find('img').first();
      let recPoster = $img.attr('data-src') || $img.attr('src') || "";
      recPoster = _normalizeImageUrl(recPoster);

      let recTitle = $a.find('.home-rows-videos-title, [class*="title"]').first().text().trim();
      if (!recTitle) recTitle = $img.attr('alt') || "相关视频";

      childItems.push({
        id: recLink,
        type: "url",
        title: recTitle,
        backdropPath: recPoster,
        mediaType: "movie",
        link: recLink
      });
    });

    return {
      id: link,
      type: "detail",
      videoUrl,
      title,
      description: desc,
      backdropPath: _normalizeImageUrl(cover),
      mediaType: "movie",
      link,
      childItems
    };
  } catch (error) {
    console.error("详情加载失败:", error);
    let errorMsg = "无法加载视频，请重试。";
    if (error.message === "video_url_not_found") {
      errorMsg = "未找到视频地址，可能需登录或该视频已失效。";
    }
    return {
      id: link,
      type: "detail",
      videoUrl: link,
      title: "加载失败",
      description: errorMsg,
      backdropPath: "",
      mediaType: "movie",
      link
    };
  }
}