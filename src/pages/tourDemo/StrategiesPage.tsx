import { useNavigate } from 'react-router-dom';
import { Card, NavBar } from 'antd-mobile';

const mask = '******';

/** A 页：我的策略 */
const StrategiesPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <NavBar
        backArrow={false}
        style={{ background: '#b71c1c', color: '#fff' }}
        right={
          <button
            id="tour-import-btn"
            type="button"
            style={{
              border: 'none',
              background: '#fff',
              color: '#b71c1c',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 13,
            }}
          >
            导入策略 ⤵
          </button>
        }
      >
        财达证券树懒智能量化交易系统
      </NavBar>

      {/* tabs */}
      <div
        style={{
          display: 'flex',
          background: '#fff',
          padding: '12px 16px',
          gap: 24,
          fontSize: 15,
        }}
      >
        <div style={{ color: '#b71c1c', fontWeight: 600 }}>我的策略</div>
        <button
          type="button"
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            font: 'inherit',
            color: '#666',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/tour-demo/account')}
        >
          我的账户
        </button>
      </div>

      <div style={{ padding: 12 }}>
        {[0, 1].map((i) => (
          <Card key={i} style={{ marginBottom: 12 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                {mask} <span style={{ color: '#1677ff', fontSize: 12 }}>已启用</span>
              </span>
              <span style={{ fontSize: 18, color: '#999' }}>⚙</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px 16px',
                marginTop: 12,
                fontSize: 13,
                color: '#666',
              }}
            >
              <div>当前市值 {mask}</div>
              <div>当前资金 {mask}</div>
              <div>搭载总金额 {mask}</div>
              <div>当前可用 {mask}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StrategiesPage;
