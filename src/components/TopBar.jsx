import React, { useState } from 'react';
import { Github, Info } from 'lucide-react';
import AboutModal from './AboutModal.jsx';

/**
 * TopBar - 页面右上角工具栏
 *
 * 包含两个图标按钮：
 * 1. GitHub 仓库链接
 * 2. 关于 ITForge 弹窗
 *
 * 固定定位在页面右上角，文本对比界面不显示（由 App.jsx 控制路由）
 */
export default function TopBar() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      {/* 右上角图标组：固定定位，悬浮于内容区上方 */}
      <div className="fixed right-4 top-4 z-40 flex items-center gap-1">
        {/* GitHub 仓库 */}
        <a
          href="https://github.com/8135925/itforge"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-industrial-ghost p-2"
          aria-label="GitHub 仓库"
          title="GitHub 仓库"
        >
          <Github size={18} />
        </a>

        {/* 关于 ITForge */}
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          className="btn-industrial-ghost p-2"
          aria-label="关于 ITForge"
          title="关于 ITForge"
        >
          <Info size={18} />
        </button>
      </div>

      {/* 关于弹窗 */}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
