const cloudbase = require('@cloudbase/node-sdk');

const ENV_ID = process.env.TCB_ENV || process.env.SCF_NAMESPACE;
const app = cloudbase.init({ env: ENV_ID });
const db = app.database();

/**
 * 修改信件的 public 属性（投递/撤回公共树洞）
 * 参数：{ id: string, public: boolean }
 */
exports.main = async (event = {}) => {
  try {
    const input =
      typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body || event;

    const { id } = input;
    if (!id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ ok: false, error: '缺少信件 ID' }),
      };
    }

    const isPublic = input.public !== false;
    await db.collection('letters').doc(id).update({ public: isPublic });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true, public: isPublic }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }),
    };
  }
};
