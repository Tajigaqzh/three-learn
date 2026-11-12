import { useNavigate } from 'react-router-dom';
import { Card, NavBar } from 'antd-mobile';

const mask = '******';

/** B 页：我的账户 */
const AccountPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <NavBar backArrow={false} style={{ background: '#b71c1c', color: '#fff' }}>
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
          onClick={() => navigate('/tour-demo/strategies')}
        >
          我的策略
        </button>
        <div style={{ color: '#b71c1c', fontWeight: 600 }}>我的账户</div>
      </div>

      <div style={{ padding: 12 }}>
        <div id="tour-account-card" style={{ marginBottom: 12 }}>
          <Card>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>账户总览</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px 16px',
                fontSize: 13,
                color: '#666',
              }}
            >
              <div>总资产 {mask}</div>
              <div>可用余额 {mask}</div>
              <div>持仓市值 {mask}</div>
              <div>今日盈亏 {mask}</div>
            </div>
          </Card>
        </div>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>交易记录</div>
          {['买入 平安银行', '卖出 贵州茅台', '买入 宁德时代'].map((t, i) => (
            <div
              key={t}
              id={i === 0 ? 'tour-detail-row' : undefined}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                fontSize: 13,
                color: '#333',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <span>{t}</span>
              <span style={{ color: '#999' }}>{mask}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default AccountPage;
