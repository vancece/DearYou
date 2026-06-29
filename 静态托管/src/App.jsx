import React, { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ComposePage from './pages/ComposePage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import SendPage from './pages/SendPage.jsx';
import ReadPage from './pages/ReadPage.jsx';
import TreeholePage from './pages/TreeholePage.jsx';
import AboutPage from './pages/AboutPage.jsx';

// 进入 App 就预加载字体
const font = new FontFace('MaShanZheng', 'url(/assets/MaShanZheng-Regular.ttf)');
font.load().then((f) => document.fonts.add(f)).catch(() => {});

function Main() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [style, setStyle] = useState('warm');

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/compose"
        element={
          <ComposePage
            onResult={(data, s) => {
              setResult(data);
              setStyle(s);
              navigate('/result');
            }}
          />
        }
      />
      <Route
        path="/result"
        element={
          <ResultPage
            data={result}
            style={style}
            onSend={() => navigate('/send')}
            onBack={() => { setResult(null); navigate('/'); }}
          />
        }
      />
      <Route
        path="/send"
        element={
          <SendPage
            data={result}
            onBack={() => { setResult(null); navigate('/'); }}
          />
        }
      />
      <Route path="/read/:id" element={<ReadPage />} />
      <Route path="/treehole" element={<TreeholePage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Main />
    </HashRouter>
  );
}
