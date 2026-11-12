import { unstableSetRender } from 'antd-mobile';
import { createRoot, type Root } from 'react-dom/client';

// antd-mobile v5 targets React 16~18 and its imperative components (Toast,
// Dialog, Modal, ...) call the removed `ReactDOM.render` /
// `ReactDOM.unmountComponentAtNode`. On React 19 this throws
// "unmountComponentAtNode is not a function". `unstableSetRender` routes those
// internal renders through the React 19 `createRoot` API instead.
// See https://mobile.ant.design/guide/v5-for-19

unstableSetRender((node, container) => {
  const target = container as Element & { _reactRoot?: Root };

  target._reactRoot ||= createRoot(target);
  const root = target._reactRoot;

  root.render(node);

  return async () => {
    // Defer unmount so we don't unmount synchronously during a render pass.
    await Promise.resolve();
    root.unmount();
    delete target._reactRoot;
  };
});
