/*
 * nxtv.js —— 宁夏网络广播电视台（www.nxtv.cn 看电视）直播源 mytv JS 脚本
 *
 * 频道（官网 19kds 页面，2026-09-21 核对）：
 *   nxws 宁夏卫视      https://hls.nxhhy.cn/live/nxws1M.m3u8
 *   nxgg 宁夏公共频道   https://hls.nxhhy.cn/live/nxgg1M.m3u8
 *   nxwl 宁夏文旅频道   https://hls.nxhhy.cn/live/nxwl1M.m3u8
 *
 * 协议要点：
 *   1) 官网把频道数据明文放在页面锚点 alt 属性 JSON 里（{name,poster,liveUrl}），无签名
 *   2) 官网给 nxwl 的地址在 hls.ningxiahuangheyun.com，该域名有 WAF（JS 挑战，非浏览器 403）；
 *      同一内容在 hls.nxhhy.cn/live/<name>1M.m3u8 直连可用，故统一走 nxhhy 域名
 *   3) 请求 nxhhy 会 302 到带 session 的 index.m3u8，播放器自动跟随；对 UA/Referer 无要求
 *   4) 经济频道/少儿频道已于 2026-06-09 停播（CDN 上 nxjj/nxse 地址虽在，内容不可信，不收录）
 *
 * 用法（mytv 频道地址）：
 *   ?id=nxws | nxgg | nxwl     单频道
 *   ?id=list（或不带参数）      全部频道 m3u8
 */

var CHANNELS = [
    { key: "nxws", name: "宁夏卫视",    url: "https://hls.nxhhy.cn/live/nxws1M.m3u8" },
    { key: "nxgg", name: "宁夏公共频道", url: "https://hls.nxhhy.cn/live/nxgg1M.m3u8" },
    { key: "nxwl", name: "宁夏文旅频道", url: "https://hls.nxhhy.cn/live/nxwl1M.m3u8" }
];

function findChannel(id) {
    var i;
    id = String(id);
    for (i = 0; i < CHANNELS.length; i++) if (CHANNELS[i].key === id) return CHANNELS[i];
    for (i = 0; i < CHANNELS.length; i++) if (CHANNELS[i].name.indexOf(id) >= 0 || id.indexOf(CHANNELS[i].name) >= 0) return CHANNELS[i];
    return null;
}

function main(paramstr) {
    var item = {};
    try { item = parseItems(paramstr || ''); } catch (e) { item = {}; }
    var id = item.id ? String(item.id) : 'list';
    try {
        if (!id || id === 'list') {
            var lines = ['#EXTM3U'];
            for (var i = 0; i < CHANNELS.length; i++) {
                lines.push('#EXTINF:-1 tvg-name="' + CHANNELS[i].name + '" group-title="宁夏广电",' + CHANNELS[i].name);
                lines.push(CHANNELS[i].url);
            }
            return JSON.stringify({ m3u8: lines.join('\n') });
        }
        var ch = findChannel(id);
        if (!ch) {
            var keys = [];
            for (var k = 0; k < CHANNELS.length; k++) keys.push(CHANNELS[k].key);
            return JSON.stringify({ url: '', error: '无效的频道ID: ' + id + '，可用：' + keys.join('、') + '、list' });
        }
        return JSON.stringify({ url: ch.url });
    } catch (e) {
        return JSON.stringify({ url: '', error: 'JS脚本执行出错：' + e.message });
    }
}
