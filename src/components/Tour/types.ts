import type { ReactNode, Ref } from 'react';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

/** 通过 ref 暴露的命令式方法 */
export interface TourRef {
  /** 重置回起始步骤（defaultCurrent） */
  reset: () => void;
  /** 跳到指定步骤 */
  goTo: (index: number) => void;
}

export interface TourStep {
  /** 返回该步骤要高亮的目标元素。返回 null 时该步骤为居中展示（无高亮）。 */
  target?: () => HTMLElement | null;
  /** 步骤标题 */
  title?: ReactNode;
  /** 步骤说明 */
  description?: ReactNode;
  /** 气泡相对目标的位置，默认自动选择 */
  placement?: TourPlacement;
  /** 高亮框在目标周围的内边距，默认取 Tour 的 padding */
  padding?: number;
  /**
   * 点击「下一步」时、切到下一步之前执行。可用于跳转页面等副作用。
   * 返回 Promise 时会等待其完成后再切步骤（可用来等目标元素挂载）。
   * 返回 false 可阻止本次前进。
   */
  onNext?: () => void | boolean | Promise<void | boolean>;
  /** 点击「上一步」时、切到上一步之前执行。返回 false 可阻止后退。 */
  onPrev?: () => void | boolean | Promise<void | boolean>;
}

export interface TourProps {
  /** 是否显示引导 */
  open: boolean;
  /** 步骤列表 */
  steps: TourStep[];
  /** 受控：当前步骤索引 */
  current?: number;
  /** 非受控：初始步骤索引，默认 0 */
  defaultCurrent?: number;
  /** 步骤切换回调 */
  onChange?: (current: number) => void;
  /** 关闭（跳过或点右上角关闭）回调 */
  onClose?: () => void;
  /** 走完最后一步回调 */
  onFinish?: () => void;
  /** 是否显示遮罩，默认 true */
  mask?: boolean;
  /** 点击遮罩是否关闭，默认 false */
  maskClosable?: boolean;
  /** 高亮框圆角，默认 8 */
  radius?: number;
  /** 高亮框内边距，默认 8 */
  padding?: number;
  /** 层级，默认 1000 */
  zIndex?: number;
  /** 命令式句柄：外部可调用 reset() / goTo() 控制步骤 */
  ref?: Ref<TourRef>;
}
