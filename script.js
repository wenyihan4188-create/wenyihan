// ======================== 工具注册表 ========================
const toolsRegistry = [
    { id: "json", name: "JSON格式化/校验/压缩", category: "数据与接口", icon: "{}", desc: "美化、校验、压缩JSON" },
    { id: "jsonXml", name: "JSON ↔ XML 互转", category: "数据与接口", icon: "⇄", desc: "JSON与XML相互转换" },
    { id: "jsonDiff", name: "JSON对比(diff)", category: "数据与接口", icon: "≠", desc: "比较两个JSON差异" },
    { id: "xml", name: "XML格式化/校验", category: "数据与接口", icon: "📰", desc: "格式化并校验XML" },
    { id: "jwt", name: "JWT在线解码", category: "数据与接口", icon: "🔓", desc: "解码JWT令牌" },
    { id: "base64", name: "Base64编解码", category: "编码与解码", icon: "B64", desc: "文本与Base64互转" },
    { id: "urlcode", name: "URL编解码", category: "编码与解码", icon: "🔗", desc: "URL编码/解码" },
    { id: "htmlEntity", name: "HTML实体编解码", category: "编码与解码", icon: "&", desc: "HTML实体转义/反转义" },
    { id: "unicode", name: "Unicode ↔ 中文互转", category: "编码与解码", icon: "\\u", desc: "\\uXXXX 与中文转换" },
    { id: "imgBase64", name: "图片Base64编码", category: "编码与解码", icon: "🖼️", desc: "图片上传转Base64字符串" },
    { id: "regex", name: "正则表达式测试器", category: "文本处理", icon: ".*", desc: "匹配高亮显示" },
    { id: "textDiff", name: "文本差异对比", category: "文本处理", icon: "📝", desc: "比较两段文本差异" },
    { id: "textCase", name: "大小写转换 & 字符计数", category: "文本处理", icon: "Aa", desc: "转换大小写并统计" },
    { id: "textSort", name: "行排序/去重/反转", category: "文本处理", icon: "↕️", desc: "处理文本行" },
    { id: "timestamp", name: "时间戳 ↔ 日期互转", category: "时间相关", icon: "⏱️", desc: "支持秒/毫秒" },
    { id: "cron", name: "Cron表达式解析", category: "时间相关", icon: "⏰", desc: "解析并预览最近执行时间" },
    { id: "hash", name: "哈希生成(MD5/SHA)", category: "加解密", icon: "🔐", desc: "MD5, SHA-256/512" },
    { id: "hmac", name: "HMAC生成", category: "加解密", icon: "🔑", desc: "HMAC-SHA256等" },
    { id: "aes", name: "AES加解密", category: "加解密", icon: "🔒", desc: "对称加密解密" },
    { id: "rsa", name: "RSA密钥对生成 & 加解密", category: "加解密", icon: "🔏", desc: "生成密钥对，加解密" },
    { id: "mockdata", name: "伪数据生成器", category: "数据生成", icon: "📊", desc: "姓名/邮箱/手机/地址" },
    { id: "idcard", name: "身份证号生成/校验", category: "数据生成", icon: "🆔", desc: "中国大陆规则" },
    { id: "bankcard", name: "银行卡号生成/校验", category: "数据生成", icon: "💳", desc: "Luhn算法" },
    { id: "random", name: "随机字符串/UUID生成", category: "数据生成", icon: "🎲", desc: "生成随机内容" }
];

const categories = [...new Map(toolsRegistry.map(t => [t.category, true])).keys()];

let activeToolId = "json";
let favoriteIds = JSON.parse(localStorage.getItem("devbox_fav") || "[]");
let toolsState = {};
let searchKeyword = "";

function saveFav() { localStorage.setItem("devbox_fav", JSON.stringify(favoriteIds)); }
function toggleStar(id) {
    if(favoriteIds.includes(id)) favoriteIds = favoriteIds.filter(f=>f!==id);
    else favoriteIds.push(id);
    saveFav();
    renderMenu();
    if(activeToolId === id) renderCurrentTool();
}
function showToast(msg) {
    let t = document.getElementById("toastMsg");
    t.innerText = msg;
    t.style.opacity = "1";
    setTimeout(()=> t.style.opacity = "0", 1800);
}
function copyToClip(text) {
    navigator.clipboard.writeText(text);
    showToast("已复制到剪贴板");
}

function initTheme() {
    let dark = localStorage.getItem("theme") === "dark";
    if(dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    document.getElementById("hljs-light").disabled = dark;
    document.getElementById("hljs-dark").disabled = !dark;
}
function toggleTheme() {
    document.body.classList.toggle("dark");
    let isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.getElementById("hljs-light").disabled = isDark;
    document.getElementById("hljs-dark").disabled = !isDark;
}

function renderMenu() {
    const container = document.getElementById("menuContainer");
    let filteredTools = toolsRegistry.filter(t => t.name.toLowerCase().includes(searchKeyword.toLowerCase()));
    let favoriteTools = filteredTools.filter(t => favoriteIds.includes(t.id));
    let normalTools = filteredTools.filter(t => !favoriteIds.includes(t.id));
    let html = '';
    if(favoriteTools.length && !searchKeyword) {
        html += `<div class="category"><div class="category-header" data-cat="⭐我的常用"><span><i class="fas fa-star"></i> ⭐我的常用</span><i class="fas fa-chevron-down arrow"></i></div><div class="tools-list">`;
        favoriteTools.forEach(t=>html+=toolItemHtml(t));
        html+=`</div></div>`;
    }
    let groupByCat = new Map();
    normalTools.forEach(t=>{ if(!groupByCat.has(t.category)) groupByCat.set(t.category,[]); groupByCat.get(t.category).push(t); });
    for(let cat of categories) {
        let items = groupByCat.get(cat);
        if(!items || items.length===0) continue;
        html += `<div class="category" data-cat="${cat}"><div class="category-header"><span><i class="fas fa-folder-open"></i> ${cat}</span><i class="fas fa-chevron-down arrow"></i></div><div class="tools-list">`;
        items.forEach(t=>html+=toolItemHtml(t));
        html+=`</div></div>`;
    }
    container.innerHTML = html;
    document.querySelectorAll(".category-header").forEach(header=>{
        header.addEventListener("click",(e)=>{
            let catDiv = header.closest(".category");
            catDiv.classList.toggle("collapsed");
        });
    });
    document.querySelectorAll(".tool-item").forEach(el=>{
        if(el.dataset.id === activeToolId) el.classList.add("active");
    });
    attachToolEvents();
}
function toolItemHtml(t){
    let starIcon = favoriteIds.includes(t.id) ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    return `<li class="tool-item glare-hover" data-id="${t.id}"><div class="tool-left"><span class="tool-icon">${t.icon}</span><span>${t.name}</span></div><button class="star-btn" data-id="${t.id}">${starIcon}</button></li>`;
}
function attachToolEvents(){
    document.querySelectorAll(".tool-item").forEach(item=>{
        item.addEventListener("click",(e)=>{
            if(e.target.closest(".star-btn")) return;
            let id = item.dataset.id;
            if(id) switchTool(id);
        });
        let starBtn = item.querySelector(".star-btn");
        if(starBtn) starBtn.addEventListener("click",(e)=>{
            e.stopPropagation();
            toggleStar(starBtn.dataset.id);
        });
    });
}
function switchTool(id){
    activeToolId = id;
    window.location.hash = `tool=${id}`;
    renderCurrentTool();
    renderMenu();
}

function buildConfigUI(container, id) {
    if(id === "json") {
        container.innerHTML = `<div class="config-group"><label>操作</label><select id="jsonAction"><option>美化</option><option>压缩</option></select></div>`;
    } else if(id === "jsonXml") {
        container.innerHTML = `<div class="config-group"><label>转换方向</label><select id="jsonXmlDir"><option>JSON→XML</option><option>XML→JSON</option></select></div>`;
    } else if(id === "xml") {
        container.innerHTML = `<div class="config-group"><label>操作</label><select id="xmlAction"><option>格式化</option><option>压缩</option></select></div>`;
    } else if(id === "base64") {
        container.innerHTML = `<div class="config-group"><label>操作</label><select id="b64Action"><option>编码</option><option>解码</option></select></div>`;
    } else if(id === "urlcode") {
        container.innerHTML = `<div class="config-group"><label>操作</label><select id="urlAction"><option>编码</option><option>解码</option></select></div>`;
    } else if(id === "htmlEntity") {
        container.innerHTML = `<div class="config-group"><label>操作</label><select id="htmlAction"><option>编码(转义)</option><option>解码(反转义)</option></select></div>`;
    } else if(id === "unicode") {
        container.innerHTML = `<div class="config-group"><label>操作</label><select id="unicodeAction"><option>中文→Unicode</option><option>Unicode→中文</option></select></div>`;
    } else if(id === "imgBase64") {
        container.innerHTML = `<div class="config-group"><label>选择图片</label><input type="file" id="imgFile" accept="image/*"></div><div class="config-group"><label>输出格式</label><select id="imgFormat"><option>dataURL(CSS可用)</option><option>纯Base64(无头部)</option><option>HTML img标签</option></select></div>`;
    } else if(id === "regex") {
        container.innerHTML = `<div class="config-group"><label>正则表达式</label><input id="regexPattern" placeholder="例如: \\d+"></div>
        <div class="config-group"><label>标志</label><select id="regexFlag"><option value="">无</option><option value="g">g (全局)</option><option value="i">i (忽略大小写)</option><option value="m">m (多行)</option><option value="gi">gi</option><option value="gm">gm</option><option value="im">im</option><option value="gim">gim</option></select></div>`;
    } else if(id === "textCase") {
        container.innerHTML = `<div class="config-group"><label>转换</label><select id="caseAction"><option>大写</option><option>小写</option><option>首字母大写</option><option>驼峰命名</option><option>字符计数统计</option></select></div>`;
    } else if(id === "textSort") {
        container.innerHTML = `<div class="config-group"><label>操作</label><select id="sortAction"><option>按行排序(字典)</option><option>去重</option><option>反转行</option><option>随机打乱</option></select></div>`;
    } else if(id === "timestamp") {
        container.innerHTML = `<div class="config-group"><label>单位</label><select id="tsUnit"><option>秒</option><option>毫秒</option></select></div>
        <div class="config-group"><label>操作</label><select id="tsAction"><option>时间戳→日期</option><option>日期→时间戳</option></select></div>`;
    } else if(id === "cron") {
        container.innerHTML = `<div class="config-group"><label>Cron表达式</label><input id="cronExpr" placeholder="* * * * *" value="0 9 * * *"></div><div class="config-group"><label>最近N次</label><input id="cronCount" type="number" value="5"></div>`;
    } else if(id === "hash") {
        container.innerHTML = `<div class="config-group"><label>算法</label><select id="hashAlgo"><option>MD5</option><option>SHA-256</option><option>SHA-512</option></select></div>`;
    } else if(id === "hmac") {
        container.innerHTML = `<div class="config-group"><label>算法</label><select id="hmacAlgo"><option>SHA-256</option><option>SHA-1</option><option>MD5</option></select></div>
        <div class="config-group"><label>密钥</label><input id="hmacKey" placeholder="secret"></div>`;
    } else if(id === "aes") {
        container.innerHTML = `<div class="config-group"><label>模式</label><select id="aesMode"><option>CBC</option><option>ECB</option></select></div>
        <div class="config-group"><label>密钥(16/24/32字节)</label><input id="aesKey" value="1234567890123456"></div>
        <div class="config-group"><label>IV(仅CBC)</label><input id="aesIv" value="1234567890123456"></div>
        <div class="config-group"><label>操作</label><select id="aesAction"><option>加密</option><option>解密</option></select></div>`;
    } else if(id === "rsa") {
        container.innerHTML = `<div class="config-group"><label>操作</label><select id="rsaAction"><option>生成密钥对</option><option>加密</option><option>解密</option></select></div>
        <div class="config-group" id="rsaKeyGroup"><label>公钥(加密用)</label><textarea id="rsaPub" rows="3"></textarea><label>私钥(解密用)</label><textarea id="rsaPri" rows="3"></textarea></div>`;
    } else if(id === "mockdata") {
        container.innerHTML = `<div class="config-group"><label>类型</label><select id="mockType"><option>姓名</option><option>邮箱</option><option>手机号</option><option>地址</option></select></div>
        <div class="config-group"><label>数量</label><input id="mockCount" type="number" value="5" min="1" max="20"></div>`;
    } else if(id === "idcard") {
        container.innerHTML = `<div class="config-group"><label>操作</label><select id="idcardAction"><option>生成随机身份证</option><option>校验身份证号</option></select></div>
        <div id="idcardInputArea" style="display:none;"><textarea id="idcardNum" placeholder="输入18位身份证号"></textarea></div>
        <div class="config-group" id="idcardGenCount" style="display:block;"><label>生成数量</label><input id="idcardCount" type="number" value="5" min="1" max="10"></div>`;
    } else if(id === "bankcard") {
        container.innerHTML = `<div class="config-group"><label>操作</label><select id="bankcardAction"><option>生成随机卡号(Luhn)</option><option>校验卡号</option></select></div>
        <div id="bankcardInputArea" style="display:none;"><input id="bankcardNum" placeholder="输入卡号"></div>
        <div class="config-group" id="bankcardGenCount" style="display:block;"><label>生成数量</label><input id="bankcardCount" type="number" value="5" min="1" max="10"></div>`;
    } else if(id === "random") {
        container.innerHTML = `<div class="config-group"><label>类型</label><select id="randType"><option>UUID v4</option><option>随机字符串(字母数字)</option><option>随机整数</option></select></div>
        <div class="config-group"><label>长度(字符串) / 最大值(整数)</label><input id="randLen" value="16"></div>
        <div class="config-group"><label>生成数量</label><input id="randCount" type="number" value="5" min="1" max="20"></div>`;
    } else if(id === "jwt") {
        // JWT 不需要配置区，清空
        container.innerHTML = `<div class="config-group">✨ 直接粘贴JWT令牌即可解码</div>`;
    } else if(id === "jsonDiff" || id === "textDiff") {
        // 双输入工具在配置区不显示额外内容，只显示一个对比提示
        container.innerHTML = `<div class="config-group">✅ 请在上方两个输入框中分别填写待比较的内容</div>`;
    } else {
        container.innerHTML = `<div class="config-group">⚙️ 配置项</div>`;
    }

    // 动态显示校验输入框
    if(id === "idcard") {
        let sel = document.getElementById("idcardAction");
        if(sel) sel.addEventListener("change",()=>{
            let area = document.getElementById("idcardInputArea");
            let countDiv = document.getElementById("idcardGenCount");
            area.style.display = sel.value === "校验身份证号" ? "block" : "none";
            countDiv.style.display = sel.value === "生成随机身份证" ? "block" : "none";
        });
        sel?.dispatchEvent(new Event("change"));
    }
    if(id === "bankcard") {
        let sel = document.getElementById("bankcardAction");
        if(sel) sel.addEventListener("change",()=>{
            let area = document.getElementById("bankcardInputArea");
            let countDiv = document.getElementById("bankcardGenCount");
            area.style.display = sel.value === "校验卡号" ? "block" : "none";
            countDiv.style.display = sel.value === "生成随机卡号(Luhn)" ? "block" : "none";
        });
        sel?.dispatchEvent(new Event("change"));
    }
}

function getConfigValues(id) {
    try {
        if(id === "json") return { action: document.getElementById("jsonAction")?.value };
        if(id === "jsonXml") return { dir: document.getElementById("jsonXmlDir")?.value };
        if(id === "xml") return { action: document.getElementById("xmlAction")?.value };
        if(id === "base64") return { action: document.getElementById("b64Action")?.value };
        if(id === "urlcode") return { action: document.getElementById("urlAction")?.value };
        if(id === "htmlEntity") return { action: document.getElementById("htmlAction")?.value };
        if(id === "unicode") return { action: document.getElementById("unicodeAction")?.value };
        if(id === "imgBase64") return { file: document.getElementById("imgFile")?.files[0], format: document.getElementById("imgFormat")?.value };
        if(id === "regex") return { pattern: document.getElementById("regexPattern")?.value, flag: document.getElementById("regexFlag")?.value };
        if(id === "textCase") return { action: document.getElementById("caseAction")?.value };
        if(id === "textSort") return { action: document.getElementById("sortAction")?.value };
        if(id === "timestamp") return { unit: document.getElementById("tsUnit")?.value, action: document.getElementById("tsAction")?.value };
        if(id === "cron") return { expr: document.getElementById("cronExpr")?.value, count: parseInt(document.getElementById("cronCount")?.value) || 5 };
        if(id === "hash") return { algo: document.getElementById("hashAlgo")?.value };
        if(id === "hmac") return { algo: document.getElementById("hmacAlgo")?.value, key: document.getElementById("hmacKey")?.value };
        if(id === "aes") return { mode: document.getElementById("aesMode")?.value, key: document.getElementById("aesKey")?.value, iv: document.getElementById("aesIv")?.value, action: document.getElementById("aesAction")?.value };
        if(id === "rsa") return { action: document.getElementById("rsaAction")?.value, pub: document.getElementById("rsaPub")?.value, pri: document.getElementById("rsaPri")?.value };
        if(id === "mockdata") return { type: document.getElementById("mockType")?.value, count: parseInt(document.getElementById("mockCount")?.value) || 1 };
        if(id === "idcard") return { action: document.getElementById("idcardAction")?.value, num: document.getElementById("idcardNum")?.value, count: parseInt(document.getElementById("idcardCount")?.value) || 1 };
        if(id === "bankcard") return { action: document.getElementById("bankcardAction")?.value, num: document.getElementById("bankcardNum")?.value, count: parseInt(document.getElementById("bankcardCount")?.value) || 1 };
        if(id === "random") return { type: document.getElementById("randType")?.value, len: parseInt(document.getElementById("randLen")?.value) || 16, count: parseInt(document.getElementById("randCount")?.value) || 1 };
        if(id === "jwt") return {};
        if(id === "jsonDiff" || id === "textDiff") return {};
        return {};
    } catch(e) { return {}; }
}

function escapeXml(str) {
    return str.replace(/[<>&]/g, m => ({'<':'&lt;','>':'&gt;','&':'&amp;'})[m]);
}

function jsonToXml(obj, rootName = "root") {
    let xml = `<${rootName}>`;
    for(let key in obj) {
        let value = obj[key];
        if(value === null || value === undefined) continue;
        if(typeof value === "object") {
            xml += jsonToXml(value, key);
        } else {
            xml += `<${key}>${escapeXml(String(value))}</${key}>`;
        }
    }
    xml += `</${rootName}>`;
    return xml;
}

async function executeToolLogic(id, input, cfg, secondInput = "") {
    switch(id) {
        case "json":
            try {
                let obj = JSON.parse(input);
                if(cfg.action === "压缩") return JSON.stringify(obj);
                else return JSON.stringify(obj, null, 2);
            } catch(e) { throw new Error("无效JSON"); }
        case "jsonXml":
            if(cfg.dir === "JSON→XML") {
                let obj = JSON.parse(input);
                return jsonToXml(obj, "root");
            } else {
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(input, "text/xml");
                if(xmlDoc.getElementsByTagName("parsererror").length) throw new Error("XML格式错误");
                function xmlToJson(node) {
                    let obj = {};
                    if(node.nodeType === 1) {
                        if(node.children.length === 0) {
                            obj[node.nodeName] = node.textContent;
                        } else {
                            for(let child of node.children) {
                                let childObj = xmlToJson(child);
                                let key = child.nodeName;
                                if(obj[key]) {
                                    if(!Array.isArray(obj[key])) obj[key] = [obj[key]];
                                    obj[key].push(childObj[key]);
                                } else {
                                    obj[key] = childObj[key];
                                }
                            }
                        }
                    }
                    return obj;
                }
                let result = xmlToJson(xmlDoc.documentElement);
                return JSON.stringify(result, null, 2);
            }
        case "jsonDiff":
            try {
                let obj1 = JSON.parse(input);
                let obj2 = JSON.parse(secondInput);
                function diff(obj1, obj2, path="") {
                    let changes = [];
                    let allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
                    for(let key of allKeys) {
                        let newPath = path ? `${path}.${key}` : key;
                        if(!(key in obj1)) changes.push(`+ ${newPath}: ${JSON.stringify(obj2[key])}`);
                        else if(!(key in obj2)) changes.push(`- ${newPath}: ${JSON.stringify(obj1[key])}`);
                        else if(typeof obj1[key] === "object" && typeof obj2[key] === "object") changes.push(...diff(obj1[key], obj2[key], newPath));
                        else if(obj1[key] !== obj2[key]) changes.push(`~ ${newPath}: ${JSON.stringify(obj1[key])} → ${JSON.stringify(obj2[key])}`);
                    }
                    return changes;
                }
                let diffs = diff(obj1, obj2);
                return diffs.length ? diffs.join("\n") : "两个JSON完全相同";
            } catch(e) { throw new Error("JSON解析失败: " + e.message); }
        case "xml":
            try {
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(input, "text/xml");
                if(xmlDoc.getElementsByTagName("parsererror").length) throw new Error("XML格式错误");
                let serializer = new XMLSerializer();
                let formatted = serializer.serializeToString(xmlDoc);
                if(cfg.action === "压缩") {
                    return formatted.replace(/>\s+</g, "><").trim();
                } else {
                    return formatted;
                }
            } catch(e) { throw new Error("无效XML: " + e.message); }
        case "jwt":
            try {
                let parts = input.split(".");
                if(parts.length !== 3) throw new Error("Invalid JWT");
                let header = JSON.parse(atob(parts[0]));
                let payload = JSON.parse(atob(parts[1]));
                let signature = parts[2];
                return `Header:\n${JSON.stringify(header, null, 2)}\n\nPayload:\n${JSON.stringify(payload, null, 2)}\n\nSignature: ${signature}`;
            } catch(e) { throw new Error("无效JWT格式"); }
        case "base64":
            if(cfg.action === "编码") return btoa(unescape(encodeURIComponent(input)));
            else return decodeURIComponent(escape(atob(input)));
        case "urlcode":
            if(cfg.action === "编码") {
                let encoded = encodeURIComponent(input);
                encoded = encoded.replace(/%20/g, '+');
                return encoded;
            } else {
                let decoded = input.replace(/\+/g, '%20');
                return decodeURIComponent(decoded);
            }
        case "htmlEntity":
            if(cfg.action === "编码(转义)") {
                return input.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]);
            } else {
                return input.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
            }
        case "unicode":
            if(cfg.action === "中文→Unicode") return input.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4,'0')).join('');
            else return input.replace(/\\u([0-9a-fA-F]{4})/g, (_,hex) => String.fromCharCode(parseInt(hex,16)));
        case "imgBase64":
            if(!cfg.file) throw new Error("请选择图片");
            return new Promise((resolve,reject)=>{
                let reader = new FileReader();
                reader.onload = (e) => {
                    let dataUrl = e.target.result;
                    if(cfg.format === "纯Base64(无头部)") resolve(dataUrl.split(',')[1]);
                    else if(cfg.format === "HTML img标签") resolve(`<img src="${dataUrl}" alt="base64 image">`);
                    else resolve(dataUrl);
                };
                reader.onerror = reject;
                reader.readAsDataURL(cfg.file);
            });
        case "regex":
            try {
                let re = new RegExp(cfg.pattern, cfg.flag);
                let matches = [...input.matchAll(re)];
                if(matches.length === 0) return "无匹配";
                let output = matches.map(m => `匹配: ${m[0]} | 位置: ${m.index}`).join("\n");
                return output;
            } catch(e) { throw new Error("正则表达式错误: " + e.message); }
        case "textDiff":
            let diffLib = Diff;
            let diff = diffLib.diffWords(input, secondInput);
            return diff.map(part => part.added ? `++${part.value}` : part.removed ? `--${part.value}` : part.value).join("");
        case "textCase":
            let text = input;
            if(cfg.action === "大写") return text.toUpperCase();
            if(cfg.action === "小写") return text.toLowerCase();
            if(cfg.action === "首字母大写") return text.replace(/\b\w/g, c=>c.toUpperCase());
            if(cfg.action === "驼峰命名") {
                return text.replace(/[-_\s]+(.)?/g, (_,c) => c ? c.toUpperCase() : '').replace(/^[A-Z]/, c=>c.toLowerCase());
            }
            if(cfg.action === "字符计数统计") {
                return `字符总数: ${text.length}\n单词数: ${text.trim().split(/\s+/).length}\n行数: ${text.split(/\r?\n/).length}`;
            }
            return text;
        case "textSort":
            let lines = input.split(/\r?\n/);
            if(cfg.action === "按行排序(字典)") lines.sort();
            else if(cfg.action === "去重") lines = [...new Set(lines)];
            else if(cfg.action === "反转行") lines.reverse();
            else if(cfg.action === "随机打乱") lines.sort(()=>Math.random()-0.5);
            return lines.join("\n");
        case "timestamp":
            if(cfg.action === "时间戳→日期") {
                let ts = parseFloat(input);
                if(isNaN(ts)) throw new Error("请输入数字时间戳");
                let multiplier = cfg.unit === "秒" ? 1000 : 1;
                let date = new Date(ts * multiplier);
                if(isNaN(date)) throw new Error("无效时间戳");
                return date.toLocaleString();
            } else {
                let d = new Date(input);
                if(isNaN(d)) throw new Error("无效日期格式，请使用 YYYY-MM-DD 或 ISO格式");
                let timestamp = cfg.unit === "秒" ? Math.floor(d/1000) : d.getTime();
                return timestamp.toString();
            }
        case "cron":
            return "Cron表达式解析演示：\n表达式 '0 9 * * *' 表示每天9:00执行。\n最近5次: 明天 09:00, 后天 09:00 ... (完整实现需 cron-parser 库)";
        case "hash":
            let hash;
            if(cfg.algo === "MD5") hash = CryptoJS.MD5(input);
            else if(cfg.algo === "SHA-256") hash = CryptoJS.SHA256(input);
            else hash = CryptoJS.SHA512(input);
            return hash.toString();
        case "hmac":
            let hmac;
            if(cfg.algo === "MD5") hmac = CryptoJS.HmacMD5(input, cfg.key);
            else if(cfg.algo === "SHA-1") hmac = CryptoJS.HmacSHA1(input, cfg.key);
            else hmac = CryptoJS.HmacSHA256(input, cfg.key);
            return hmac.toString();
        case "aes":
            let key = CryptoJS.enc.Utf8.parse(cfg.key);
            let iv = CryptoJS.enc.Utf8.parse(cfg.iv || "0000000000000000");
            let mode = cfg.mode === "CBC" ? CryptoJS.mode.CBC : CryptoJS.mode.ECB;
            if(cfg.action === "加密") {
                let encrypted = CryptoJS.AES.encrypt(input, key, { iv, mode, padding: CryptoJS.pad.Pkcs7 });
                return encrypted.toString();
            } else {
                let decrypted = CryptoJS.AES.decrypt(input, key, { iv, mode, padding: CryptoJS.pad.Pkcs7 });
                let result = decrypted.toString(CryptoJS.enc.Utf8);
                if(!result) throw new Error("解密失败，请检查密钥/密文是否正确");
                return result;
            }
        case "rsa":
            if(cfg.action === "生成密钥对") {
                let crypt = new JSEncrypt({default_key_size: "1024"});
                let pubKey = crypt.getPublicKey();
                let priKey = crypt.getPrivateKey();
                return `公钥:\n${pubKey}\n\n私钥:\n${priKey}`;
            } else if(cfg.action === "加密") {
                let crypt = new JSEncrypt();
                crypt.setPublicKey(cfg.pub);
                let encrypted = crypt.encrypt(input);
                if(!encrypted) throw new Error("加密失败，请检查公钥格式");
                return encrypted;
            } else {
                let crypt = new JSEncrypt();
                crypt.setPrivateKey(cfg.pri);
                let decrypted = crypt.decrypt(input);
                if(!decrypted) throw new Error("解密失败，请检查私钥或密文");
                return decrypted;
            }
        case "mockdata":
            let mockList = [];
            let names = ["李明","王芳","张伟","刘强","陈丽","赵刚","周敏","吴迪","郑爽","林晨"];
            let emails = ["@example.com", "@test.com", "@demo.org"];
            for(let i=0; i<cfg.count; i++) {
                if(cfg.type === "姓名") mockList.push(names[i % names.length] + (Math.floor(Math.random()*100)+1));
                else if(cfg.type === "邮箱") mockList.push(`user${i+1}${emails[i%emails.length]}`);
                else if(cfg.type === "手机号") mockList.push(`1${Math.floor(Math.random()*3)+3}${Math.floor(Math.random()*100000000).toString().padStart(8,'0')}`);
                else mockList.push(`中国北京市朝阳区街道${i+1}号`);
            }
            return mockList.join("\n");
        case "idcard":
            function generateOneIdCard() {
                const areaCodes = ["110101","110105","120101","310101","440301","440304","510107","330106","350203","370202"];
                let area = areaCodes[Math.floor(Math.random() * areaCodes.length)];
                let start = new Date(1960,0,1);
                let end = new Date(2020,11,31);
                let birthDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
                let year = birthDate.getFullYear();
                let month = (birthDate.getMonth()+1).toString().padStart(2,'0');
                let day = birthDate.getDate().toString().padStart(2,'0');
                let birth = `${year}${month}${day}`;
                let seq = Math.floor(Math.random() * 1000).toString().padStart(3,'0');
                let body = area + birth + seq;
                let factors = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];
                let sum = 0;
                for(let i=0;i<17;i++) sum += parseInt(body[i]) * factors[i];
                let check = ['1','0','X','9','8','7','6','5','4','3','2'][sum % 11];
                return body + check;
            }
            if(cfg.action === "生成随机身份证") {
                let cards = [];
                for(let i=0;i<cfg.count;i++) cards.push(generateOneIdCard());
                return cards.join("\n");
            } else {
                let id = cfg.num?.trim();
                if(!id) throw new Error("请输入身份证号");
                if(!/^\d{17}[\dXx]$/.test(id)) return "格式不正确（应为18位）";
                let factors = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];
                let sum = 0;
                for(let i=0;i<17;i++) sum += parseInt(id[i]) * factors[i];
                let expected = ['1','0','X','9','8','7','6','5','4','3','2'][sum % 11];
                if(expected === id[17].toUpperCase()) return "校验通过 ✓";
                else return "校验失败 ✗";
            }
        case "bankcard":
            function luhnCheck(card) {
                let sum = 0;
                let alternate = false;
                for(let i=card.length-1; i>=0; i--) {
                    let n = parseInt(card[i]);
                    if(alternate) { n *= 2; if(n>9) n-=9; }
                    sum += n;
                    alternate = !alternate;
                }
                return sum % 10 === 0;
            }
            function generateOneBankCard() {
                let prefix = "622848";
                let randomPart = String(Math.floor(Math.random()*100000000000)).slice(0,10);
                let body = prefix + randomPart;
                for(let i=0;i<=9;i++) {
                    if(luhnCheck(body + i)) return body + i;
                }
                return body + "0";
            }
            if(cfg.action === "生成随机卡号(Luhn)") {
                let cards = [];
                for(let i=0;i<cfg.count;i++) cards.push(generateOneBankCard());
                return cards.join("\n");
            } else {
                let card = cfg.num?.replace(/\s/g,'');
                if(!card) throw new Error("请输入卡号");
                if(luhnCheck(card)) return "卡号有效 (Luhn通过)";
                else return "卡号无效";
            }
        case "random":
            let results = [];
            if(cfg.type === "UUID v4") {
                for(let i=0;i<cfg.count;i++) {
                    let uuid = crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c=>{ let r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8); return v.toString(16); });
                    results.push(uuid);
                }
                return results.join("\n");
            } else if(cfg.type === "随机字符串(字母数字)") {
                let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                let len = Math.max(1, cfg.len);
                for(let i=0;i<cfg.count;i++) {
                    let str = "";
                    for(let j=0;j<len;j++) str += chars[Math.floor(Math.random()*chars.length)];
                    results.push(str);
                }
                return results.join("\n");
            } else {
                let max = Math.max(1, cfg.len);
                for(let i=0;i<cfg.count;i++) {
                    results.push(Math.floor(Math.random() * (max + 1)).toString());
                }
                return results.join("\n");
            }
        default:
            return "工具正在完善中...";
    }
}

function saveHistory(inp, out){
    let key = `hist_${activeToolId}`;
    let arr = JSON.parse(localStorage.getItem(key) || "[]");
    arr.unshift({ input: inp.slice(0,50), output: out.slice(0,80), time: Date.now() });
    if(arr.length > 5) arr.pop();
    localStorage.setItem(key, JSON.stringify(arr));
}
function renderHistoryList(){
    let key = `hist_${activeToolId}`;
    let arr = JSON.parse(localStorage.getItem(key) || "[]");
    let histDiv = document.getElementById("historyList");
    if(histDiv){
        histDiv.innerHTML = arr.map(h => `<div style="cursor:pointer;padding:4px;border-bottom:1px solid var(--border-light);" onclick="const input = document.getElementById('input1') || document.getElementById('toolInput'); if(input) input.value = '${h.input.replace(/'/g,"\\'")}'; document.getElementById('executeBtn')?.click();">📋 ${h.input} → ${h.output.slice(0,30)}</div>`).join("");
    }
}
function attachHistoryToggle(){
    let toggle = document.getElementById("historyToggle");
    if(toggle){
        toggle.addEventListener("click",()=>{
            let lst = document.getElementById("historyList");
            if(lst) lst.style.display = lst.style.display === "none" ? "block" : "none";
        });
    }
}

function isDualInputTool(id) {
    return id === "jsonDiff" || id === "textDiff";
}

function isNoInputTool(id) {
    return ["mockdata", "idcard", "bankcard", "random"].includes(id);
}

async function renderCurrentTool(){
    const mainEl = document.getElementById("mainContent");
    const tool = toolsRegistry.find(t=>t.id===activeToolId);
    if(!tool) return;
    let state = toolsState[activeToolId] || { input: "", output: "", config: {}, secondInput: "" };
    
    // 双输入框工具 (jsonDiff, textDiff)
    if(isDualInputTool(activeToolId)) {
        let label1 = activeToolId === "jsonDiff" ? "JSON 1" : "文本 1";
        let label2 = activeToolId === "jsonDiff" ? "JSON 2" : "文本 2";
        let placeholder1 = activeToolId === "jsonDiff" ? '{"key":"value"}' : "请输入第一段文本...";
        let placeholder2 = activeToolId === "jsonDiff" ? '{"key":"value"}' : "请输入第二段文本...";
        let html = `<div class="tool-header"><div class="title-area"><h2>${tool.name}</h2><p>${tool.desc}</p></div><div class="action-buttons"><button id="favBtnTool"><i class="${favoriteIds.includes(activeToolId)?'fas':'far'} fa-star"></i> 收藏</button><button id="copyOutputBtn"><i class="far fa-copy"></i> 复制输出</button><button id="clearBtn"><i class="fas fa-eraser"></i> 清空</button></div></div>
        <div class="tool-panel" style="grid-template-columns: 1fr 1fr 260px;">
            <div class="card"><h3>📥 ${label1}</h3><textarea id="input1" rows="10" placeholder="${placeholder1}"></textarea><div style="margin-top:8px;"><button id="sampleBtn1" style="background: var(--hover-bg); border:none; padding:4px 12px; border-radius:30px;">📋 示例</button><button id="pasteBtn1" style="background: var(--hover-bg); margin-left:8px;">📎 粘贴</button></div><div class="error-msg" id="error1"></div></div>
            <div class="card"><h3>📥 ${label2}</h3><textarea id="input2" rows="10" placeholder="${placeholder2}"></textarea><div style="margin-top:8px;"><button id="sampleBtn2" style="background: var(--hover-bg); border:none; padding:4px 12px; border-radius:30px;">📋 示例</button><button id="pasteBtn2" style="background: var(--hover-bg); margin-left:8px;">📎 粘贴</button></div><div class="error-msg" id="error2"></div></div>
            <div class="card"><h3>⚙️ 配置 & 输出</h3><div id="configArea"></div><button id="executeBtn" class="primary-btn">▶ 对比</button><div style="margin-top:16px;"><h4>📤 差异结果</h4><pre id="toolOutput" style="background: var(--bg-body); padding:12px; border-radius:12px; overflow:auto; max-height:300px;"></pre><div class="history-collapse"><span id="historyToggle" style="cursor:pointer;">📜 最近记录 ▼</span><div id="historyList" style="display:none; margin-top:8px;"></div></div></div></div>
        </div>`;
        mainEl.innerHTML = html;
        let input1 = document.getElementById("input1");
        let input2 = document.getElementById("input2");
        if(state.input) input1.value = state.input;
        if(state.secondInput) input2.value = state.secondInput;
        
        const configDiv = document.getElementById("configArea");
        buildConfigUI(configDiv, activeToolId);
        
        async function exec() {
            let val1 = input1.value;
            let val2 = input2.value;
            let outputResult = "";
            let error1 = document.getElementById("error1");
            let error2 = document.getElementById("error2");
            error1.innerText = "";
            error2.innerText = "";
            try {
                let result = await executeToolLogic(activeToolId, val1, getConfigValues(activeToolId), val2);
                outputResult = result;
                document.getElementById("toolOutput").innerHTML = outputResult.replace(/\n/g,'<br>');
            } catch(e) {
                outputResult = "Error: "+e.message;
                document.getElementById("toolOutput").innerHTML = outputResult;
                if(e.message.includes("JSON")) error1.innerText = e.message;
                else error2.innerText = e.message;
            }
            toolsState[activeToolId] = { input: val1, secondInput: val2, output: outputResult, config: getConfigValues(activeToolId) };
            saveHistory(val1 + " | " + val2, outputResult);
        }
        document.getElementById("executeBtn").addEventListener("click", exec);
        document.getElementById("sampleBtn1").addEventListener("click", ()=>{ input1.value = getSample(activeToolId); exec(); });
        document.getElementById("sampleBtn2").addEventListener("click", ()=>{ input2.value = getSecondSample(activeToolId); exec(); });
        document.getElementById("pasteBtn1").addEventListener("click", async ()=>{ input1.value = await navigator.clipboard.readText(); exec(); });
        document.getElementById("pasteBtn2").addEventListener("click", async ()=>{ input2.value = await navigator.clipboard.readText(); exec(); });
        document.getElementById("copyOutputBtn").addEventListener("click", ()=>{ let out=document.getElementById("toolOutput").innerText; copyToClip(out); });
        document.getElementById("clearBtn").addEventListener("click", ()=>{ input1.value = ""; input2.value = ""; document.getElementById("toolOutput").innerHTML = ""; });
        document.getElementById("favBtnTool").addEventListener("click",()=>{ toggleStar(activeToolId); renderCurrentTool(); });
        if(state.output) document.getElementById("toolOutput").innerHTML = state.output;
        else exec();
        renderHistoryList();
        attachHistoryToggle();
        return;
    }
    
    // 单输入或无需输入的工具
    let showInput = !isNoInputTool(activeToolId);
    let inputCardHtml = "";
    if(showInput) {
        inputCardHtml = `<div class="card"><h3>📥 输入</h3><textarea id="toolInput" rows="8" placeholder="请输入内容..."></textarea><div style="display:flex; gap:8px; margin-top:8px;"><button id="sampleBtn" class="secondary-btn" style="background: var(--hover-bg); border: none; padding:6px 12px; border-radius:30px;">📋 示例填充</button><button id="pasteBtn" style="background: var(--hover-bg);">📎 粘贴</button></div><div class="error-msg" id="inputError"></div></div>`;
    } else {
        inputCardHtml = `<div class="card"><h3>📥 说明</h3><div class="error-msg" style="color: var(--text-secondary);">此工具无需输入，请在右侧配置后点击执行。</div></div>`;
    }
    let html = `<div class="tool-header"><div class="title-area"><h2>${tool.name}</h2><p>${tool.desc}</p></div><div class="action-buttons"><button id="favBtnTool"><i class="${favoriteIds.includes(activeToolId)?'fas':'far'} fa-star"></i> 收藏</button><button id="copyOutputBtn"><i class="far fa-copy"></i> 复制输出</button><button id="clearBtn"><i class="fas fa-eraser"></i> 清空</button></div></div>
    <div class="tool-panel">${inputCardHtml}
        <div class="card"><h3>⚙️ 配置</h3><div id="configArea"></div><button id="executeBtn" class="primary-btn">▶ 执行</button></div>
        <div class="card"><h3>📤 输出 <button id="copyOutputInline" style="background: none; border:none;"><i class="far fa-copy"></i></button></h3><pre id="toolOutput" style="background: var(--bg-body); padding:12px; border-radius:12px; overflow:auto; max-height:260px;" class="output-area"></pre><div class="history-collapse"><span id="historyToggle" style="cursor:pointer;">📜 最近记录 ▼</span><div id="historyList" style="display:none; margin-top:8px;"></div></div></div></div>`;
    mainEl.innerHTML = html;
    
    let inputArea = showInput ? document.getElementById("toolInput") : null;
    if(showInput && state.input) inputArea.value = state.input;
    
    const configDiv = document.getElementById("configArea");
    buildConfigUI(configDiv, activeToolId);
    
    async function exec() {
        let inputVal = showInput ? (inputArea?.value || "") : "";
        let outputResult = "";
        let errorDiv = document.getElementById("inputError");
        try {
            let result = await executeToolLogic(activeToolId, inputVal, getConfigValues(activeToolId));
            outputResult = result;
            if(errorDiv) errorDiv.innerText = "";
            document.getElementById("toolOutput").innerHTML = outputResult.replace(/\n/g,'<br>');
        } catch(e) {
            outputResult = "Error: "+e.message;
            if(errorDiv) errorDiv.innerText = e.message;
            document.getElementById("toolOutput").innerHTML = outputResult;
        }
        if(showInput) toolsState[activeToolId] = { input: inputVal, output: outputResult, config: getConfigValues(activeToolId) };
        else toolsState[activeToolId] = { input: "", output: outputResult, config: getConfigValues(activeToolId) };
        saveHistory(inputVal, outputResult);
    }
    
    document.getElementById("executeBtn").addEventListener("click", exec);
    if(showInput) {
        document.getElementById("sampleBtn").addEventListener("click", async ()=>{ if(inputArea) inputArea.value = getSample(activeToolId); exec(); });
        document.getElementById("pasteBtn").addEventListener("click", async ()=>{ if(inputArea) inputArea.value = await navigator.clipboard.readText(); exec(); });
    }
    document.getElementById("copyOutputBtn").addEventListener("click", ()=>{ let out=document.getElementById("toolOutput").innerText; copyToClip(out); });
    document.getElementById("copyOutputInline").addEventListener("click", ()=>{ let out=document.getElementById("toolOutput").innerText; copyToClip(out); });
    document.getElementById("clearBtn").addEventListener("click", ()=>{ if(showInput && inputArea) inputArea.value = ""; document.getElementById("toolOutput").innerHTML = ""; if(document.getElementById("inputError")) document.getElementById("inputError").innerText = ""; });
    document.getElementById("favBtnTool").addEventListener("click",()=>{ toggleStar(activeToolId); renderCurrentTool(); });
    
    if(state.output && state.output !== "undefined") document.getElementById("toolOutput").innerHTML = state.output;
    else exec();
    renderHistoryList();
    attachHistoryToggle();
}

function getSample(id) {
    if(id === "json") return '{"name":"DevBox","version":"1.0"}';
    if(id === "jsonXml") return '{"code":1,"msg":"success","data":{"id":1,"userName":"admin"}}';
    if(id === "jsonDiff") return '{"name":"John","age":30}';
    if(id === "xml") return '<?xml version="1.0"?><root><item>test</item></root>';
    if(id === "jwt") return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    if(id === "base64") return "Hello 工具箱";
    if(id === "urlcode") return "Hello World! 你好";
    if(id === "htmlEntity") return "<div>Hello & World</div>";
    if(id === "unicode") return "你好世界";
    if(id === "regex") return "测试正则: 123 abc 456";
    if(id === "textDiff") return "这是第一段文本。\n它有多行内容。";
    if(id === "textCase") return "hello world, 你好";
    if(id === "textSort") return "banana\napple\ncherry";
    if(id === "timestamp") return String(Math.floor(Date.now()/1000));
    if(id === "cron") return "0 9 * * *";
    if(id === "hash") return "Hello World";
    if(id === "hmac") return "secret message";
    if(id === "aes") return "这是需要加密的文本";
    if(id === "rsa") return "RSA加密测试";
    return "示例数据";
}

function getSecondSample(id) {
    if(id === "jsonDiff") return '{"name":"John","age":31,"city":"New York"}';
    if(id === "textDiff") return "这是第二段文本。\n它有一些不同内容。";
    return "";
}

function handleHash(){
    let hash = location.hash.slice(1).split("=")[1];
    if(hash && toolsRegistry.find(t=>t.id===hash)) activeToolId = hash;
    renderCurrentTool();
    renderMenu();
}

window.addEventListener("hashchange", handleHash);
document.getElementById("themeToggle").addEventListener("click", toggleTheme);
document.getElementById("searchInput").addEventListener("input", (e)=>{ searchKeyword = e.target.value; renderMenu(); });
document.getElementById("mobileMenuBtn")?.addEventListener("click", ()=>{ let sidebar = document.querySelector(".sidebar"); sidebar.style.display = sidebar.style.display === "none" ? "flex" : "none"; });
document.getElementById("settingsBtn")?.addEventListener("click", ()=>{ alert("全局设置开发中"); });

initTheme();
handleHash();
renderMenu();