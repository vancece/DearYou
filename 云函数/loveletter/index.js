/**
 * 给阿嬤的情书 —— 云函数后端
 * ------------------------------------------------------------
 * 职责：
 *   1. 接收前端传来的几条「关于那个人的小事」
 *   2. 调用云开发接入的自定义大模型 hy3-preview，生成一封情书
 *   3. 同时让模型给出一段「配乐情绪关键词」，前端据此挑选 / 生成背景音乐
 *
 * 接入方式：
 *   云开发 AI 网关兼容 OpenAI 协议，直接用 fetch 调用即可。
 *   Base URL：https://<ENV_ID>.api.tcloudbasegateway.com/v1/ai/cloudbase
 *   模型名：  hy3-preview
 *   文档：    https://docs.cloudbase.net/ai/ai-tools/codebuddy
 *
 * 本项目由 CodeBuddy 接入云开发自定义大模型 hy3-preview 开发。
 */

const ENV_ID = process.env.TCB_ENV || process.env.SCF_NAMESPACE || 'maralade-8gwkeq4g50e3afec';
// AI 控制台获取：https://tcb.cloud.tencent.com/dev#/ai?tab=text-aiModel
const AI_BASE_URL = `https://${ENV_ID}.api.tcloudbasegateway.com/v1/ai/cloudbase`;
const AI_API_KEY = process.env.CLOUDBASE_AI_API_KEY;
const MODEL = 'hy3-preview';

/**
 * 根据用户填写的小事，拼出给大模型的提示词
 */
// 三种风格对应的写作基调
const STYLE_HINT = {
  warm: '基调：温情。温暖、克制、动人，多用具体的生活细节，少用空泛抒情，结尾留一句最想说却最难开口的话。',
  fun: '基调：幽默。轻松俏皮、有生活气和调侃感，像晚辈跟长辈撒娇逗趣，但底色仍是关心与爱。',
  formal: '基调：正式。庄重得体，用传统家书的格式与措辞（如"见信安好""顺颂安康"），表达敬意与感恩。',
};

function buildPrompt(input) {
  const { to = '阿嬤', relation = '晚辈', words = '', style = 'warm' } = input || {};
  const styleHint = STYLE_HINT[style] || STYLE_HINT.warm;

  return [
    {
      role: 'system',
      content:
        '你是电影《给阿嬷的情书》里那位替人代笔的谢南枝。你的任务不是写华丽的辞藻，' +
        '而是把一个普通人说不出口的深情，化成一封有细节、有温度的家书。' +
        '信件要求：不超过 350 字；根据写信人与收件人的关系选择得体的称谓与署名；' +
        '把用户提供的零碎话语，自然地组织成一封完整的信。' + styleHint,
    },
    {
      role: 'user',
      content:
        `请替我给「${to}」写一封信。\n` +
        `· 我与 TA 的关系：${relation}\n` +
        (words ? `· 我想对 TA 说的话（可能很零碎，请你润色组织）：${words}\n` : '') +
        '\n请直接输出信件正文，不要任何解释或标题。',
    },
  ];
}

/**
 * 调用云开发 hy3-preview 生成正文
 */
async function generateLetter(messages) {
  const resp = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.8,
      max_tokens: 800,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`AI 网关返回 ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

/**
 * 再调一次模型，为这封信生成「配乐情绪」描述
 * （云开发 token 套餐同样支持音乐生成；此处先产出情绪关键词，
 *   供前端调用音乐生成接口或匹配预置 BGM 使用）
 */
async function generateMusicMood(letter) {
  const messages = [
    {
      role: 'system',
      content:
        '你是一位为家书配乐的音乐总监。请阅读下面这封信，用一句不超过 30 字的中文，' +
        '描述最适合它的背景音乐情绪与配器（例如：温暖怀旧的钢琴，带一点潮汕海风的笛声）。只输出这句话。',
    },
    { role: 'user', content: letter },
  ];
  try {
    return await generateLetter(messages);
  } catch (e) {
    return '温暖、思念的钢琴独奏';
  }
}

/**
 * 根据配乐情绪，生成一段背景音乐
 * ------------------------------------------------------------
 * 云开发 AI 的 Token 套餐支持音乐生成能力。把上一步得到的
 * musicMood 作为提示词，调用音乐生成接口，拿到成品音频地址。
 * 这里给出接入位：返回 null 时前端会自动回退到本地合成的旋律，
 * 接通后返回真实音频 URL（mp3 / wav），前端直接播放。
 */
async function generateMusic(musicMood, style) {
  // TODO: 替换为云开发 AI 音乐生成接口。示意：
  // const resp = await fetch(`${AI_BASE_URL}/music/generations`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
  //   body: JSON.stringify({ prompt: musicMood, duration: 30, style }),
  // });
  // const data = await resp.json();
  // return data.audio_url || null;
  return null;
}

/**
 * 云函数入口
 */
exports.main = async (event = {}) => {
  try {
    const input =
      typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body || event;

    const messages = buildPrompt(input);
    const letter = await generateLetter(messages);
    const musicMood = await generateMusicMood(letter);
    const musicUrl = await generateMusic(musicMood, input.style);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ ok: true, letter, musicMood, musicUrl, model: MODEL }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }),
    };
  }
};
