"use client";

import { useEffect } from "react";
import { unstableSetRender } from "antd-mobile";
import { createRoot, type Root } from "react-dom/client";

// 扩展 Container 类型以支持 _reactRoot 属性
interface ContainerWithRoot extends Element {
  _reactRoot?: Root;
}

export default function React19Compat() {
  useEffect(() => {
    // React 19 兼容配置
    unstableSetRender((node, container) => {
      const containerWithRoot = container as ContainerWithRoot;
      containerWithRoot._reactRoot ||= createRoot(container);
      const root = containerWithRoot._reactRoot;
      root.render(node);
      return async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        root.unmount();
      };
    });
  }, []);

  return null;
}
