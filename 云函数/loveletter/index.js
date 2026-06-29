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

const cloudbase = require('@cloudbase/node-sdk');

const ENV_ID = process.env.TCB_ENV || process.env.SCF_NAMESPACE;
const AI_BASE_URL = `https://${ENV_ID}.api.tcloudbasegateway.com/v1/ai/cloudbase`;
const AI_API_KEY = process.env.CLOUDBASE_AI_API_KEY || process.env.VITE_CLOUDBASE_ACCESS_KEY;
const MODEL = 'hy3-preview';

const app = cloudbase.init({ env: ENV_ID });
const db = app.database();

/**
 * 根据用户填写的小事，拼出给大模型的提示词
 */
// 三种风格对应的写作基调
const STYLE_HINT = {
  warm:
    '基调：温情家书。' +
    '参考电影《给阿嬷的情书》中侨批家书的风格——' +
    '语言质朴克制，不堆砌形容词，用具体的生活细节代替空泛抒情。' +
    '比如写"前日晚饭烤番薯，三个孩童吃得欢喜"，而不是"我非常想念你"。' +
    '句式偏短，口语化但不粗糙，带一点文言的温润感（如"展信安康""勿念""切莫操劳"）。' +
    '每段只写一件小事或一个牵挂，段与段之间留白。' +
    '结尾留一句最想说却最难开口的话，点到即止。' +
    '整封信读完应该像一个不善言辞的人，用笨拙而真挚的笔触，把满心的思念一笔一笔写下来。',
  fun:
    '基调：幽默家书。' +
    '轻松俏皮、有生活气和调侃感，像晚辈跟长辈撒娇逗趣。' +
    '可以自嘲、夸张、模仿长辈口吻反问，但底色仍是关心与爱。' +
    '比如"报告：我现在能自己煮饭了（虽然还是没有你的橄榄菜好吃）"。' +
    '结尾收一下，用一句认真的话让人鼻子一酸。',
  formal:
    '基调：正式家书。' +
    '用传统家书的格式与措辞，如"见信安好""顺颂安康""此恩此情，没齿难忘"。' +
    '语气庄重得体，表达敬意与感恩。段落工整，遣词典雅但不晦涩。' +
    '像民国时期的书信，字字斟酌，恭敬而深情。',
};

function buildPrompt(input) {
  const { to = '阿嬤', relation = '晚辈', words = '', style = 'warm' } = input || {};
  const styleHint = STYLE_HINT[style] || STYLE_HINT.warm;

  return [
    {
      role: 'system',
      content:
        '你是电影《给阿嬷的情书》里那位替人代笔的谢南枝。' +
        '你一辈子替人写侨批家书，深谙一个道理：最动人的信不靠华丽辞藻，而是把日常小事写得让人鼻子一酸。' +
        '你的笔下没有"我很想你"这种空话，只有"昨天路过那家粥店，点了碗白粥配橄榄菜，吃了一口就红了眼眶"。' +
        '\n\n写作原则：' +
        '1. 用具体的生活细节代替抽象抒情，一封信里至少有 2-3 个可视化的生活画面；' +
        '2. 语言质朴，句式偏短，可以带一点文言的温润（"展信安康""勿念"），但不要满篇文言；' +
        '3. 【最重要】用户提供的正文内容是信的核心素材，必须忠实保留其中的故事、细节和情感。' +
        '如果用户写了具体的回忆和故事（超过50字），你的任务是润色和组织，而非另起炉灶编造新内容。' +
        '绝对不要忽略用户写的内容去自己编故事。用户没提到的事情不要凭空捏造；' +
        '4. 不超过 1000 字，宁短勿长，留白也是深情；' +
        '5. 不要署名，前端会自动添加。' +
        '\n\n格式要求：第一行写称呼（如"阿嬤，见字如面。"或"吾妻淑柔，展信安康。"），之后每段之间空一行。' +
        '\n\n安全要求：信件内容不得包含任何违法违规信息。' +
        '\n\n' + styleHint,
    },
    {
      role: 'user',
      content:
        `请替我给「${to}」写一封信。\n` +
        `· 我与 TA 的关系：${relation}\n` +
        (words
          ? (words.length > 50
            ? `· 以下是我写的正文内容，请以此为主体进行润色，保留我写的所有故事和细节，不要编造我没提到的事情：\n${words}\n`
            : `· 我想对 TA 说的话（比较零碎，请你帮我扩展润色成完整的信）：${words}\n`)
          : '') +
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
      max_tokens: 2000,
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

    // 存入数据库
    const doc = {
      to: input.to || '阿嬤',
      relation: input.relation || '晚辈',
      style: input.style || 'warm',
      letter,
      musicMood,
      musicUrl,
      public: false,
      createdAt: new Date(),
    };
    const { id } = await db.collection('letters').add(doc);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ ok: true, id, letter, musicMood, musicUrl, model: MODEL }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }),
    };
  }
};
