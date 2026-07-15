import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="notFound">
      <h1>404</h1>
      <p>当前页面不存在。</p>
      <Link to="/">返回首页</Link>
    </main>
  );
}
