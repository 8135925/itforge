import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Wrench } from 'lucide-react';
import { TOOLS } from '../tools.config.js';

/**
 * Sidebar - 可折叠侧边栏
 * 视觉规范：Industrial.md 卡片/按钮规范
 * - 桌面端：240px 固定宽度，可折叠为 72px 图标栏
 * - 移动端：覆盖式抽屉，点击遮罩关闭
 * @param {{ collapsed: boolean, onToggleCollapse: (v: boolean) => void }} props
 */
export default function Sidebar({ collapsed, onToggleCollapse }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // 路由切换时关闭移动端抽屉
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* 移动端顶部触发按钮 */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="btn-industrial-secondary fixed left-4 top-4 z-40 p-3 md:hidden"
        aria-label="打开工具菜单"
      >
        <Wrench size={18} />
      </button>

      {/* 移动端遮罩层 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 侧边栏主体 */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col',
          'bg-chassis shadow-card',
          'transition-all duration-300 ease-spring',
          // 桌面端宽度切换
          collapsed ? 'md:w-[72px]' : 'md:w-60',
          // 移动端抽屉滑动
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 md:translate-x-0'
        ].join(' ')}
        aria-label="工具导航"
      >
        {/* 顶部品牌区 */}
        <div className="flex h-16 items-center justify-between border-b border-border-deep/30 px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            {/* 品牌 LED 指示器 */}
            <span className="led-on shrink-0" aria-hidden="true" />
            <div className={['flex items-center gap-2 overflow-hidden', collapsed ? 'md:hidden' : ''].join(' ')}>
              <Wrench size={20} className="shrink-0 text-accent" strokeWidth={2} />
              <span className="whitespace-nowrap font-mono text-sm font-bold uppercase tracking-stamped text-ink">
                ITForge
              </span>
            </div>
          </div>
          {/* 移动端关闭按钮 */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="btn-industrial-ghost p-2 md:hidden"
            aria-label="关闭菜单"
          >
            <X size={18} />
          </button>
        </div>

        {/* 导航内容：纵向滚动 */}
        <nav className="industrial-scroll flex-1 overflow-y-auto px-3 py-4">
          {TOOLS.map((group) => (
            <SidebarGroup key={group.group} group={group} collapsed={collapsed} />
          ))}
        </nav>

        {/* 底部折叠控制（仅桌面端） */}
        <div className="hidden border-t border-border-deep/30 p-3 md:block">
          <button
            type="button"
            onClick={() => onToggleCollapse(!collapsed)}
            className="btn-industrial-secondary w-full justify-center py-2"
            aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
}

/**
 * 侧边栏分组：组标题 + 工具项列表
 */
function SidebarGroup({ group, collapsed }) {
  return (
    <div className="mb-4">
      {/* 组标题 */}
      <div
        className={[
          'flex items-center gap-1 px-2 py-1.5',
          collapsed ? 'md:justify-center' : ''
        ].join(' ')}
        title={collapsed ? group.group : undefined}
      >
        <span className="text-sm" aria-hidden="true">{group.icon}</span>
        {!collapsed && (
          <span className="tech-label">{group.group}</span>
        )}
      </div>
      {/* 工具项 */}
      <ul className="mt-1 space-y-1">
        {group.items.map((item) => (
          <li key={item.id}>
            <NavLink
              to={`/tool/${item.id}`}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-md px-3 py-2.5',
                  'text-sm font-medium transition-all duration-150 ease-mechanical',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  collapsed ? 'md:justify-center md:px-0' : '',
                  isActive
                    ? 'bg-muted text-accent shadow-recessed'
                    : 'text-ink-muted hover:bg-muted/60 hover:text-ink hover:shadow-recessed'
                ].join(' ')
              }
            >
              <span className="text-base shrink-0" aria-hidden="true">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
