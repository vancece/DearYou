import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RELATIONS, STYLES } from '../constants.js';
import { cloudbase } from '../cloudbase.js';
import LoadingOverlay from './LoadingOverlay.jsx';

export default function ComposePage({ onResult }) {
  const [to, setTo] = useState('');
  const [relation, setRelation] = useState('');
  const [words, setWords] = useState('');
  const [style, setStyle] = useState('warm');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showLoading, setShowLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const pendingData = useRef(null);

  const [toast, setToast] = useState('');
  const relWrapRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (relWrapRef.current && !relWrapRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
    setLoading(false);
    const data = pendingData.current;
    if (data?.error) {
      showToast('信没能写成：' + data.error);
    } else if (data) {
      onResult({ ...data, relation, to: to.trim() || '阿嬤' }, style);
    }
  }, [style, onResult, relation, to]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function handleSubmit() {
    if (!to.trim() && !relation && !words.trim()) {
      showToast('请先填写信的内容');
      return;
    }
    if (!to.trim()) { showToast('请填写阿嬤的称呼'); return; }
    if (!relation) { showToast('请选择你们的关系'); return; }
    if (!words.trim()) { showToast('请写下想对阿嬤说的话'); return; }

    const payload = { to: to.trim(), relation, words: words.trim(), style };
    setLoading(true);
    pendingData.current = null;
    setDataReady(false);
    setShowLoading(true);

    try {
      const res = await cloudbase.callFunction({
        name: 'loveletter',
        data: payload,
      });
      const result = res.result;
      const data = typeof result.body === 'string' ? JSON.parse(result.body) : result;
      if (!data.ok) throw new Error(data.error || '生成失败');
      pendingData.current = data;
      setDataReady(true);
    } catch (e) {
      pendingData.current = { error: e.message };
      setDataReady(true);
    }
  }

  return (
    <div className="stage">
      <div className="card">
        <img className="bg" src="/assets/bg.jpg" alt="给阿嬤的情书" />

        <input
          className="ov ov-to"
          type="text"
          placeholder="阿嬤的称呼或名字"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />

        <div
          className={'ov ov-rel' + (relation ? ' chosen' : '')}
          ref={relWrapRef}
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
        >
          <span className="sel-text">{relation || '选择你们的关系'}</span>
        </div>

        {menuOpen && (
          <div className="sel-menu" onClick={(e) => e.stopPropagation()}>
            {RELATIONS.map((r) => (
              <div
                key={r}
                className={'opt' + (relation === r ? ' on' : '')}
                onClick={() => { setRelation(r); setMenuOpen(false); }}
              >
                {r}
              </div>
            ))}
          </div>
        )}

        <textarea
          className="ov ov-words"
          maxLength={500}
          placeholder="你总在巷口等我放学，最爱给我做橄榄菜配白粥……"
          value={words}
          onChange={(e) => setWords(e.target.value)}
        />
        <div className="ov-count">{words.length}/500</div>

        <div className="ov ov-styles">
          {STYLES.map((s) => (
            <div
              key={s.key}
              className={'hot' + (style === s.key ? ' active' : '')}
              data-style={s.key}
              onClick={() => setStyle(s.key)}
            />
          ))}
        </div>
      </div>

      <button className="submit" disabled={loading} onClick={handleSubmit} aria-label="替我写信" />

      {showLoading && (
        <LoadingOverlay dataReady={dataReady} onComplete={handleLoadingComplete} />
      )}

      {toast && (
        <div className="toast-mask">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
}
