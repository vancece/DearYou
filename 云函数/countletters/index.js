const cloudbase = require('@cloudbase/node-sdk');

const ENV_ID = process.env.TCB_ENV || process.env.SCF_NAMESPACE;
const app = cloudbase.init({ env: ENV_ID });
const db = app.database();

exports.main = async (event = {}) => {
  try {
    const { total } = await db.collection('letters').where({ public: true }).count();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true, count: total }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }),
    };
  }
};
