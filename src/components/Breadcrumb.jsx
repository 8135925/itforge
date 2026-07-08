import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { findToolById, TOOLS } from '../tools.config.js';

/**
 * Breadcrumb - 面包屑导航
 * 路径：首页 / 工具组 / 工具名称
 */
export default function Breadcrumb() {
  const location = useLocation();
  const { toolId } = useParams();

  // 首页不显示面包屑
  if (location.pathname === '/') return null;

  const tool = toolId ? findToolById(toolId) : null;
  const groupName = tool
    ? TOOLS.find((g) => g.items.some((i) => i.id === tool.id))?.group
    : null;

  return (
    <nav aria-label="面包屑导航" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-ink-muted">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 rounded px-2 py-1 transition-colors duration-150 hover:text-accent"
          >
            <Home size={14} />
            <span className="uppercase tracking-stamped">首页</span>
          </Link>
        </li>
        {groupName && (
          <>
            <li aria-hidden="true" className="text-border-deep">
              <ChevronRight size={12} />
            </li>
            <li className="px-2 py-1 uppercase tracking-stamped">{groupName}</li>
          </>
        )}
        {tool && (
          <>
            <li aria-hidden="true" className="text-border-deep">
              <ChevronRight size={12} />
            </li>
            <li className="px-2 py-1 uppercase tracking-stamped text-accent">{tool.name}</li>
          </>
        )}
      </ol>
    </nav>
  );
}
