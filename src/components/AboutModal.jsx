import React, { useEffect } from 'react';
import { X, Github, Wrench } from 'lucide-react';

/**
 * AboutModal - 关于 ITForge 弹窗
 *
 * 展示项目介绍、技术栈明细、反馈渠道，排版采用工业风分层结构
 */
export default function AboutModal({ open, onClose }) {
  // ESC 键关闭弹窗
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    // 遮罩层：点击空白处关闭
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="industrial-card max-h-[85vh] w-full max-w-lg overflow-y-auto industrial-scroll p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="mb-5 flex items-center justify-between border-b border-border-deep/30 pb-4">
          <div className="flex items-center gap-2">
            <Wrench size={20} className="text-accent" strokeWidth={2} />
            <h2 className="font-mono text-lg font-bold uppercase tracking-stamped text-ink">
              关于 ITForge
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-industrial-ghost p-2"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {/* 项目简介 */}
        <div className="space-y-4 text-sm leading-relaxed text-ink-muted">
          <p>
            ITForge 由陆壹锻造，专为开发者与 IT 从业者打造实用工具集。本项目基于 MIT 协议永久免费开源，若这座工坊为您提升了效率，欢迎加入书签并分享给同行——让更多工匠受益。
          </p>

          {/* 技术栈明细 */}
          <div className="rounded-md bg-muted/50 p-4 shadow-recessed">
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wide-stamp text-accent">
              技术栈明细
            </h3>
            <dl className="space-y-2 font-mono text-xs">
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="shrink-0 font-bold text-ink">核心框架</dt>
                <dd className="text-ink-muted">
                  React ^18.3.1 + Vite ^5.4.11 + react-router-dom ^6.28.0
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="shrink-0 font-bold text-ink">样式方案</dt>
                <dd className="text-ink-muted">
                  Tailwind CSS ^3.4.15 + PostCSS/Autoprefixer
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="shrink-0 font-bold text-ink">构建支持</dt>
                <dd className="text-ink-muted">
                  @vitejs/plugin-react ^4.3.4
                </dd>
              </div>
            </dl>
          </div>

          {/* 反馈渠道 */}
          <div className="rounded-md bg-muted/50 p-4 shadow-recessed">
            <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-wide-stamp text-accent">
              发现缺陷？缺少工具？
            </h3>
            <p className="mb-3">
              若现有工具无法满足需求，或您发现了功能异常，欢迎前往 GitHub Issues 反馈。无论是新功能提案还是 Bug 报告，每一条建议都是让这座工坊更完善的锤音。
            </p>
            <a
              href="https://github.com/8135925/itforge/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-industrial-secondary w-full sm:w-auto"
            >
              <Github size={16} />
              前往 GitHub Issues
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
