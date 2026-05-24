WidgetMetadata = {
  id: "danmu_api_Max_binfa",
  title: "并发弹幕",
  version: "1.3.2", // 
  requiredVersion: "0.0.2",
  site: "https://t.me/MakkaPakkaOvO",
  description: "并发搜索多API、自定义名称、繁简互转、数量限制、关键词屏蔽、颜色重写",
  author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
  
  globalParams: [
      { name: "serverName", title: "🏷️ 源1 名称", type: "input", value: "主节点", description: "例如：我的专属节点" },
      { name: "server", title: "🔗 源1 链接", type: "input", value: "https://api.dandanplay.net" },
      { name: "serverName2", title: "🏷️ 源2 名称", type: "input" },
      { name: "server2", title: "🔗 源2 链接", type: "input" },
      { name: "serverName3", title: "🏷️ 源3 名称", type: "input" },
      { name: "server3", title: "🔗 源3 链接", type: "input" },
      { 
          name: "maxCount", 
          title: "📊 弹幕数量上限", 
          type: "input", 
          value: "3000",
          description: "填0或留空不限制。超出则按时间全段等比例随机剔除" 
      },
      { 
          name: "searchBlockKeywords", 
          title: "👁️ 搜索结果屏蔽词 (逗号分隔)", 
          type: "input", 
          value: "",
          description: "屏蔽不想看到的搜索结果，如: 动态漫,电视剧,漫画" 
      },
      { 
          name: "convertMode", 
          title: "🔠 弹幕转换", 
          type: "enumeration", 
          value: "none",
          enumOptions: [
              { title: "保持原样", value: "none" },
              { title: "转简体 (繁->简)", value: "t2s" },
              { title: "转繁体 (简->繁)", value: "s2t" }
          ]
      },
      { 
          name: "colorMode", 
          title: "🎨 弹幕颜色", 
          type: "enumeration", 
          value: "none",
          enumOptions: [
              { title: "保持原样", value: "none" },
              { title: "全部纯白", value: "white" },
              { title: "部分彩色 (50%彩色)", value: "partial" },
              { title: "完全彩色 (100%彩色)", value: "all" }
          ]
      },
      { 
          name: "blockKeywords", 
          title: "🚫 弹幕内容屏蔽词 (逗号分隔)", 
          type: "input", 
          value: "" 
      }
  ],
  modules: [
      { id: "searchDanmu", title: "搜索弹幕", functionName: "searchDanmu", type: "danmu", params: [] },
      { id: "getDetail", title: "获取详情", functionName: "getDetailById", type: "danmu", params: [] },
      { id: "getComments", title: "获取弹幕", functionName: "getCommentsById", type: "danmu", params: [] }
  ]
};

// ==========================================
// 1. 繁简转换核心
// ==========================================
const DICT_URL_S2T = "https://cdn.jsdelivr.net/npm/opencc-data@1.0.3/data/STCharacters.txt";
const DICT_URL_T2S = "https://cdn.jsdelivr.net/npm/opencc-data@1.0.3/data/TSCharacters.txt";
let MEM_DICT = null;

async function initDict(mode) {
  if (!mode || mode === "none") return;
  if (MEM_DICT) return; 
  const key = `dict_${mode}`;
  let local = await Widget.storage.get(key);
  if (!local) {
      try {
          const res = await Widget.http.get(mode === "s2t" ? DICT_URL_S2T : DICT_URL_T2S);
          let text = res.data || res;
          if (typeof text === 'string' && text.length > 100) {
              const map = {};
              text.split('\n').forEach(l => {
                  const p = l.split(/\s+/);
                  if (p.length >= 2) map[p[0]] = p[1];
              });
              await Widget.storage.set(key, JSON.stringify(map));
              MEM_DICT = map;
          }
      } catch (e) {}
  } else {
      try { MEM_DICT = JSON.parse(local); } catch (e) {}
  }
}

function convertText(text) {
  if (!text || !MEM_DICT) return text;
  let res = "";
  for (let char of text) { res += MEM_DICT[char] || char; }
  return res;
}

// ==========================================
// 2. 底层工具与多源管理
// ==========================================
const DEFAULT_DANMU_SERVER = "https://api.dandanplay.net";
const DANMU_SERVER_ID_SEPARATOR = "__FORWARD_DANMU_SERVER__";
const DANMU_SOURCE_BATCH_SIZE = 5;

function normalizeDanmuServer(server) {
  return String(server || "").trim().replace(/\/+$/, "");
}

function getDanmuSourceTitle(server) {
  try { return new URL(server).host || server; } catch (error) { return server; }
}

function looksLikeServerAddress(value) {
  return /^(https?:\/\/|localhost\b|127\.0\.0\.1\b)/i.test(value);
}

function makeDanmuSource(title, server, explicitTitle) {
  const normalizedServer = normalizeDanmuServer(server);
  const normalizedTitle = String(title || "").trim();
  return {
    title: normalizedTitle || getDanmuSourceTitle(normalizedServer),
    server: normalizedServer,
    explicitTitle: Boolean(explicitTitle && normalizedTitle),
  };
}

function parseDanmuSourceLine(line) {
  const separatorMatch = line.match(/[，,]/);
  if (!separatorMatch) return makeDanmuSource("", line, false);
  const separatorIndex = separatorMatch.index;
  const title = line.slice(0, separatorIndex).trim();
  const server = line.slice(separatorIndex + separatorMatch[0].length).trim();
  if (!server && looksLikeServerAddress(title)) return makeDanmuSource("", title, false);
  return makeDanmuSource(title, server, true);
}

function getMergedDanmuSources(params) {
  const { server, serverName, server2, serverName2, server3, serverName3 } = params;
  const buildLine = (name, url) => {
      if (!url || String(url).trim().length === 0) return "";
      if (name && String(name).trim().length > 0) return `${String(name).trim()},${String(url).trim()}`;
      return String(url).trim();
  };

  const allServers = [
      buildLine(serverName, server),
      buildLine(serverName2, server2),
      buildLine(serverName3, server3)
  ].filter(s => s.length > 0);
  
  if (allServers.length === 0) return [makeDanmuSource("弹弹play", DEFAULT_DANMU_SERVER, true)];
  
  let lines = [];
  allServers.forEach(s => {
      lines.push(...String(s).split(/\r?\n/).map(line => line.trim()).filter(Boolean));
  });

  return dedupeDanmuSources(lines.map(parseDanmuSourceLine).filter((source) => source.server));
}

function dedupeDanmuSources(sources) {
  const sourceMap = new Map();
  for (const source of sources) {
    if (!sourceMap.has(source.server)) {
      sourceMap.set(source.server, source);
    }
  }
  return Array.from(sourceMap.values());
}

function bindDanmuServerId(id, source, shouldBind) {
  if (!shouldBind || id === undefined || id === null) return id;
  const payload = JSON.stringify({ title: source.title, server: source.server });
  return `${encodeURIComponent(payload)}${DANMU_SERVER_ID_SEPARATOR}${id}`;
}

function parseDanmuServerId(id) {
  if (typeof id !== "string") return { id, source: null };
  const separatorIndex = id.indexOf(DANMU_SERVER_ID_SEPARATOR);
  if (separatorIndex === -1) return { id, source: null };

  const encodedSource = id.slice(0, separatorIndex);
  const rawId = id.slice(separatorIndex + DANMU_SERVER_ID_SEPARATOR.length);
  const decodedSource = decodeURIComponent(encodedSource);
  try {
    const source = JSON.parse(decodedSource);
    if (source && source.server) {
      return { id: rawId, source: makeDanmuSource(source.title, source.server, true) };
    }
  } catch (error) {}
  return { id: rawId, source: makeDanmuSource("", decodedSource, false) };
}

function getDanmuRequestSources(mergedSources, boundSource) {
  return boundSource ? [boundSource] : mergedSources;
}

function shouldShowDanmuSource(sources) {
  return sources.some((source) => source.explicitTitle) || sources.length > 1;
}

function appendDanmuSourceTitle(title, source, shouldAppend) {
  if (!shouldAppend) return title;
  return `${title} - ${source.title}`;
}

function getDanmuHeaders() {
  return { "Content-Type": "application/json", "User-Agent": "ForwardWidgets/1.0.0" };
}

async function mapDanmuSourcesInBatches(sources, batchSize, task) {
  const results = [];
  for (let index = 0; index < sources.length; index += batchSize) {
    const batch = sources.slice(index, index + batchSize);
    const batchResults = await Promise.all(batch.map(task));
    results.push(...batchResults);
  }
  return results;
}

function extractSeasonNumber(animeTitle) {
  const title = String(animeTitle || "");
  let m = title.match(/第\s*([0-9一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾]+)\s*[季部]/);
  if (m) {
    const n = convertChineseNumber(m[1]);
    if (n > 0) return n;
  }
  m = title.match(/(?:_|\bS|\bSeason\s+)(\d{1,2})\b/i);
  if (m) return Number(m[1]);
  m = title.match(/[^\d](\d{1,2})$/);
  if (m) return Number(m[1]);
  return null;
}

function filterAnimes(rawAnimes, type, season, queryTitle) {
  const movieTypes = ["movie", "电影", "奇幻片", "剧场版"];
  let animes = [];
  if (rawAnimes && rawAnimes.length > 0) {
    animes = rawAnimes.filter((anime) => {
      const animeType = (anime.type || "").toLowerCase();
      if (type === "movie") return movieTypes.some(t => t.toLowerCase() === animeType);
      if (type === "tv") return !movieTypes.some(t => t.toLowerCase() === animeType);
      return true;
    });
    if (season) {
      const seasonNum = Number(season);
      const matchedAnimes = animes.filter((anime) => {
        if (!anime.animeTitle.includes(queryTitle)) return false;
        const animeSeason = extractSeasonNumber(anime.animeTitle);
        return animeSeason !== null && animeSeason === seasonNum;
      });
      if (matchedAnimes.length > 0) animes = matchedAnimes;
    }
  }
  return animes;
}

function convertChineseNumber(chineseNumber) {
  if (/^\d+$/.test(chineseNumber)) return Number(chineseNumber);
  const digits = {
    '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
    '壹': 1, '貳': 2, '參': 3, '肆': 4, '伍': 5, '陸': 6, '柒': 7, '捌': 8, '玖': 9
  };
  const units = { '十': 10, '百': 100, '千': 1000, '拾': 10, '佰': 100, '仟': 1000 };
  let result = 0, current = 0, lastUnit = 1;
  for (let i = 0; i < chineseNumber.length; i++) {
    const char = chineseNumber[i];
    if (digits[char] !== undefined) current = digits[char];
    else if (units[char] !== undefined) {
      const unit = units[char];
      if (current === 0) current = 1;
      if (unit >= lastUnit) result = current * unit;
      else result += current * unit;
      lastUnit = unit; current = 0;
    }
  }
  if (current > 0) result += current;
  return result;
}

// ==========================================
// 3. 核心 API 方法
// ==========================================

async function searchDanmu(params) {
  const { type, title, season, searchBlockKeywords } = params;
  let queryTitle = title;
  
  const sources = getMergedDanmuSources(params);
  const shouldBindSource = shouldShowDanmuSource(sources);
  
  const results = await mapDanmuSourcesInBatches(sources, DANMU_SOURCE_BATCH_SIZE, async (source) => {
    try {
      const response = await Widget.http.get(
        `${source.server}/api/v2/search/anime?keyword=${encodeURIComponent(queryTitle)}`,
        { headers: getDanmuHeaders() }
      );
      if (!response) throw new Error("获取数据失败");
      const data = response.data;
      if (!data.success) throw new Error(data.errorMessage || "API调用失败");

      let rawAnimes = Array.isArray(data.animes) ? data.animes : [];
      
      if (rawAnimes.length === 0) {
        const epResponse = await Widget.http.get(
          `${source.server}/api/v2/search/episodes?anime=${encodeURIComponent(queryTitle)}`,
          { headers: getDanmuHeaders() }
        );
        const epData = epResponse && epResponse.data;
        if (epData && Array.isArray(epData.animes)) {
          rawAnimes = epData.animes.map(({ episodes, ...anime }) => anime);
        }
      }

      if (rawAnimes.length > 0 && searchBlockKeywords) {
          const blockedList = searchBlockKeywords.split(/[,，]/).map(k => k.trim()).filter(k => k.length > 0);
          if (blockedList.length > 0) {
              rawAnimes = rawAnimes.filter(a => {
                  if (!a.animeTitle) return false;
                  for (const keyword of blockedList) {
                      if (a.animeTitle.includes(keyword)) return false; 
                  }
                  return true;
              });
          }
      }

      return {
        source,
        animes: filterAnimes(rawAnimes, type, season, queryTitle),
      };
    } catch (error) {
      console.error(`请求 ${source.server} 失败:`, error);
      return { source, error };
    }
  });

  let lastError = null;
  let hasSuccessfulResponse = false;
  const animes = [];
  let seenIds = new Set(); 

  for (const result of results) {
    if (result.error) {
      lastError = result.error;
      continue;
    }
    hasSuccessfulResponse = true;
    for (const anime of result.animes) {
        const uid = anime.bangumiId || anime.animeId;
        if (!seenIds.has(uid)) {
            seenIds.add(uid);
            animes.push({
                ...anime,
                animeId: bindDanmuServerId(uid, result.source, shouldBindSource),
                animeTitle: appendDanmuSourceTitle(anime.animeTitle, result.source, shouldBindSource),
            });
        }
    }
  }

  if (hasSuccessfulResponse) return { animes: animes };
  throw lastError || new Error("获取数据失败");
}

function cleanAnimeTitle(title) {
  return String(title || "").replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
}

async function fetchEpisodesByBangumi(source, id) {
  try {
    const response = await Widget.http.get(`${source.server}/api/v2/bangumi/${id}`, { headers: getDanmuHeaders() });
    const episodes = response && response.data && response.data.bangumi && response.data.bangumi.episodes;
    return Array.isArray(episodes) && episodes.length > 0 ? episodes : null;
  } catch (error) { return null; }
}

async function fetchEpisodesByMatch(source, title, season, episode) {
  const cleanTitle = cleanAnimeTitle(title).replace(/\s*第\s*[一二三四五六七八九十百零〇\d]+\s*[季部]\s*$/g, "").trim();
  const e = Number(episode);
  if (!cleanTitle || Number.isNaN(e) || e <= 0) return null;
  const s = Number(season);
  const seasonNum = !Number.isNaN(s) && s > 0 ? s : 1;
  const fileName = `${cleanTitle} S${String(seasonNum).padStart(2, "0")}E${String(e).padStart(2, "0")}`;
  try {
    const response = await Widget.http.post(
      `${source.server}/api/v2/match`,
      { fileName, fileHash: null, fileSize: 0, videoDuration: 0 },
      { headers: getDanmuHeaders() }
    );
    const data = response && response.data;
    if (!data || !data.isMatched || !Array.isArray(data.matches) || data.matches.length === 0) return null;
    const matched = data.matches[0];
    
    // 【核心修复】：官方原本直接返回单一集数，这里改为使用提取到的 animeId 去获取全部集数列表
    if (matched.animeId) {
        const fullEpisodes = await fetchEpisodesByBangumi(source, matched.animeId);
        if (fullEpisodes && fullEpisodes.length > 0) return fullEpisodes;
    }

    return [{
      episodeId: matched.episodeId,
      episodeTitle: matched.episodeTitle || `第${e}集`,
      episodeNumber: String(e),
    }];
  } catch (error) { return null; }
}

async function fetchEpisodesByLibrary(source, title, season) {
  const query = cleanAnimeTitle(title);
  if (!query) return null;
  try {
    const response = await Widget.http.get(
      `${source.server}/api/v2/search/episodes?anime=${encodeURIComponent(query)}`,
      { headers: getDanmuHeaders() }
    );
    const animes = response && response.data && response.data.animes;
    if (!Array.isArray(animes) || animes.length === 0) return null;
    let target = animes[0];
    const s = Number(season);
    if (animes.length > 1 && !Number.isNaN(s) && s > 0) {
      const matched = animes.find((a) => extractSeasonNumber(a.animeTitle) === s);
      if (matched) target = matched;
    }
    return Array.isArray(target.episodes) && target.episodes.length > 0 ? target.episodes : null;
  } catch (error) { return null; }
}

async function fetchEpisodesByResearch(source, title, season) {
  const query = cleanAnimeTitle(title);
  if (!query) return null;
  try {
    const searchRes = await Widget.http.get(
      `${source.server}/api/v2/search/anime?keyword=${encodeURIComponent(query)}`,
      { headers: getDanmuHeaders() }
    );
    const animes = searchRes && searchRes.data && searchRes.data.animes;
    if (!Array.isArray(animes) || animes.length === 0) return null;
    let target = animes.find((a) => a.animeTitle === title);
    if (!target) {
      const cands = animes.filter((a) => {
        const c = cleanAnimeTitle(a.animeTitle);
        return c === query || c.startsWith(query) || query.startsWith(c);
      });
      const s = Number(season);
      if (!Number.isNaN(s) && s > 0) {
        target = cands.find((a) => extractSeasonNumber(a.animeTitle) === s);
      }
      target = target || cands[0];
    }
    if (!target) return null;
    const freshId = target.bangumiId || target.animeId;
    const detailRes = await Widget.http.get(
      `${source.server}/api/v2/bangumi/${freshId}`,
      { headers: getDanmuHeaders() }
    );
    const episodes = detailRes && detailRes.data && detailRes.data.bangumi && detailRes.data.bangumi.episodes;
    return Array.isArray(episodes) && episodes.length > 0 ? episodes : null;
  } catch (error) { return null; }
}

async function getDetailById(params) {
  const { animeId, title, seriesName, season, episode } = params;
  const matchTitle = seriesName || title;
  const parsedAnimeId = parseDanmuServerId(animeId);
  const sources = getDanmuRequestSources(getMergedDanmuSources(params), parsedAnimeId.source);
  const shouldBindSource = shouldShowDanmuSource(sources) || Boolean(parsedAnimeId.source);
  
  let lastError = null;
  let hasSuccessfulResponse = false;
  const allEpisodes = [];

  for (const source of sources) {
    try {
      let episodes = null;
      
      // 【核心修复】：优先判定是否为手动点击列表 (存在有效的 animeId)
      // 如果有，则直接获取整部剧的完整集数列表，不走单集截断逻辑
      if (parsedAnimeId && parsedAnimeId.id && parsedAnimeId.id !== "undefined" && parsedAnimeId.id !== "null") {
          episodes = await fetchEpisodesByBangumi(source, parsedAnimeId.id);
      }
      
      // 如果没有获取到（说明是软件后台自动搜索无感匹配），再按官方流程进行
      if (!episodes) episodes = await fetchEpisodesByMatch(source, matchTitle, season, episode);
      if (!episodes) episodes = await fetchEpisodesByResearch(source, title, season);
      if (!episodes) episodes = await fetchEpisodesByLibrary(source, title, season);

      if (episodes) {
        hasSuccessfulResponse = true;
        allEpisodes.push(...episodes.map((episode) => ({
          ...episode,
          episodeId: bindDanmuServerId(episode.episodeId, source, shouldBindSource),
          episodeTitle: appendDanmuSourceTitle(episode.episodeTitle, source, shouldBindSource),
        })));
        continue;
      }
      lastError = new Error("获取数据失败");
    } catch (error) {
      lastError = error;
      console.error(`请求 ${source.server} 失败:`, error);
    }
  }

  if (hasSuccessfulResponse) return allEpisodes;
  throw lastError || new Error("获取数据失败");
}

async function getCommentsById(params) {
  const { commentId, convertMode, blockKeywords, colorMode, maxCount } = params;

  if (commentId) {
    await initDict(convertMode);

    const parsedCommentId = parseDanmuServerId(commentId);
    const sources = getDanmuRequestSources(getMergedDanmuSources(params), parsedCommentId.source);
    let lastError = null;

    for (const source of sources) {
      try {
        const response = await Widget.http.get(
          `${source.server}/api/v2/comment/${parsedCommentId.id}?async=1&withRelated=true&chConvert=1`,
          { headers: getDanmuHeaders() }
        );

        if (response && response.data) {
          let data = response.data;
          let list = data.comments || [];
          
          const blockedList = blockKeywords 
            ? blockKeywords.split(/[,，]/).map(k => k.trim()).filter(k => k.length > 0) 
            : [];

          if (list.length > 0) {
              if (convertMode !== "none" && MEM_DICT) {
                  list.forEach(c => {
                      if (c.m) c.m = convertText(c.m);
                      if (c.message) c.message = convertText(c.message);
                  });
              }

              if (blockedList.length > 0) {
                  list = list.filter(c => {
                      const msg = c.m || c.message || "";
                      for (const keyword of blockedList) {
                          if (msg.includes(keyword)) return false; 
                      }
                      return true;
                  });
              }

              let limit = parseInt(maxCount);
              if (!isNaN(limit) && limit > 0 && list.length > limit) {
                  for (let i = list.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [list[i], list[j]] = [list[j], list[i]];
                  }
                  list = list.slice(0, limit);
                  list.sort((a, b) => {
                      let timeA = a.p ? parseFloat(a.p.split(',')[0]) || 0 : 0;
                      let timeB = b.p ? parseFloat(b.p.split(',')[0]) || 0 : 0;
                      return timeA - timeB;
                  });
              }

              if (colorMode && colorMode !== "none") {
                  const COLORS = [16711680, 16776960, 16752384, 16738740, 13445375, 11730943, 11730790];
                  const COLOR_WHITE = "16777215";

                  list.forEach(c => {
                      if (c.p) {
                          let parts = c.p.split(',');
                          if (parts.length >= 3) {
                              let colorIndex = parts.length >= 8 ? 3 : 2; 
                              let targetColor = COLOR_WHITE;
                              if (colorMode === "white") targetColor = COLOR_WHITE;
                              else if (colorMode === "partial") {
                                  targetColor = Math.random() < 0.5 
                                      ? COLORS[Math.floor(Math.random() * COLORS.length)].toString() 
                                      : COLOR_WHITE;
                              } else if (colorMode === "all") {
                                  targetColor = COLORS[Math.floor(Math.random() * COLORS.length)].toString();
                              }
                              parts[colorIndex] = targetColor;
                              c.p = parts.join(',');
                          }
                      }
                  });
              }
              
              data.comments = list;
          }
          return data;
        }

        lastError = new Error("获取数据失败");
      } catch (error) {
        lastError = error;
        console.error(`请求 ${source.server} 失败:`, error);
      }
    }
    throw lastError || new Error("获取数据失败");
  }
  return null;
}
