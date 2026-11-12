import { useRef, useState } from 'react';
import { Button, Card, NavBar } from 'antd-mobile';
import { Tour } from '@/components/Tour';
import type { TourRef, TourStep } from '@/components/Tour';

const maskText = '******';

const Index = () => {
  const [open, setOpen] = useState(false);
  const tourRef = useRef<TourRef>(null);

  // 打开引导并回到第一步（组件不再自动重置，改由外部主动调用）
  const start = () => {
    tourRef.current?.reset();
    setOpen(true);
  };

  const importBtnRef = useRef<HTMLButtonElement>(null);
  const tabAccountRef = useRef<HTMLDivElement>(null);
  const settingRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLSpanElement>(null);

  const steps: TourStep[] = [
    {
      target: () => importBtnRef.current,
      description: '点击此处导入你的策略',
    },
    {
      target: () => tabAccountRef.current,
      description: '在这里查看你的账户信息',
    },
    {
      target: () => settingRef.current,
      title: '策略设置',
      description: '点击齿轮可以调整该策略的参数。',
    },
    {
      target: () => detailRef.current,
      title: '查看详情',
      description: '进入详情页查看完整的策略运行数据。',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar
        backArrow={false}
        style={{ background: '#b71c1c', color: '#fff' }}
        right={
          <button
            ref={importBtnRef}
            type="button"
            onClick={start}
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
        <div ref={tabAccountRef} style={{ color: '#666' }}>
          我的账户
        </div>
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
                {maskText} <span style={{ color: '#1677ff', fontSize: 12 }}>已启用</span>
              </span>
              {i === 0 ? (
                <div ref={settingRef} style={{ fontSize: 18, color: '#999' }}>
                  ⚙
                </div>
              ) : (
                <div style={{ fontSize: 18, color: '#999' }}>⚙</div>
              )}
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
              <div>当前市值 {maskText}</div>
              <div>当前资金 {maskText}</div>
              <div>搭载总金额 {maskText}</div>
              <div>当前可用 {maskText}</div>
              <div>调仓方式 {maskText}</div>
              <div>仓位 {maskText}</div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              {i === 0 ? (
                <span ref={detailRef} style={{ color: '#333' }}>
                  查看详情 ›
                </span>
              ) : (
                <span style={{ color: '#333' }}>查看详情 ›</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ padding: 12 }}>
        <Button block color="danger" onClick={start}>
          重新开始新手引导
        </Button>
      </div>

      <Tour
        ref={tourRef}
        open={open}
        steps={steps}
        onClose={() => setOpen(false)}
        onFinish={() => setOpen(false)}
        maskClosable
      />
    </div>
  );
};

export default Index;
