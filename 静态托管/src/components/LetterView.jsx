import { useState, useEffect, useRef } from 'react';

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function LetterView({ letter, relation, date, typing = true, onBack, children }) {
  const [displayText, setDisplayText] = useState(typing ? '' : letter);
  const [typingDone, setTypingDone] = useState(!typing);
  const timerRef = useRef(null);
  const contentRef = useRef(null);
  const bodyRef = useRef(letter);
  bodyRef.current = letter;

  useEffect(() => {
    if (!typing) return;
    const text = bodyRef.current;
    if (!text) return;
    let i = 0;
    setDisplayText('');
    const tick = () => {
      if (i < text.length) {
        const ch = text[i];
        i++;
        setDisplayText((prev) => prev + ch);
        if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight;
        let delay = 50 + Math.random() * 30;
        if ('，。！？、；：\n'.includes(ch)) delay = 200 + Math.random() * 150;
        else if ('……——'.includes(ch)) delay = 120 + Math.random() * 80;
        timerRef.current = setTimeout(tick, delay);
      } else {
        setTypingDone(true);
      }
    };
    tick();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const signature = relation ? `您的${relation}  敬上` : '敬上';
  const displayDate = date || getToday();

  return (
    <div className="card result-card">
      <img className="bg" src="/assets/书信背景.jpg" alt="书信" />
      {onBack && (
        <button className="letter-back-btn" onClick={onBack} aria-label="返回">
          <img src="/assets/btn-back.png" alt="返回" />
        </button>
      )}
      <div className="falling-leaves" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={`leaf leaf-${i % 4}`} />
        ))}
      </div>
      <div className="result-content" ref={contentRef}>
        <p className="result-letter">
          {displayText}
          {!typingDone && <span className="cursor-blink">|</span>}
        </p>
      </div>
      {typingDone && (
        <div className="result-signature">
          <p className="signature-name">{signature}</p>
          <p className="signature-date">{displayDate}</p>
        </div>
      )}
      {typingDone && children}
    </div>
  );
}
