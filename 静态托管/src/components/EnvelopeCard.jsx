

const ENVELOPE_BGS = [
  '/assets/envelope-1.png',
  '/assets/envelope-2.png',
  '/assets/envelope-3.png',
];

// 用字符串生成一个稳定的伪随机数（同一个 id 每次结果一样）
function hashIndex(str, len) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return ((h % len) + len) % len;
}

export default function EnvelopeCard({ id, title, preview, date, onClick, index = 0 }) {
  const pick = id ? hashIndex(id, 3) : Math.floor(Math.random() * 3);
  const bg = ENVELOPE_BGS[pick];
  const variant = `env-${pick + 1}`;

  return (
    <div
      className={`envelope ${variant}`}
      onClick={onClick}
      style={{ animationDelay: `${Math.min(index * 0.06, 0.5)}s` }}
    >
      <img className="envelope-bg" src={bg} alt="信封" />
      <div className="envelope-content">
        <p className="env-title">{title}</p>
        <p className="env-preview">{preview}</p>
        <span className="env-date">{date}</span>
      </div>
    </div>
  );
}
