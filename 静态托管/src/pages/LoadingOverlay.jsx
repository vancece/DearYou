import React, { useState, useEffect } from 'react';

const STEPS = [
  { img: '/assets/研磨.jpg', label: '研墨' },
  { img: '/assets/执笔.jpg', label: '执笔' },
  { img: '/assets/书写.jpg', label: '书写' },
];

const STEP_DURATION = 3500;
const FADE_IN = 1800;

export default function LoadingOverlay({ dataReady, onComplete }) {
  const [step, setStep] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  // 记录每张图片是否已经淡入完成（淡入后保持 opacity:1 不动）
  const [revealed, setRevealed] = useState([false, false, false]);

  // 首张图片立即开始淡入
  useEffect(() => {
    const t = setTimeout(() => {
      setRevealed((prev) => { const n = [...prev]; n[0] = true; return n; });
    }, 50);
    return () => clearTimeout(t);
  }, []);

  // 当一张图片淡入完成后，等 STEP_DURATION 再推进下一步
  useEffect(() => {
    if (!revealed[step]) return;
    const isLastStep = step === STEPS.length - 1;
    if (isLastStep) {
      const t = setTimeout(() => setAnimDone(true), STEP_DURATION);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const next = step + 1;
      setStep(next);
      // 下一张图片开始淡入
      setTimeout(() => {
        setRevealed((prev) => { const n = [...prev]; n[next] = true; return n; });
      }, 50);
    }, STEP_DURATION);
    return () => clearTimeout(t);
  }, [step, revealed]);

  // 动画完成 + 数据就绪 → 直接回调，不做退出动画
  useEffect(() => {
    if (animDone && dataReady) {
      onComplete();
    }
  }, [animDone, dataReady, onComplete]);

  return (
    <div className="loading-overlay">
      <div className="stage loading-stage">
        <div className="card">
          {STEPS.map((s, i) => (
            i <= step && (
              <img
                key={s.label}
                className={`bg${i > 0 ? ' loading-layer' : ''}`}
                src={s.img}
                alt={s.label}
                style={{
                  opacity: revealed[i] ? 1 : 0,
                  transition: `opacity ${FADE_IN}ms ease`,
                  zIndex: i + 1,
                }}
              />
            )
          ))}
          <div
            className="loading-footer"
            style={{ zIndex: STEPS.length + 1 }}
          >
            <div className="loading-progress">
              {STEPS.map((_, i) => (
                <span key={i} className={`loading-dot${i <= step ? ' active' : ''}${i === step ? ' current' : ''}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
