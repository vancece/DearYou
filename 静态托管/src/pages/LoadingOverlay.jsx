import { useEffect, useState, useRef } from 'react';

const TIPS = ['执笔中', '斟酌字句', '落笔生情', '即将写好'];

export default function LoadingOverlay({ dataReady, error, onRetry, onComplete }) {
  const [showError, setShowError] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const [dotActive, setDotActive] = useState(0);
  const tipTimer = useRef(null);
  const dotTimer = useRef(null);

  // 提示文字轮播
  useEffect(() => {
    tipTimer.current = setInterval(() => {
      setTipIdx(i => (i + 1) % TIPS.length);
    }, 2800);
    return () => clearInterval(tipTimer.current);
  }, []);

  // 墨点循环
  useEffect(() => {
    dotTimer.current = setInterval(() => {
      setDotActive(d => (d + 1) % 3);
    }, 600);
    return () => clearInterval(dotTimer.current);
  }, []);

  useEffect(() => {
    if (!dataReady) return;
    if (error) {
      setShowError(true);
    } else {
      onComplete();
    }
  }, [dataReady, error, onComplete]);

  const friendlyMsg = (() => {
    if (!error) return '';
    const msg = error.toLowerCase();
    if (msg.includes('token') || msg.includes('quota') || msg.includes('limit') || msg.includes('balance'))
      return 'AI 额度已用完，请稍后再试或联系管理员充值';
    if (msg.includes('timeout') || msg.includes('timed out'))
      return '生成超时了，可能是网络不太好，再试一次吧';
    if (msg.includes('network') || msg.includes('fetch'))
      return '网络好像断开了，检查一下网络再试试';
    return '信没能写成，再试一次吧';
  })();

  return (
    <div className="loading-overlay">
      <div className="stage loading-stage">
        <div className="card">
          <img className="bg loading-breathe" src="/assets/书写.jpg" alt="书写" />
        </div>
      </div>

      {/* 底部加载提示 */}
      {!showError && (
        <div className="loading-footer">
          <div className="loading-tip" key={tipIdx}>{TIPS[tipIdx]}</div>
          <div className="loading-dots">
            {[0, 1, 2].map(i => (
              <span key={i} className={`loading-ink-dot${i === dotActive ? ' active' : ''}`} />
            ))}
          </div>
        </div>
      )}

      {showError && (
        <div className="modal-mask">
          <div className="modal-content">
            <div className="modal-text">{friendlyMsg}</div>
            <div className="modal-sub">{error}</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px' }}>
              <button className="modal-btn" onClick={onRetry}>再试一次</button>
              <button className="modal-btn" style={{ background: 'rgba(60,40,20,.06)', color: '#6f5c40' }} onClick={onComplete}>返回修改</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
