const cloudbase = require('@cloudbase/node-sdk');

const ENV_ID = process.env.TCB_ENV || process.env.SCF_NAMESPACE;
const app = cloudbase.init({ env: ENV_ID });
const db = app.database();

/**
 * 分页获取公共树洞信件列表
 * 参数：{ page: number(从0开始), pageSize: number(默认10) }
 * 返回：{ ok, list: [{_id, to, relation, preview, createdAt}], hasMore }
 */
exports.main = async (event = {}) => {
  try {
    const input =
      typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body || event;

    const page = input.page || 0;
    const pageSize = input.pageSize || 10;

    const { data } = await db.collection('letters')
      .where({ public: true })
      .orderBy('createdAt', 'desc')
      .skip(page * pageSize)
      .limit(pageSize + 1)
      .field({ _id: true, to: true, relation: true, letter: true, createdAt: true })
      .get();

    const hasMore = data.length > pageSize;
    const list = (hasMore ? data.slice(0, pageSize) : data).map((item) => ({
      _id: item._id,
      to: item.to,
      relation: item.relation,
      preview: (item.letter || '').slice(0, 20),
      createdAt: item.createdAt,
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true, list, hasMore }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }),
    };
  }
};
