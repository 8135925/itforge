import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, X, Wrench } from 'lucide-react';
import { TOOLS } from '../tools.config.js';

/**
 * Sidebar - 可折叠侧边栏
 * 视觉规范：Industrial.md 卡片/按钮规范
 * 交互参考：VS Code 侧边栏（清晰层级 + 分组折叠）
 * - 桌面端：240px 固定宽度，可整体折叠为 72px 图标栏
 * - 一级目录：点击标题区域展开/收起子菜单，折叠箭头在最左侧
 * - 移动端：覆盖式抽屉，点击遮罩关闭
 * @param {{ collapsed: boolean, onToggleCollapse: (v: boolean) => void }} props
 */
export default function Sidebar({ collapsed, onToggleCollapse }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // 初始化：所有分组默认展开（提升首次访问可发现性）
  const [expandedGroups, setExpandedGroups] = useState(
    () => new Set(TOOLS.map((g) => g.group))
  );

  // 路由切换时关闭移动端抽屉
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // 当前路由所在的分组 ID（用于自动展开 + 高亮）
  const activeGroupId = useMemo(() => {
    const currentToolId = location.pathname.replace('/tool/', '');
    for (const group of TOOLS) {
      if (group.items.some((item) => item.id === currentToolId)) {
        return group.group;
      }
    }
    return null;
  }, [location.pathname]);

  // 当前路由变化时，自动展开其所在分组（避免用户找不到当前位置）
  useEffect(() => {
    if (!activeGroupId) return;
    setExpandedGroups((prev) => {
      if (prev.has(activeGroupId)) return prev;
      const next = new Set(prev);
      next.add(activeGroupId);
      return next;
    });
  }, [activeGroupId]);

  /** 切换分组展开/收起 */
  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

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
        <nav className="industrial-scroll flex-1 overflow-y-auto p-2" aria-label="工具分组导航">
          {TOOLS.map((group) => (
            <SidebarGroup
              key={group.group}
              group={group}
              collapsed={collapsed}
              expanded={expandedGroups.has(group.group)}
              isGroupActive={activeGroupId === group.group}
              onToggle={() => toggleGroup(group.group)}
            />
          ))}
        </nav>

        {/* 底部整体折叠控制（仅桌面端） */}
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
 * 侧边栏分组：一级可折叠目录 + 二级工具项列表
 * 一级项结构：[折叠箭头 ▼/▶] [主图标 20×20] [分组标题 16px 加粗]
 * 二级项结构：[缩进 32px] [二级图标 20×20] [工具名 14px]
 * @param {{
 *   group: { group: string, icon: string, items: Array },
 *   collapsed: boolean,        // 侧边栏整体折叠状态
 *   expanded: boolean,         // 当前分组是否展开
 *   isGroupActive: boolean,    // 当前路由是否在此分组下
 *   onToggle: () => void
 * }} props
 */
function SidebarGroup({ group, collapsed, expanded, isGroupActive, onToggle }) {
  return (
    <div className="mb-1.5">
      {/* ===== 一级项：可点击的分组标题（整行触发折叠） ===== */}
      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? group.group : undefined}
        aria-expanded={!collapsed && expanded}
        className={[
          'group flex w-full items-center rounded-md',
          'transition-all duration-200 ease-mechanical',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          // 侧边栏整体折叠时：仅显示居中主图标
          collapsed ? 'justify-center px-2 py-2.5' : 'gap-2 px-2.5 py-2.5',
          // hover 加深背景，增强可点击感
          'hover:bg-muted/70',
          // 当前分组高亮：浅色背景 + 加粗（与二级项形成对比）
          isGroupActive && !collapsed ? 'bg-panel' : ''
        ].join(' ')}
      >
        {/* 折叠指示箭头：最左侧（VS Code 风格），仅在侧边栏展开时显示 */}
        {!collapsed && (
          <ChevronDown
            size={16}
            className={[
              'shrink-0 text-ink-muted transition-transform duration-300 ease-spring',
              expanded ? 'rotate-0' : '-rotate-90'
            ].join(' ')}
            aria-hidden="true"
          />
        )}
        {/* 主图标：统一 20×20 容器 */}
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center text-base"
          aria-hidden="true"
        >
          {group.icon}
        </span>
        {/* 一级标题：16px 加粗 */}
        {!collapsed && (
          <span
            className={[
              'flex-1 truncate text-left text-base',
              isGroupActive ? 'font-bold text-ink' : 'font-semibold text-ink'
            ].join(' ')}
          >
            {group.group}
          </span>
        )}
      </button>

      {/* ===== 二级菜单：grid 动画展开/收起（无需计算高度） ===== */}
      <div
        className={[
          // grid-rows 0fr ↔ 1fr 过渡：现代 CSS 高度动画方案
          'grid transition-all duration-300 ease-spring',
          collapsed ? 'md:grid-rows-[0fr]' : expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        ].join(' ')}
      >
        {/* overflow-hidden 包裹层：承载过渡内容 */}
        <div className="overflow-hidden">
          <ul className="mt-1 space-y-0.5 pl-8 pr-1">
            {group.items.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={`/tool/${item.id}`}
                  title={collapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    [
                      'group flex items-center rounded-md',
                      'transition-all duration-150 ease-mechanical',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      // 二级项高度
                      collapsed ? 'justify-center px-2 py-2' : 'gap-1 py-1.5 pl-3 pr-2',
                      // 选中态：accent 左边框 + muted 背景 + accent 文字（Industrial 高亮方案）
                      isActive
                        ? 'bg-muted text-accent shadow-recessed border-l-2 border-accent'
                        : 'text-ink-muted hover:bg-muted/50 hover:text-ink'
                    ].join(' ')
                  }
                >
                  {/* 二级图标：统一 20×20 容器（与一级主图标对齐） */}
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center text-sm"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  {/* 二级文字：14px */}
                  {!collapsed && (
                    <span className="truncate text-sm">{item.name}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
