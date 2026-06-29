import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { cloudbase } from '../cloudbase.js';

export default function HomePage() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  useEffect(() => {
    cloudbase.callFunction({ name: 'countletters', data: {} })
      .then((res) => {
        const result = res.result;
        const d = typeof result.body === 'string' ? JSON.parse(result.body) : result;
        if (d.ok) setCount(d.count);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="stage">
      <div className="card home-card">
        <img className="bg" src="/assets/home-bg.jpg" alt="给阿嬤的情书" />
        <button className="home-about-btn" onClick={() => navigate('/about')} aria-label="关于" />
        <button className="home-write-btn" onClick={() => navigate('/compose')} aria-label="写一封信" />
        <button className="home-treehole-btn" onClick={() => navigate('/treehole')} aria-label="公共树洞" />
        {count > 0 && (
          <span className="home-count">已有 {count} 封家书</span>
        )}
        <button className="home-bottom-btn" onClick={() => navigate('/about')} aria-label="关于项目" />
      </div>
    </div>
  );
}
