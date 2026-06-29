import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cloudbase } from '../cloudbase.js';

export default function SendPage({ data, onBack }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 分享链接用 hash 路由格式
  const shareUrl = data?.id
    ? `${window.location.origin}${window.location.pathname}#/read/${data.id}`
    : '';

  function handleCopy() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  async function handlePublish() {
    if (!data?.id || publishing || published) return;
    setPublishing(true);
    try {
      const res = await cloudbase.callFunction({
        name: 'publishletter',
        data: { id: data.id, public: true },
      });
      const result = res.result;
      const d = typeof result.body === 'string' ? JSON.parse(result.body) : result;
      if (d.ok) {
        setPublished(true);
        setShowModal(true);
      }
    } catch (e) {}
    setPublishing(false);
  }

  function handleViewTreehole() {
    navigate('/treehole');
  }

  return (
    <div className="stage">
      <div className="card send-card">
        <img className="bg" src="/assets/send-bg.jpg" alt="分享这份心意" />

        <input
          className="send-url-input"
          type="text"
          value={shareUrl}
          readOnly
          onClick={(e) => e.target.select()}
        />

        <button className="send-copy-btn" onClick={handleCopy} aria-label="复制链接" />

        <button
          className="send-treehole-btn"
          onClick={handlePublish}
          disabled={publishing || published}
          aria-label="投入树洞"
        />

        <button className="send-view-btn" onClick={handleViewTreehole} aria-label="查看树洞" />

        <button className="send-done-btn" onClick={onBack} aria-label="完成" />
      </div>

      {copied && (
        <div className="toast-mask">
          <div className="toast">链接已复制</div>
        </div>
      )}

      {showModal && (
        <div className="modal-mask" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} aria-label="关闭">✕</button>
            <p className="modal-text">已投入公共树洞</p>
            <p className="modal-sub">这份温暖，将被更多人看到</p>
            <button className="modal-btn" onClick={() => navigate('/treehole')}>去看看</button>
          </div>
        </div>
      )}
    </div>
  );
}
