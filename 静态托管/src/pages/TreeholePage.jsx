import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cloudbase } from '../cloudbase.js';
import EnvelopeCard from '../components/EnvelopeCard.jsx';

export default function TreeholePage() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [letters, setLetters] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  // 获取数量
  useEffect(() => {
    cloudbase.callFunction({ name: 'countletters', data: {} })
      .then((res) => {
        const result = res.result;
        const d = typeof result.body === 'string' ? JSON.parse(result.body) : result;
        if (d.ok) setCount(d.count);
      })
      .catch(() => {});
  }, []);

  // 加载一页数据
  const loadPage = useCallback(async (p) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await cloudbase.callFunction({
        name: 'listletters',
        data: { page: p, pageSize: 10 },
      });
      const result = res.result;
      const d = typeof result.body === 'string' ? JSON.parse(result.body) : result;
      if (d.ok) {
        setLetters((prev) => p === 0 ? d.list : [...prev, ...d.list]);
        setHasMore(d.hasMore);
        setPage(p);
      }
    } catch (e) {}
    setLoading(false);
  }, [loading]);

  // 首次加载
  useEffect(() => { loadPage(0); }, []);

  // 触底加载
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loading || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      loadPage(page + 1);
    }
  }, [loading, hasMore, page, loadPage]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="stage">
      <div className="card treehole-card">
        <img className="bg" src="/assets/treehole-bg.jpg" alt="公共树洞" />
        <span className="treehole-count">这里存放着 {count.toLocaleString()} 封温暖的家书</span>
        <button className="treehole-back-btn" onClick={() => navigate('/')} aria-label="返回" />

        <div className="treehole-list" ref={listRef}>
          {letters.map((item, i) => (
            <EnvelopeCard
              key={item._id}
              id={item._id}
              index={i}
              title={`给${item.to}`}
              preview={item.preview + '…'}
              date={item.createdAt ? new Date(item.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
              onClick={() => navigate(`/read/${item._id}`)}
            />
          ))}
          {loading && <p className="treehole-loading">加载中…</p>}
          {!hasMore && letters.length > 0 && <p className="treehole-end">已经到底啦</p>}
        </div>
      </div>
    </div>
  );
}
