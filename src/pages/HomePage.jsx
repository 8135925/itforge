import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Cpu } from 'lucide-react';
import { TOOLS } from '../tools.config.js';

/**
 * HomePage - 首页
 * 布局：工业英雄区（状态 LED + 标语） + 工具卡片网格
 * 视觉规范：Industrial.md Card 样式（螺栓、通风槽、悬浮抬升）
 */
export default function HomePage() {
  const [query, setQuery] = useState('');

  // 搜索过滤：按工具名/描述匹配
  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.map((g) => ({
      ...g,
      items: g.items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.desc?.toLowerCase().includes(q) ?? false) ||
          i.id.toLowerCase().includes(q)
      )
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const totalTools = useMemo(
    () => TOOLS.reduce((acc, g) => acc + g.items.length, 0),
    []
  );

  return (
    <div className="space-y-8">
      {/* 英雄区：设备控制面板风格 */}
      <section className="industrial-card relative overflow-hidden p-6 sm:p-10">
        {/* 装饰通风槽（右上角） */}
        <div className="absolute right-4 top-4 hidden gap-1 md:flex" aria-hidden="true">
          <div className="vent-slot" />
          <div className="vent-slot" />
          <div className="vent-slot" />
        </div>

        <div className="relative flex flex-col items-start gap-4">
          {/* 状态徽章：LED + 技术标签 */}
          <div className="flex items-center gap-2 rounded-full bg-chassis px-3 py-1.5 shadow-recessed">
            <span className="led-on" aria-hidden="true" />
            <span className="tech-label">系统就绪 · SYSTEM OPERATIONAL</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-ink text-emboss sm:text-5xl">
            ITForge：开发者的技术锻造工坊
          </h1>
          <span className="mt-3 block font-mono text-lg font-medium text-accent sm:text-2xl">
            ITForge // v1.0.0
          </span>

          <p className="max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            <span className="block">纯前端锻造工业级开发利器：加密、转换、编解码，</span>
            <span className="block">万般计算皆在浏览器熔炉中淬炼成型——数据主权，寸步不离本地。</span>
          </p>

          {/* 统计条 */}
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs uppercase tracking-stamped text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Cpu size={14} className="text-accent" />
              {totalTools} 个工具
            </span>
            <span className="text-border-deep">|</span>
            <span>纯前端运行</span>
            <span className="text-border-deep">|</span>
            <span>离线可用</span>
          </div>

          {/* 搜索框：凹陷数据槽 */}
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索工具名称或关键词..."
              className="industrial-input !pl-11"
              aria-label="搜索工具"
            />
          </div>
        </div>
      </section>

      {/* 工具分组卡片网格 */}
      {filteredGroups.length === 0 ? (
        <div className="industrial-card p-8 text-center text-ink-muted">
          <p className="font-mono text-sm">未找到匹配 "{query}" 的工具</p>
        </div>
      ) : (
        filteredGroups.map((group) => (
          <section key={group.group}>
            {/* 分组标题 */}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">{group.icon}</span>
              <h2 className="tech-label text-sm">{group.group}</h2>
              <div className="ml-2 h-px flex-1 bg-border-deep/30" aria-hidden="true" />
            </div>
            {/* 卡片网格：1 列移动端 / 2 列平板 / 3 列桌面 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <ToolCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

/**
 * 工具卡片：螺栓固定面板 + 悬浮抬升交互
 */
function ToolCard({ item }) {
  return (
    <Link
      to={`/tool/${item.id}`}
      className="industrial-card industrial-card-hover group block p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between">
        {/* 图标外壳：凹陷圆形承载 */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chassis shadow-recessed">
          <span className="text-2xl" aria-hidden="true">{item.icon}</span>
        </div>
        {/* 右上角通风槽装饰 */}
        <div className="flex gap-0.5 opacity-60" aria-hidden="true">
          <div className="h-4 w-0.5 rounded-full bg-muted shadow-[inset_1px_1px_2px_rgba(0,0,0,0.15)]" />
          <div className="h-4 w-0.5 rounded-full bg-muted shadow-[inset_1px_1px_2px_rgba(0,0,0,0.15)]" />
        </div>
      </div>

      <h3 className="mt-4 text-base font-bold text-ink">{item.name}</h3>
      {item.desc && (
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{item.desc}</p>
      )}

      {/* 底部操作行：技术标签 + 箭头 */}
      <div className="mt-4 flex items-center justify-between">
        <span className="tech-label">#{item.id}</span>
        <ArrowRight
          size={16}
          className="text-ink-muted transition-all duration-200 ease-spring group-hover:translate-x-1 group-hover:text-accent"
        />
      </div>
    </Link>
  );
}
