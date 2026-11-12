import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties } from 'react';
import type { TourPlacement, TourProps } from './types';
import './Tour.css';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const EMPTY_RECT: Rect = { top: 0, left: 0, width: 0, height: 0 };

/** 视口内的“居中”矩形，用于无高亮目标时的展示 */
function centerRect(): Rect {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return { top: h / 2, left: w / 2, width: 0, height: 0 };
}

const Tour = ({
  open,
  steps,
  current,
  defaultCurrent = 0,
  onChange,
  onClose,
  onFinish,
  mask = true,
  maskClosable = false,
  radius = 8,
  padding = 8,
  zIndex = 1000,
  ref,
}: TourProps) => {
  const isControlled = current !== undefined;
  const [innerCurrent, setInnerCurrent] = useState(defaultCurrent);
  const activeIndex = isControlled ? current! : innerCurrent;

  const [rect, setRect] = useState<Rect>(EMPTY_RECT);
  const [hasTarget, setHasTarget] = useState(false);
  const bubbleRef = useRef<HTMLDialogElement>(null);
  const [bubbleSize, setBubbleSize] = useState({ width: 0, height: 0 });

  const step = steps[activeIndex];
  const total = steps.length;
  const isFirst = activeIndex <= 0;
  const isLast = activeIndex >= total - 1;
  const stepPadding = step?.padding ?? padding;

  // 防止 onNext/onPrev 异步执行期间重复点击
  const pendingRef = useRef(false);

  const goto = useCallback(
    (next: number) => {
      if (!isControlled) setInnerCurrent(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  // 命令式句柄：外部可通过 ref 主动重置/跳转（受控模式下改由 onChange 通知调用方）
  useImperativeHandle(
    ref,
    () => ({
      reset: () => goto(defaultCurrent),
      goTo: (index: number) => goto(index),
    }),
    [goto, defaultCurrent],
  );

  const handleNext = useCallback(async () => {
    if (pendingRef.current) return;
    const hook = step?.onNext;
    if (hook) {
      pendingRef.current = true;
      try {
        const result = await hook();
        if (result === false) return; // 钩子阻止前进
      } finally {
        pendingRef.current = false;
      }
    }
    if (isLast) {
      onFinish?.();
      return;
    }
    goto(activeIndex + 1);
  }, [activeIndex, goto, isLast, onFinish, step]);

  const handlePrev = useCallback(async () => {
    if (isFirst || pendingRef.current) return;
    const hook = step?.onPrev;
    if (hook) {
      pendingRef.current = true;
      try {
        const result = await hook();
        if (result === false) return;
      } finally {
        pendingRef.current = false;
      }
    }
    goto(activeIndex - 1);
  }, [activeIndex, goto, isFirst, step]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // 计算高亮目标位置
  const measure = useCallback(() => {
    if (!step) return;
    const el = step.target?.();
    if (!el) {
      setHasTarget(false);
      setRect(centerRect());
      return;
    }
    const r = el.getBoundingClientRect();
    setHasTarget(true);
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  // 步骤切换：滚动到目标 + 测量。
  // onNext 若跳转了页面，目标元素可能延迟挂载，这里轮询等待其出现（上限 ~1s）。
  useLayoutEffect(() => {
    if (!open || !step) return;
    let raf = 0;
    let timer = 0;
    const start = Date.now();
    const MAX_WAIT = 1000;

    const tick = () => {
      const el = step.target?.();
      // 无 target 的步骤：直接居中展示
      if (!step.target) {
        measure();
        return;
      }
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 滚动落定后再量一次
        raf = requestAnimationFrame(measure);
        timer = window.setTimeout(measure, 320);
        return;
      }
      // 目标还没挂载：下一帧重试，直到超时
      if (Date.now() - start < MAX_WAIT) {
        raf = requestAnimationFrame(tick);
      } else {
        measure(); // 超时兜底：按无目标居中
      }
    };

    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [open, step, measure]);

  // 监听窗口变化
  useEffect(() => {
    if (!open) return;
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, measure]);

  // 测量气泡尺寸
  useLayoutEffect(() => {
    if (!open || !bubbleRef.current) return;
    const { offsetWidth, offsetHeight } = bubbleRef.current;
    setBubbleSize({ width: offsetWidth, height: offsetHeight });
  }, [open, activeIndex, rect]);

  // 键盘控制
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleClose, handleNext, handlePrev]);

  // 高亮框（含 padding）
  const spotlight = useMemo(() => {
    if (!hasTarget) return null;
    return {
      top: rect.top - stepPadding,
      left: rect.left - stepPadding,
      width: rect.width + stepPadding * 2,
      height: rect.height + stepPadding * 2,
    };
  }, [hasTarget, rect, stepPadding]);

  // 气泡位置 + 实际朝向
  const { bubbleStyle, arrowStyle, placement } = useMemo(() => {
    const gap = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bw = bubbleSize.width;
    const bh = bubbleSize.height;
    const margin = 12;

    // 无目标：屏幕居中
    if (!hasTarget) {
      return {
        placement: 'bottom' as TourPlacement,
        bubbleStyle: {
          top: vh / 2 - bh / 2,
          left: vw / 2 - bw / 2,
        },
        arrowStyle: { display: 'none' } as const,
      };
    }

    const box = spotlight!;
    const preferred = step?.placement;
    const spaceBelow = vh - (box.top + box.height);
    const spaceAbove = box.top;

    // 自动决定上下：默认下方，不够则上方
    let place: TourPlacement = preferred ?? 'bottom';
    if (!preferred) {
      place = spaceBelow >= bh + gap + margin || spaceBelow >= spaceAbove ? 'bottom' : 'top';
    }

    let top: number;
    if (place === 'top') top = box.top - bh - gap;
    else top = box.top + box.height + gap;

    // 水平方向：气泡中心尽量对齐目标中心，再夹在视口内
    const targetCenterX = box.left + box.width / 2;
    let left = targetCenterX - bw / 2;
    left = Math.max(margin, Math.min(left, vw - bw - margin));

    // 箭头指向目标中心
    const arrowLeft = targetCenterX - left;
    const clampedArrowLeft = Math.max(16, Math.min(arrowLeft, bw - 16));

    const arrow: Record<string, string | number> =
      place === 'top'
        ? { top: '100%', left: clampedArrowLeft, transform: 'translate(-50%,-1px) rotate(180deg)' }
        : { bottom: '100%', left: clampedArrowLeft, transform: 'translate(-50%,1px)' };

    return {
      placement: place,
      bubbleStyle: { top, left },
      arrowStyle: arrow,
    };
  }, [hasTarget, spotlight, bubbleSize, step]);

  // 遮罩样式：有高亮目标时定位到洞口（靠 box-shadow 变暗四周），否则整屏遮罩
  const maskStyle: CSSProperties = spotlight
    ? {
        top: spotlight.top,
        left: spotlight.left,
        width: spotlight.width,
        height: spotlight.height,
        borderRadius: radius,
      }
    : {
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
        boxShadow: 'none',
        background: 'rgba(0,0,0,.55)',
      };

  if (!open || !step) return null;

  return createPortal(
    <div className="km-tour" style={{ zIndex }}>
      {/* 遮罩 + 高亮：用 box-shadow 挖洞。可点关闭时用 button 承载交互语义。 */}
      {mask &&
        (maskClosable ? (
          <button
            type="button"
            aria-label="关闭引导"
            className="km-tour__mask"
            onClick={handleClose}
            style={maskStyle}
          />
        ) : (
          <div className="km-tour__mask" style={maskStyle} />
        ))}

      {/* 高亮描边（可点击到目标：pointer-events 交给下面的洞） */}
      {spotlight && (
        <div
          className="km-tour__ring"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            borderRadius: radius,
          }}
        />
      )}

      {/* 气泡：用原生 dialog 承载对话语义 */}
      <dialog
        open
        ref={bubbleRef}
        className={`km-tour__bubble km-tour__bubble--${placement}`}
        style={bubbleStyle}
        aria-modal="true"
      >
        <span className="km-tour__arrow" style={arrowStyle} />

        {step.title && <div className="km-tour__title">{step.title}</div>}
        {step.description && <div className="km-tour__desc">{step.description}</div>}

        <div className="km-tour__footer">
          {total > 1 && (
            <span className="km-tour__counter">
              {activeIndex + 1}/{total}
            </span>
          )}
          <div className="km-tour__actions">
            {!isFirst && (
              <button
                type="button"
                className="km-tour__btn km-tour__btn--ghost"
                onClick={handlePrev}
              >
                上一步
              </button>
            )}
            <span className="km-tour__divider" />
            <button type="button" className="km-tour__btn km-tour__btn--link" onClick={handleNext}>
              {isLast ? '完成' : '下一步'}
            </button>
          </div>
        </div>
      </dialog>
    </div>,
    document.body,
  );
};

export default Tour;
