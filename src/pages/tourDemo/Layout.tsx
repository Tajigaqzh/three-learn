import { useCallback, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from 'antd-mobile';
import { Tour } from '@/components/Tour';
import type { TourRef, TourStep } from '@/components/Tour';

/** 用 DOM id 做跨页目标：target 惰性调用，跳转后新页面元素挂载即可命中 */
const byId = (id: string) => () => document.getElementById(id);

/**
 * 跨页引导布局。
 * Tour 挂在布局层，切换子路由（子页面卸载/挂载）时它依然存活，
 * 所以引导可以跨越 /tour-demo/strategies 与 /tour-demo/account 两页。
 */
const TourDemoLayout = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const tourRef = useRef<TourRef>(null);

  const start = useCallback(() => {
    navigate('/tour-demo/strategies');
    tourRef.current?.reset(); // 回到第一步（组件不再自动重置，改由外部主动调用）
    setOpen(true);
  }, [navigate]);

  const steps: TourStep[] = [
    {
      // —— A 页：我的策略 ——
      target: byId('tour-import-btn'),
      description: '点击此处导入你的策略',
      // 切到下一步之前跳到 B 页；组件会轮询等 B 页目标挂载
      onNext: () => {
        navigate('/tour-demo/account');
      },
    },
    {
      // —— B 页：我的账户 ——
      target: byId('tour-account-card'),
      title: '我的账户',
      description: '在这里查看你的账户余额与盈亏。',
      // 回到上一步时跳回 A 页
      onPrev: () => {
        navigate('/tour-demo/strategies');
      },
    },
    {
      // —— B 页：明细 ——
      target: byId('tour-detail-row'),
      title: '交易明细',
      description: '点击可查看每一笔交易的完整记录。',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Outlet />

      <div style={{ padding: 12 }}>
        <Button block color="danger" onClick={start}>
          开始跨页新手引导
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

export default TourDemoLayout;
