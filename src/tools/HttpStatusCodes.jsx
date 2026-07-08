import React, { useState, useMemo } from 'react';
import { Search, Radio } from 'lucide-react';
import { codesByCategories } from './httpStatusCodes.constants';

/**
 * HttpStatusCodes - HTTP 状态码查询
 * 按 1xx~5xx 分类展示 HTTP / WebDav 状态码含义，支持多关键词模糊搜索
 * 移植自 it-tools 的 http-status-codes，搜索改为原生关键词匹配
 */

// 预处理：为每个状态码附加所属分类名，便于搜索时匹配
const flatCodes = codesByCategories.flatMap(({ codes, category }) =>
  codes.map((code) => ({ ...code, category }))
);

export default function HttpStatusCodes() {
  const [search, setSearch] = useState('');

  /** 按空格切分关键词，全部命中(code/name/description/category)才匹配 */
  const filteredCategories = useMemo(() => {
    const keywords = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (keywords.length === 0) {
      return codesByCategories;
    }
    const matches = flatCodes.filter((item) => {
      const haystack = `${item.code} ${item.name} ${item.description} ${item.category}`.toLowerCase();
      return keywords.every((kw) => haystack.includes(kw));
    });
    return [{ category: '搜索结果', codes: matches }];
  }, [search]);

  return (
    <div className="space-y-4">
      <ToolHeader title="HTTP 状态码" description="查询 HTTP / WebDav 状态码含义，支持多关键词模糊搜索" />

      {/* 搜索框 */}
      <div className="industrial-card p-4">
        <div className="flex items-center gap-2">
          <Search size={16} className="shrink-0 text-ink-muted/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索状态码、名称或描述，如 404 not found"
            className="w-full bg-transparent font-mono text-sm text-ink outline-none placeholder:text-ink-muted/40"
          />
        </div>
      </div>

      {/* 分类列表 */}
      {filteredCategories.map(({ category, codes }) => (
        <div key={category} className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Radio size={14} className="text-ink-muted/60" />
            <h2 className="tech-label">{category}</h2>
            <span className="font-mono text-xxs text-ink-muted/50">{codes.length}</span>
          </div>

          {codes.length === 0 ? (
            <div className="industrial-card p-4 text-center font-mono text-sm text-ink-muted">
              无匹配结果
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {codes.map((item) => (
                <StatusCodeCard key={`${item.code}-${item.name}`} item={item} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** 单个状态码卡片：状态码 + 名称 + 描述 + 类型标签 */
function StatusCodeCard({ item }) {
  // 根据状态码前缀着色，便于快速识别
  const tone = toneByCode(item.code);
  return (
    <div className="industrial-card flex flex-col gap-1 p-3">
      <div className="flex items-center gap-2">
        <span className={`font-mono text-lg font-bold ${tone.text}`}>{item.code}</span>
        <span className="text-sm font-semibold text-ink">{item.name}</span>
        {item.type !== 'HTTP' && (
          <span className="ml-auto rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xxs text-ink-muted">
            {item.type}
          </span>
        )}
      </div>
      <p className="text-xs text-ink-muted">{item.description}</p>
    </div>
  );
}

/** 按 1xx~5xx 返回色调（仅文字色，避免背景干扰） */
function toneByCode(code) {
  if (code < 200) return { text: 'text-led-green' };
  if (code < 300) return { text: 'text-led-green' };
  if (code < 400) return { text: 'text-accent' };
  if (code < 500) return { text: 'text-accent' };
  return { text: 'text-accent' };
}

function ToolHeader({ title, description }) {
  return (
    <div className="industrial-card p-5">
      <div className="flex items-center gap-2">
        <span className="led-on" aria-hidden="true" />
        <span className="tech-label">TOOL // ACTIVE</span>
      </div>
      <h1 className="mt-2 text-2xl font-bold text-ink text-emboss">{title}</h1>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
    </div>
  );
}
