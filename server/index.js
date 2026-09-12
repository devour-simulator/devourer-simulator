const JSON_HEADERS = { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' };
const MAX_BODY_BYTES = 1_500_000;
const MAX_SAVE_BYTES = 1_200_000;
const SESSION_LIFETIME_SECONDS = 30 * 24 * 60 * 60;
const PBKDF2_ITERATIONS = 600_000;
const ALLOWED_ORIGINS = new Set([
    'https://devour-simulator.github.io',
    'https://devourer-simulator-lukex-2026.wiserazor.chatgpt.site'
]);

function corsHeaders(request) {
    const origin = request.headers.get('Origin');
    if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
    return {
        'Access-Control-Allow-Origin':origin,
        'Access-Control-Allow-Credentials':'true',
        'Access-Control-Allow-Headers':'Authorization, Content-Type',
        'Access-Control-Allow-Methods':'GET, POST, PUT, OPTIONS',
        'Access-Control-Max-Age':'86400',
        'Vary':'Origin'
    };
}

function json(request, value, status = 200) {
    return Response.json(value, { status, headers:{ ...JSON_HEADERS, ...corsHeaders(request) } });
}

async function readJson(request) {
    const declaredLength = Number(request.headers.get('Content-Length') || 0);
    if (declaredLength > MAX_BODY_BYTES) throw new ApiError(413, '提交的数据太大了。');
    if (!request.body) return {};
    const reader = request.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BODY_BYTES) {
            await reader.cancel();
            throw new ApiError(413, '提交的数据太大了。');
        }
        chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    try { return JSON.parse(new TextDecoder().decode(bytes)); }
    catch (_) { throw new ApiError(400, '提交内容格式不正确。'); }
}

class ApiError extends Error {
    constructor(status, message) { super(message); this.status = status; }
}

function normalizeUsername(value) {
    return String(value || '').trim().normalize('NFKC');
}

function validateCredentials(username, password) {
    if (!/^[A-Za-z0-9_\u3400-\u9fff]{3,16}$/u.test(username)) throw new ApiError(400, '账号名需为 3—16 个汉字、字母、数字或下划线。');
    if (typeof password !== 'string' || password.length < 8 || password.length > 64) throw new ApiError(400, '密码长度需为 8—64 个字符。');
}

function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

function toHex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(value) {
    if (typeof value !== 'string' || value.length % 2) return new Uint8Array();
    const bytes = new Uint8Array(value.length / 2);
    for (let index = 0; index < bytes.length; index++) bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
    return bytes;
}

function toBase64Url(bytes) {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256Hex(value) {
    const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
    return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)));
}

async function passwordHash(password, saltHex) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', salt:fromHex(saltHex), iterations:PBKDF2_ITERATIONS }, key, 256);
    return toHex(new Uint8Array(bits));
}

function safeEqualHex(left, right) {
    const a = fromHex(left), b = fromHex(right);
    if (a.byteLength !== b.byteLength) {
        if (a.byteLength) crypto.subtle.timingSafeEqual(a, a);
        return false;
    }
    return a.byteLength > 0 && crypto.subtle.timingSafeEqual(a, b);
}

function makeRecoveryCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = randomBytes(16);
    let code = '';
    for (let index = 0; index < 16; index++) code += alphabet[bytes[index] % alphabet.length];
    return code.match(/.{1,4}/g).join('-');
}

function normalizeRecoveryCode(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z2-9]/g, '');
}

async function recoveryHash(code, saltHex) {
    return sha256Hex(`${saltHex}:${normalizeRecoveryCode(code)}`);
}

async function applyRateLimit(request, env, action, username, limit) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = await sha256Hex(`${action}|${ip}|${username.toLocaleLowerCase('en-US')}`);
    const now = Math.floor(Date.now() / 1000), cutoff = now - 900;
    await env.DB.prepare(`
        INSERT INTO auth_attempts (attempt_key, attempt_count, window_started_at)
        VALUES (?, 1, ?)
        ON CONFLICT(attempt_key) DO UPDATE SET
            attempt_count = CASE WHEN window_started_at < ? THEN 1 ELSE attempt_count + 1 END,
            window_started_at = CASE WHEN window_started_at < ? THEN excluded.window_started_at ELSE window_started_at END
    `).bind(key, now, cutoff, cutoff).run();
    const row = await env.DB.prepare('SELECT attempt_count FROM auth_attempts WHERE attempt_key = ?').bind(key).first();
    if ((row?.attempt_count || 0) > limit) throw new ApiError(429, '尝试次数太多，请 15 分钟后再试。');
    return key;
}

async function clearRateLimit(env, key) {
    await env.DB.prepare('DELETE FROM auth_attempts WHERE attempt_key = ?').bind(key).run();
}

async function createSession(env, userId) {
    const token = toBase64Url(randomBytes(32));
    const tokenHash = await sha256Hex(token);
    const now = Math.floor(Date.now() / 1000), expiresAt = now + SESSION_LIFETIME_SECONDS;
    await env.DB.batch([
        env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now),
        env.DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').bind(tokenHash, userId, now, expiresAt)
    ]);
    return { token, expiresAt };
}

async function authenticatedUser(request, env) {
    const header = request.headers.get('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token || token.length > 128) throw new ApiError(401, '请先登录云账号。');
    const tokenHash = await sha256Hex(token);
    const now = Math.floor(Date.now() / 1000);
    const row = await env.DB.prepare(`
        SELECT users.id, users.username, sessions.token_hash
        FROM sessions JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ? AND sessions.expires_at > ?
    `).bind(tokenHash, now).first();
    if (!row) throw new ApiError(401, '登录已过期，请重新登录。');
    return { id:row.id, username:row.username, tokenHash };
}

function validateSaveData(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ApiError(400, '存档格式不正确。');
    const entries = Object.entries(data);
    if (entries.length > 1000) throw new ApiError(413, '存档项目太多。');
    for (const [key, value] of entries) {
        if (!key || key.length > 128 || typeof value !== 'string') throw new ApiError(400, '存档内容不完整。');
        if (key.startsWith('cloudAccount')) throw new ApiError(400, '存档中不能包含登录信息。');
    }
    const encoded = JSON.stringify({ game:'吞噬模拟器', version:1, data });
    if (new TextEncoder().encode(encoded).byteLength > MAX_SAVE_BYTES) throw new ApiError(413, '存档太大，暂时无法上传。');
    return encoded;
}

async function register(request, env) {
    const body = await readJson(request);
    const username = normalizeUsername(body.username), password = body.password;
    validateCredentials(username, password);
    const rateKey = await applyRateLimit(request, env, 'register', username, 6);
    const usernameKey = username.toLocaleLowerCase('en-US');
    const existing = await env.DB.prepare('SELECT id FROM users WHERE username_key = ?').bind(usernameKey).first();
    if (existing) throw new ApiError(409, '这个账号名已经被使用了，请换一个。');
    const passwordSalt = toHex(randomBytes(16));
    const passwordDigest = await passwordHash(password, passwordSalt);
    const recoveryCode = makeRecoveryCode(), recoverySalt = toHex(randomBytes(16));
    const recoveryDigest = await recoveryHash(recoveryCode, recoverySalt);
    const userId = crypto.randomUUID(), now = Math.floor(Date.now() / 1000);
    try {
        await env.DB.prepare(`
            INSERT INTO users (id, username, username_key, password_salt, password_hash, recovery_salt, recovery_hash, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(userId, username, usernameKey, passwordSalt, passwordDigest, recoverySalt, recoveryDigest, now, now).run();
    } catch (_) { throw new ApiError(409, '这个账号名已经被使用了，请换一个。'); }
    await clearRateLimit(env, rateKey);
    const session = await createSession(env, userId);
    return json(request, { ok:true, username, token:session.token, expiresAt:session.expiresAt, recoveryCode, hasSave:false }, 201);
}

async function login(request, env) {
    const body = await readJson(request);
    const username = normalizeUsername(body.username), password = body.password;
    validateCredentials(username, password);
    const rateKey = await applyRateLimit(request, env, 'login', username, 12);
    const user = await env.DB.prepare('SELECT id, username, password_salt, password_hash FROM users WHERE username_key = ?').bind(username.toLocaleLowerCase('en-US')).first();
    const candidate = user ? await passwordHash(password, user.password_salt) : await passwordHash(password, toHex(randomBytes(16)));
    if (!user || !safeEqualHex(candidate, user.password_hash)) throw new ApiError(401, '账号名或密码不正确。');
    await clearRateLimit(env, rateKey);
    const session = await createSession(env, user.id);
    const save = await env.DB.prepare('SELECT revision, updated_at FROM saves WHERE user_id = ?').bind(user.id).first();
    return json(request, { ok:true, username:user.username, token:session.token, expiresAt:session.expiresAt, hasSave:!!save, saveRevision:save?.revision || 0, saveUpdatedAt:save?.updated_at || null });
}

async function logout(request, env) {
    const user = await authenticatedUser(request, env);
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(user.tokenHash).run();
    return json(request, { ok:true });
}

async function recover(request, env) {
    const body = await readJson(request);
    const username = normalizeUsername(body.username), password = body.newPassword;
    validateCredentials(username, password);
    const code = normalizeRecoveryCode(body.recoveryCode);
    if (code.length !== 16) throw new ApiError(400, '恢复码格式不正确。');
    const rateKey = await applyRateLimit(request, env, 'recover', username, 6);
    const user = await env.DB.prepare('SELECT id, recovery_salt, recovery_hash FROM users WHERE username_key = ?').bind(username.toLocaleLowerCase('en-US')).first();
    const candidate = user ? await recoveryHash(code, user.recovery_salt) : await recoveryHash(code, toHex(randomBytes(16)));
    if (!user || !safeEqualHex(candidate, user.recovery_hash)) throw new ApiError(401, '账号名或恢复码不正确。');
    const salt = toHex(randomBytes(16)), digest = await passwordHash(password, salt), now = Math.floor(Date.now() / 1000);
    const nextRecoveryCode = makeRecoveryCode(), nextRecoverySalt = toHex(randomBytes(16));
    const nextRecoveryDigest = await recoveryHash(nextRecoveryCode, nextRecoverySalt);
    await env.DB.batch([
        env.DB.prepare('UPDATE users SET password_salt = ?, password_hash = ?, recovery_salt = ?, recovery_hash = ?, updated_at = ? WHERE id = ?').bind(salt, digest, nextRecoverySalt, nextRecoveryDigest, now, user.id),
        env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id)
    ]);
    await clearRateLimit(env, rateKey);
    return json(request, { ok:true, message:'密码已重设，请使用新密码登录。', recoveryCode:nextRecoveryCode });
}

async function saveToCloud(request, env) {
    const user = await authenticatedUser(request, env);
    const body = await readJson(request);
    const saveJson = validateSaveData(body.data);
    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare(`
        INSERT INTO saves (user_id, save_json, revision, updated_at)
        VALUES (?, ?, 1, ?)
        ON CONFLICT(user_id) DO UPDATE SET save_json = excluded.save_json, revision = saves.revision + 1, updated_at = excluded.updated_at
    `).bind(user.id, saveJson, now).run();
    const saved = await env.DB.prepare('SELECT revision, updated_at FROM saves WHERE user_id = ?').bind(user.id).first();
    return json(request, { ok:true, username:user.username, revision:saved.revision, updatedAt:saved.updated_at });
}

async function loadFromCloud(request, env) {
    const user = await authenticatedUser(request, env);
    const row = await env.DB.prepare('SELECT save_json, revision, updated_at FROM saves WHERE user_id = ?').bind(user.id).first();
    if (!row) return json(request, { ok:true, username:user.username, hasSave:false });
    let save;
    try { save = JSON.parse(row.save_json); }
    catch (_) { throw new ApiError(500, '云端存档损坏，请联系创作者。'); }
    return json(request, { ok:true, username:user.username, hasSave:true, revision:row.revision, updatedAt:row.updated_at, save });
}

async function handleApi(request, env) {
    if (!env.DB) throw new ApiError(503, '云存档数据库尚未连接。');
    const url = new URL(request.url), method = request.method;
    if (method === 'POST' && url.pathname === '/api/auth/register') return register(request, env);
    if (method === 'POST' && url.pathname === '/api/auth/login') return login(request, env);
    if (method === 'POST' && url.pathname === '/api/auth/logout') return logout(request, env);
    if (method === 'POST' && url.pathname === '/api/auth/recover') return recover(request, env);
    if (method === 'PUT' && url.pathname === '/api/cloud-save') return saveToCloud(request, env);
    if (method === 'GET' && url.pathname === '/api/cloud-save') return loadFromCloud(request, env);
    throw new ApiError(404, '没有找到这个云账号功能。');
}

function embeddedStaticResponse(url) {
    const headers = {
        'X-Content-Type-Options':'nosniff',
        'Referrer-Policy':'strict-origin-when-cross-origin'
    };
    if (url.pathname === '/' || url.pathname === '/index.html') {
        const html = typeof __STATIC_INDEX_HTML__ === 'string' ? __STATIC_INDEX_HTML__ : null;
        return html === null ? null : new Response(html, { headers:{ ...headers, 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-cache' } });
    }
    if (url.pathname === '/game.js') {
        const script = typeof __STATIC_GAME_JS__ === 'string' ? __STATIC_GAME_JS__ : null;
        return script === null ? null : new Response(script, { headers:{ ...headers, 'Content-Type':'text/javascript; charset=utf-8', 'Cache-Control':'public, max-age=31536000, immutable' } });
    }
    if (url.pathname === '/cloud-connect') {
        const allowedOrigins = JSON.stringify([...ALLOWED_ORIGINS]);
        const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>连接吞噬模拟器云存档</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(145deg,#eef8ff,#eee9ff);font-family:system-ui,"Microsoft YaHei",sans-serif;color:#284867}.card{max-width:420px;margin:24px;padding:28px;border:2px solid #8dbbe7;border-radius:22px;background:#fff;box-shadow:0 18px 50px rgba(39,77,130,.2);text-align:center}h1{font-size:24px;margin:0 0 12px}p{font-size:16px;line-height:1.7;margin:8px 0}.ok{color:#218354;font-weight:800}</style></head><body><main class="card"><h1>☁️ 云存档连接</h1><p class="ok">连接成功！</p><p>请返回吞噬模拟器。这个小窗口会负责云账号和云存档通信，游戏结束前可以保持打开。</p></main><script>(()=>{const allowed=new Set(${allowedOrigins});const send=(target,origin,data)=>{try{target.postMessage(data,origin)}catch(_){}};addEventListener('message',async event=>{if(!allowed.has(event.origin)||!event.source)return;const data=event.data||{};if(data.type!=='devourer-cloud-request'||typeof data.id!=='string'||typeof data.path!=='string'||!data.path.startsWith('/api/'))return;const options=data.options||{};try{const response=await fetch(data.path,{method:options.method||'GET',headers:options.headers||{},body:options.body,credentials:'same-origin'});const result=await response.json().catch(()=>({message:'云账号服务返回了无法识别的内容。'}));send(event.source,event.origin,{type:'devourer-cloud-response',id:data.id,ok:response.ok,status:response.status,result})}catch(error){send(event.source,event.origin,{type:'devourer-cloud-response',id:data.id,ok:false,status:0,result:{message:'云账号服务连接失败，请稍后重试。'}})}});if(window.opener){send(window.opener,'*',{type:'devourer-cloud-ready'});setTimeout(()=>{try{window.opener.focus()}catch(_){}},300)}setInterval(()=>{if(!window.opener||window.opener.closed)window.close()},3000)})();</script></body></html>`;
        return new Response(html, { headers:{ ...headers, 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store' } });
    }
    return null;
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
            const origin = request.headers.get('Origin');
            if (origin && !ALLOWED_ORIGINS.has(origin)) return new Response(null, { status:403 });
            return new Response(null, { status:204, headers:corsHeaders(request) });
        }
        if (url.pathname.startsWith('/api/')) {
            try { return await handleApi(request, env); }
            catch (error) {
                if (error instanceof ApiError) return json(request, { ok:false, message:error.message }, error.status);
                console.error(JSON.stringify({ event:'cloud_account_error', path:url.pathname, message:error?.message || 'unknown' }));
                return json(request, { ok:false, message:'云账号服务暂时出错，请稍后再试。' }, 500);
            }
        }
        const embedded = embeddedStaticResponse(url);
        if (embedded) return embedded;
        if (env.ASSETS) return env.ASSETS.fetch(request);
        return new Response('Not found', { status:404 });
    }
};
