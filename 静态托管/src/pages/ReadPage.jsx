import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cloudbase } from '../cloudbase.js';
import LetterView from '../components/LetterView.jsx';
import InkButton from '../components/InkButton.jsx';

export default function ReadPage() {
  const { id: letterId } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  useEffect(() => {
    if (!letterId) { setError('无效的信件链接'); setLoading(false); return; }

    cloudbase.callFunction({ name: 'getletter', data: { id: letterId } })
      .then((res) => {
        const result = res.result;
        const d = typeof result.body === 'string' ? JSON.parse(result.body) : result;
        if (!d.ok) throw new Error(d.error || '读取失败');
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [letterId]);

  if (loading) {
    return (
      <div className="stage">
        <div className="card result-card">
          <img className="bg" src="/assets/书信背景.jpg" alt="书信" />
          <div className="result-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p className="result-letter" style={{ textAlign: 'center' }}>正在取信<span className="dots" /></p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stage">
        <div className="card result-card">
          <img className="bg" src="/assets/书信背景.jpg" alt="书信" />
          <div className="result-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p className="result-letter" style={{ textAlign: 'center' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage">
      <LetterView
        letter={data.letter}
        relation={data.relation}
        date={data.createdAt ? new Date(data.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined}
        typing={true}
        onBack={() => nav(-1)}
      >
        <div className="read-btns">
          <InkButton onClick={() => nav('/')}>我也写一封</InkButton>
          <InkButton onClick={handleShare}>{copied ? '已复制' : '分享此信'}</InkButton>
        </div>
      </LetterView>

      {copied && (
        <div className="toast-mask">
          <div className="toast">链接已复制</div>
        </div>
      )}
    </div>
  );
}
