WidgetMetadata = {
  id: "danmu.pro.online",
  title: "弹幕多源",
  version: "1.1.5", // 回退花哨功能，彻底重构多源并发合并机制，解决短路截胡问题
  requiredVersion: "0.0.2",
  site: "https://t.me/MakkaPakkaOvO",
  description: "支持多api、繁简互转、数量限制、关键词屏蔽、颜色重写",
  author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
  
  globalParams: [
      { name: "server", title: "源1 (必填)", type: "input", value: "请填入你的弹幕api" },
      { name: "server2", title: "源2", type: "input" },
      { name: "server3", title: "源3", type: "input" },
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
      { id: "searchDanmu", title: "搜索", functionName: "searchDanmu", type: "danmu", params: [] },
      { id: "getDetail", title: "详情", functionName: "getDetailById", type: "danmu", params: [] },
      { id: "getComments", title: "弹幕", functionName: "getCommentsById", type: "danmu", params: [] }
  ]
};

// ==========================================
// 1. 繁简转换核心 (OpenCC)
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
  for (let char of text) {
      res += MEM_DICT[char] || char;
  }
  return res;
}

// ==========================================
// 2. 核心功能 (带路由)
// ==========================================
const SOURCE_KEY = "dm_source_map";

async function getSource(id) {
  let map = await Widget.storage.get(SOURCE_KEY);
  return map ? JSON.parse(map)[id] : null;
}

async function searchDanmu(params) {
  const { title, season, searchBlockKeywords } = params;
  const servers = [params.server, params.server2, params.server3].filter(s => s && s.startsWith("http")).map(s => s.replace(/\/$/, ""));
  
  if (!servers.length) return { animes: [] };

  // 并发请求所有源，不发生短路截胡
  const tasks = servers.map(async (server) => {
      try {
          const res = await Widget.http.get(`${server}/api/v2/search/anime?keyword=${encodeURIComponent(title)}`, {
              headers: { "Content-Type": "application/json", "User-Agent": "ForwardWidgets/2.0" }
          });
          const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          if (data?.success && data.animes?.length > 0) return { server, animes: data.animes };
      } catch (e) {}
      return null;
  });

  const results = await Promise.all(tasks);
  let finalAnimes = [];
  let mapEntries = {};

  // 汇集所有源的结果
  for (const res of results) {
      if (res) {
          for (const a of res.animes) {
              mapEntries[a.animeId] = res.server;
          }
          finalAnimes = finalAnimes.concat(res.animes);
      }
  }

  // 一次性批量保存所有来源映射，告别循环保存引发的卡死丢失
  let mapStr = await Widget.storage.get(SOURCE_KEY);
  let map = mapStr ? JSON.parse(mapStr) : {};
  Object.assign(map, mapEntries);
  await Widget.storage.set(SOURCE_KEY, JSON.stringify(map));

  // 搜索结果屏蔽词过滤
  if (finalAnimes.length > 0 && searchBlockKeywords) {
      const blockedList = searchBlockKeywords.split(/[,，]/).map(k => k.trim()).filter(k => k.length > 0);
      if (blockedList.length > 0) {
          finalAnimes = finalAnimes.filter(a => {
              for (const keyword of blockedList) {
                  if (a.animeTitle.includes(keyword)) return false; 
              }
              return true;
          });
      }
  }

  // 季数精确过滤
  if (finalAnimes.length > 0 && season) {
      const matched = finalAnimes.filter(a => {
          if (!a.animeTitle.includes(title)) return false;
          const parts = a.animeTitle.split(" ");
          for (let p of parts) {
              if (p.match(/\d+/) && parseInt(p.match(/\d+/)[0]) == season) return true;
              const cn = p.match(/[一二三四五六七八九十]+/);
              if (cn && convertChineseNumber(cn[0]) == season) return true;
          }
          return (a.animeTitle.trim() === title.trim() && season == 1);
      });
      if (matched.length > 0) finalAnimes = matched;
  }

  return { animes: finalAnimes };
}

async function getDetailById(params) {
  const { animeId } = params;
  let server = (await getSource(animeId)) || params.server;

  try {
      const res = await Widget.http.get(`${server}/api/v2/bangumi/${animeId}`, {
          headers: { "Content-Type": "application/json" }
      });
      const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      if (data?.bangumi?.episodes) {
          let mapStr = await Widget.storage.get(SOURCE_KEY);
          let map = mapStr ? JSON.parse(mapStr) : {};
          for (const ep of data.bangumi.episodes) {
              map[ep.episodeId] = server;
          }
          await Widget.storage.set(SOURCE_KEY, JSON.stringify(map));
          return data.bangumi.episodes;
      }
  } catch (e) {}
  return [];
}

async function getCommentsById(params) {
  const { commentId, convertMode, blockKeywords, colorMode, maxCount } = params;
  if (!commentId) return null;

  await initDict(convertMode);

  let server = (await getSource(commentId)) || params.server;

  try {
      const res = await Widget.http.get(`${server}/api/v2/comment/${commentId}?withRelated=true&chConvert=0`, {
          headers: { "Content-Type": "application/json" }
      });
      const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      
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
              const COLORS = [
                  16711680, 16776960, 16752384, 16738740, 13445375, 11730943, 11730790
              ];
              const COLOR_WHITE = "16777215";

              list.forEach(c => {
                  if (c.p) {
                      let parts = c.p.split(',');
                      if (parts.length >= 3) {
                          let colorIndex = parts.length >= 8 ? 3 : 2; 

                          let targetColor = COLOR_WHITE;
                          if (colorMode === "white") {
                              targetColor = COLOR_WHITE;
                          } else if (colorMode === "partial") {
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
  } catch (e) { return null; }
}

function convertChineseNumber(str) {
  const map = {'零':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
  let res = 0, curr = 0, lastUnit = 1;
  for (let char of str) {
      if (map[char] < 10) curr = map[char];
      else {
          let unit = map[char];
          if (curr === 0) curr = 1;
          if (unit >= lastUnit) res = curr * unit; else res += curr * unit;
          lastUnit = unit; curr = 0;
      }
  }
  return res + curr;
}
