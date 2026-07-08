import React, { useState, useCallback } from 'react';
import { Copy, Check, Type, ArrowRight } from 'lucide-react';

/**
 * CaseConverter - 大小写转换工具
 * 支持 camelCase / PascalCase / snake_case / kebab-case / CONSTANT_CASE 等互转
 * 默认提供示例文本 "abc123"，便于即时查看各命名风格的转换效果
 */

// 默认示例输入：字母+数字组合，便于验证分词与转换逻辑
const DEFAULT_INPUT = 'abc123';

/**
 * 将任意字符串拆分为单词数组
 * 支持 camelCase / PascalCase / snake_case / kebab-case / 空格分隔
 */
function splitWords(text) {
  if (!text) return [];
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')  // camelCase 分词
    .replace(/[_\-]+/g, ' ')                  // 下划线/连字符转空格
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

/** 转换函数集合：将单词数组映射为各种命名风格 */
const converters = {
  camelCase: (words) =>
    words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join(''),
  PascalCase: (words) =>
    words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''),
  snake_case: (words) => words.map((w) => w.toLowerCase()).join('_'),
  'kebab-case': (words) => words.map((w) => w.toLowerCase()).join('-'),
  CONSTANT_CASE: (words) => words.map((w) => w.toUpperCase()).join('_'),
  'lower case': (words) => words.map((w) => w.toLowerCase()).join(' '),
  'UPPER CASE': (words) => words.map((w) => w.toUpperCase()).join(' '),
  'Title Case': (words) => words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
};

/** 对输入文本执行全部转换，返回结果对象 */
function convertAll(text) {
  if (!text) return {};
  const words = splitWords(text);
  const computed = {};
  for (const [name, fn] of Object.entries(converters)) {
    computed[name] = fn(words);
  }
  return computed;
}

export default function CaseConverter() {
  // 惰性初始化：默认填入示例文本并预计算全部转换结果
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [results, setResults] = useState(() => convertAll(DEFAULT_INPUT));
  const [copied, setCopied] = useState('');

  /** 执行转换：基于当前输入重新计算所有命名风格 */
  const convert = useCallback(() => {
    setResults(convertAll(input));
  }, [input]);

  const handleCopy = useCallback(async (value, key) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      /* 静默 */
    }
  }, []);

  return (
    <div className="space-y-4">
      <ToolHeader title="大小写转换" description="camelCase / snake_case / kebab-case 等多种命名风格互转" />

      <div className="industrial-card p-4">
        <span className="tech-label mb-2 block">输入文本 // INPUT</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要转换的文本，如 camelCaseVariableName"
          className="industrial-textarea industrial-scroll h-24"
        />
        <div className="mt-3">
          <button type="button" onClick={convert} className="btn-industrial-primary">
            <Type size={16} /> 转换全部
          </button>
        </div>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-2">
          {Object.entries(results).map(([name, value]) => (
            <div key={name} className="industrial-card flex items-center gap-3 p-3">
              <div className="w-32 shrink-0">
                <span className="tech-label">{name}</span>
              </div>
              <ArrowRight size={14} className="shrink-0 text-ink-muted/50" />
              <code className="flex-1 break-all font-mono text-sm text-ink">{value || '(空)'}</code>
              <button
                type="button"
                onClick={() => handleCopy(value, name)}
                className="btn-industrial-ghost shrink-0 p-2"
                aria-label={`复制 ${name}`}
              >
                {copied === name ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
