import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="stage">
      <div className="card about-card">
        <img className="bg" src="/assets/about-bg.jpg" alt="关于" />
        <button
          className="about-github-btn"
          onClick={() => window.open('https://github.com/', '_blank')}
          aria-label="GitHub 源码"
        />
        <button
          className="about-home-btn"
          onClick={() => navigate('/')}
          aria-label="返回首页"
        />
        <button
          className="about-cloud-btn"
          onClick={() => window.open('https://tcb.cloud.tencent.com', '_blank')}
          aria-label="云开发官网"
        />
      </div>
    </div>
  );
}
