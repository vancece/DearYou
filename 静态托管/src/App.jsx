import React, { useState } from 'react';
import ComposePage from './pages/ComposePage.jsx';

// 简单页面切换状态机：后续要加的页面在这里登记即可
export default function App() {
  const [page, setPage] = useState('compose');
  const [result, setResult] = useState(null);

  switch (page) {
    case 'compose':
    default:
      return (
        <ComposePage
          onResult={(data) => { setResult(data); /* 预留：setPage('result') */ }}
        />
      );
  }
}
