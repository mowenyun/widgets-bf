const SOURCES = [
    { "id": "feifan", "name": "非凡资源", "baseUrl": "http://ffzy5.tv/api.php/provide/vod", "group": "normal" },
    { "id": "wolong", "name": "卧龙资源", "baseUrl": "https://wolongzyw.com/api.php/provide/vod", "group": "normal" },
    { "id": "zuida", "name": "最大资源", "baseUrl": "https://api.zuidapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "baiduyun", "name": "百度云资源", "baseUrl": "https://api.apibdzy.com/api.php/provide/vod", "group": "normal" },
    { "id": "baofeng", "name": "暴风资源", "baseUrl": "https://bfzyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "jisu", "name": "极速资源", "baseUrl": "https://jszyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "tianya", "name": "天涯资源", "baseUrl": "https://tyyszy.com/api.php/provide/vod", "group": "normal" },
    { "id": "wujin", "name": "无尽资源", "baseUrl": "https://api.wujinapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "modu", "name": "魔都资源", "baseUrl": "https://www.mdzyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "sanliuling", "name": "360资源", "baseUrl": "https://360zy.com/api.php/provide/vod", "group": "normal" },
    { "id": "dytt", "name": "电影天堂", "baseUrl": "http://caiji.dyttzyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "ruyi", "name": "如意资源", "baseUrl": "https://cj.rycjapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "wangwang", "name": "旺旺资源", "baseUrl": "https://wwzy.tv/api.php/provide/vod", "group": "normal" },
    { "id": "hongniu", "name": "红牛资源", "baseUrl": "https://www.hongniuzy2.com/api.php/provide/vod", "group": "normal" },
    { "id": "guangsu", "name": "光速资源", "baseUrl": "https://api.guangsuapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "ikun", "name": "iKun资源", "baseUrl": "https://ikunzyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "youku", "name": "优酷资源", "baseUrl": "https://api.ukuapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "huya", "name": "虎牙资源", "baseUrl": "https://www.huyaapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "xinlang", "name": "新浪资源", "baseUrl": "http://api.xinlangapi.com/xinlangapi.php/provide/vod", "group": "normal" },
    { "id": "lezi", "name": "乐子资源", "baseUrl": "https://cj.lziapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "haihua", "name": "海豚资源", "baseUrl": "https://hhzyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "jiangyu", "name": "鲸鱼资源", "baseUrl": "https://jyzyapi.com/provide/vod", "group": "normal" },
    { "id": "aidan", "name": "爱蛋资源", "baseUrl": "https://lovedan.net/api.php/provide/vod", "group": "normal" },
    { "id": "moduzy", "name": "魔都影视", "baseUrl": "https://www.moduzy.com/api.php/provide/vod", "group": "normal" },
    { "id": "feifanapi", "name": "非凡API", "baseUrl": "https://api.ffzyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "feifancj", "name": "非凡采集", "baseUrl": "http://cj.ffzyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "feifancj2", "name": "非凡采集HTTPS", "baseUrl": "https://cj.ffzyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "feifan1", "name": "非凡线路1", "baseUrl": "http://ffzy1.tv/api.php/provide/vod", "group": "normal" },
    { "id": "wolong2", "name": "卧龙采集", "baseUrl": "https://collect.wolongzyw.com/api.php/provide/vod", "group": "normal" },
    { "id": "baofeng2", "name": "暴风APP", "baseUrl": "https://app.bfzyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "wujin2", "name": "无尽ME", "baseUrl": "https://api.wujinapi.me/api.php/provide/vod", "group": "normal" },
    { "id": "tianyazy", "name": "天涯海角", "baseUrl": "https://tyyszyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "guangsu2", "name": "光速HTTP", "baseUrl": "http://api.guangsuapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "xinlang2", "name": "新浪HTTPS", "baseUrl": "https://api.xinlangapi.com/xinlangapi.php/provide/vod", "group": "normal" },
    { "id": "yilingba2", "name": "1080JSON", "baseUrl": "https://api.1080zyku.com/inc/apijson.php", "group": "normal" },
    { "id": "lezi2", "name": "乐子HTTP", "baseUrl": "http://cj.lziapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "uku88", "name": "U酷资源88", "baseUrl": "https://api.ukuapi88.com/api.php/provide/vod", "group": "normal" },
    { "id": "wujincc", "name": "无尽CC", "baseUrl": "https://api.wujinapi.cc/api.php/provide/vod", "group": "normal" },
    { "id": "yaya", "name": "丫丫点播", "baseUrl": "https://cj.yayazy.net/api.php/provide/vod", "group": "normal" },
    { "id": "wolongcc", "name": "卧龙CC", "baseUrl": "https://collect.wolongzy.cc/api.php/provide/vod", "group": "normal" },
    { "id": "wujinnet", "name": "无尽NET", "baseUrl": "https://api.wujinapi.net/api.php/provide/vod", "group": "normal" },
    { "id": "wangwangapi", "name": "旺旺API", "baseUrl": "https://api.wwzy.tv/api.php/provide/vod", "group": "normal" },
    { "id": "zuidame", "name": "最大点播", "baseUrl": "http://zuidazy.me/api.php/provide/vod", "group": "normal" },
    { "id": "yinghua", "name": "樱花资源", "baseUrl": "https://m3u8.apiyhzy.com/api.php/provide/vod", "group": "normal" },
    { "id": "bubugao", "name": "步步高资源", "baseUrl": "https://api.yparse.com/api/json", "group": "normal" },
    { "id": "niuniu", "name": "牛牛点播", "baseUrl": "https://api.niuniuzy.me/api.php/provide/vod", "group": "normal" },
    { "id": "suoni", "name": "索尼资源", "baseUrl": "https://suoniapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "maotai", "name": "茅台资源", "baseUrl": "https://caiji.maotaizy.cc/api.php/provide/vod", "group": "normal" },
    { "id": "dbzy", "name": "豆瓣资源", "baseUrl": "https://dbzy.tv/api.php/provide/vod", "group": "normal" },
    { "id": "subo", "name": "速博资源", "baseUrl": "https://subocaiji.com/api.php/provide/vod", "group": "normal" },
    { "id": "jinying", "name": "金鹰点播", "baseUrl": "https://jinyingzy.com/api.php/provide/vod", "group": "normal" },
    { "id": "shandian", "name": "閃電资源", "baseUrl": "https://sdzyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "piaoling", "name": "飘零资源", "baseUrl": "https://p2100.net/api.php/provide/vod", "group": "normal" },
    { "id": "modudongman", "name": "魔都动漫", "baseUrl": "https://caiji.moduapi.cc/api.php/provide/vod", "group": "normal" },
    { "id": "hongniu3", "name": "红牛资源3", "baseUrl": "https://www.hongniuzy3.com/api.php/provide/vod", "group": "normal" },
    { "id": "suonisd", "name": "索尼-闪电", "baseUrl": "https://xsd.sdzyapi.com/api.php/provide/vod", "group": "normal" },
    { "id": "leba", "name": "乐播资源", "baseUrl": "https://lbapi9.com/api.php/provide/vod", "group": "premium" },
    { "id": "ck", "name": "CK", "baseUrl": "https://www.ckzy1.com/api.php/provide/vod", "group": "premium" },
    { "id": "jkun", "name": "jkun", "baseUrl": "https://jkunzyapi.com/api.php/provide/vod", "group": "premium" },
    { "id": "155", "name": "155", "baseUrl": "https://155api.com/api.php/provide/vod", "group": "premium" },
    { "id": "lsb", "name": "lsb", "baseUrl": "https://apilsbzy1.com/api.php/provide/vod", "group": "premium" },
    { "id": "hsck", "name": "黄色仓库", "baseUrl": "https://hsckzy.vip/api.php/provide/vod", "group": "premium" },
    { "id": "yutu", "name": "玉兔", "baseUrl": "https://yutuzy10.com/api.php/provide/vod", "group": "premium" },
    { "id": "msnii", "name": "美少女资源站", "baseUrl": "https://www.msnii.com/api/json.php", "group": "premium" },
    { "id": "xrbsp", "name": "淫水机资源站", "baseUrl": "https://www.xrbsp.com/api/json.php", "group": "premium" },
    { "id": "gdlsp", "name": "香奶儿资源站", "baseUrl": "https://www.gdlsp.com/api/json.php", "group": "premium" },
    { "id": "kxgav", "name": "白嫖资源站", "baseUrl": "https://www.kxgav.com/api/json.php", "group": "premium" },
    { "id": "pgxdy", "name": "黄AV资源站", "baseUrl": "https://www.pgxdy.com/api/json.php", "group": "premium" },
    { "id": "baiwan", "name": "百万资源", "baseUrl": "https://api.bwzyz.com/api.php/provide/vod", "group": "premium" },
    { "id": "madou", "name": "91麻豆", "baseUrl": "https://91md.me/api.php/provide/vod", "group": "premium" },
    { "id": "aosika", "name": "奥斯卡资源", "baseUrl": "https://aosikazy.com/api.php/provide/vod", "group": "premium" },
    { "id": "naixiang", "name": "奶香香", "baseUrl": "https://Naixxzy.com/api.php/provide/vod", "group": "premium" },
    { "id": "senlin", "name": "森林资源", "baseUrl": "https://slapibf.com/api.php/provide/vod", "group": "premium" },
    { "id": "fanhao", "name": "番号资源", "baseUrl": "http://fhapi9.com/api.php/provide/vod", "group": "premium" },
    { "id": "jingpin", "name": "精品资源", "baseUrl": "https://www.jingpinx.com/api.php/provide/vod", "group": "premium" },
    { "id": "shayu", "name": "鲨鱼资源", "baseUrl": "https://shayuapi.com/api.php/provide/vod", "group": "premium" },
    { "id": "xiaoji", "name": "小鸡资源", "baseUrl": "https://api.xiaojizy.live/provide/vod", "group": "premium" },
    { "id": "xibao", "name": "细胞采集", "baseUrl": "https://www.xxibaozyw.com/api.php/provide/vod", "group": "premium" }
];

// 动态生成菜单选项
const normalOptions = SOURCES.filter(s => s.group === "normal").map(s => ({ title: s.name, value: s.id }));
const premiumOptions = SOURCES.filter(s => s.group === "premium").map(s => ({ title: `🔥 ${s.name}`, value: s.id }));

// ================= 2. 模块元数据定义 =================
WidgetMetadata = {
    id: "vod_max_engine_makka",
    title: "VOD资源聚合",
    description: "内置海量采集接口（含18+）",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    version: "1.0.0",
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",
    detailCacheDuration: 3600,
    modules: [
        {
            title: "全网最新更新",
            functionName: "loadCmsList",
            type: "list",
            cacheDuration: 300,
            params: [
                {
                    name: "group",
                    title: "资源大区",
                    type: "enumeration",
                    value: "normal",
                    enumOptions: [
                        { title: "🟢 综合影视 (56个源)", value: "normal" },
                        { title: "🔴 特色/福利 (22个源)", value: "premium" }
                    ]
                },
                {
                    name: "source_normal",
                    title: "选择普通源",
                    type: "enumeration",
                    value: normalOptions[0] ? normalOptions[0].value : "",
                    belongTo: { paramName: "group", value: ["normal"] },
                    enumOptions: normalOptions
                },
                {
                    name: "source_premium",
                    title: "选择特色源",
                    type: "enumeration",
                    value: premiumOptions[0] ? premiumOptions[0].value : "",
                    belongTo: { paramName: "group", value: ["premium"] },
                    enumOptions: premiumOptions
                },
                { name: "page", title: "页码", type: "page", startPage: 1 }
            ]
        }
    ]
};

// ================= 3. 获取视频列表 (加入强制JSON与伪装头) =================
async function loadCmsList(params) {
    const page = params.page || 1;
    const group = params.group || "normal";
    const sourceId = group === "normal" ? params.source_normal : params.source_premium;
    const siteConfig = SOURCES.find(s => s.id === sourceId) || SOURCES[0];

    try {
        const response = await Widget.http.get(siteConfig.baseUrl, {
            params: {
                ac: "videolist",
                pg: page,
                out: "json" 
            },
            headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
                "Accept": "application/json, text/javascript, */*; q=0.01"
            },
            timeout: 10000
        });

        let data;
        if (typeof response.data === "string") {
            try {
                data = JSON.parse(response.data);
            } catch (e) {
                console.error("解析返回数据失败:", response.data.substring(0, 100));
                throw new Error("接口未返回JSON格式 (可能源失效或被防爬虫拦截)");
            }
        } else {
            data = response.data;
        }

        const list = data.list || [];
        if (list.length === 0) {
             return [{ id: "empty", type: "text", title: "没有数据", description: "此源当前页面下可能没有数据，请下拉刷新或更换源" }];
        }

        return list.map(item => {
            const detailLink = `${siteConfig.id}|${item.vod_id}`;
            return {
                id: detailLink, 
                type: "link", 
                title: item.vod_name,
                description: item.vod_remarks || item.vod_blurb || "暂无简介",
                coverUrl: item.vod_pic,
                link: detailLink, 
                subTitle: item.vod_time || ""
            };
        });

    } catch (error) {
        console.error("加载列表失败:", error);
        return [{ 
            id: "error", 
            type: "text", 
            title: "请求失败: " + siteConfig.name, 
            description: String(error.message || error) + " (请尝试切换其他源)"
        }];
    }
}

// ================= 4. 获取详情与解析播放地址 =================
async function loadDetail(link) {
    const parts = link.split("|");
    const sourceId = parts[0];
    const vodId = parts[1];
    const siteConfig = SOURCES.find(s => s.id === sourceId);

    if (!siteConfig) throw new Error("找不到源配置");

    try {
        const response = await Widget.http.get(siteConfig.baseUrl, {
            params: {
                ac: "detail",
                ids: vodId,
                out: "json"
            },
            headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
            },
            timeout: 10000
        });

        let data;
        if (typeof response.data === "string") {
            data = JSON.parse(response.data);
        } else {
            data = response.data;
        }

        const item = data.list[0];
        if (!item) throw new Error("未获取到视频详情");

        const playUrls = item.vod_play_url || "";
        const episodes = [];
        const playerGroups = playUrls.split("$$$");
        
        // 优先选择包含 m3u8 的播放组
        let targetGroup = playerGroups.find(g => g.includes(".m3u8")) || playerGroups[0];
        
        if (targetGroup) {
            const partsList = targetGroup.split("#");
            for (let p of partsList) {
                if (!p) continue;
                const [name, vUrl] = p.split("$");
                if (vUrl) {
                    episodes.push({
                        id: vUrl,
                        type: "url",
                        title: name || "正片",
                        videoUrl: vUrl
                    });
                }
            }
        }

        const cleanDesc = item.vod_content ? item.vod_content.replace(/<[^>]+>/g, "") : "";

        return [{
            id: link,
            type: "link",
            title: item.vod_name,
            description: cleanDesc,
            coverUrl: item.vod_pic,
            genreTitle: `${item.vod_year || ""} • ${item.vod_class || ""}`,
            episodeItems: episodes 
        }];

    } catch (error) {
        console.error("解析详情失败:", error);
        throw error;
    }
}
