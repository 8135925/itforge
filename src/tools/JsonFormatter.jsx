import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Trash2, Minimize2, Maximize2, AlertCircle } from 'lucide-react';

/**
 * JsonFormatter - JSON 格式化工具
 * 功能：美化、压缩、校验 JSON，支持 2/4 空格缩进
 * 默认提供示例数据：用户信息 + 嵌套结构 + 数组
 */

// 默认示例 JSON：用户信息（含嵌套对象、数组、多种数据类型）
const DEFAULT_JSON = `{"name":"ITForge","version":"1.0.0","author":{"name":"HL","email":"dev@qq.com"},"features":["token","hash","base64"],"tags":["frontend","tools","react"],"config":{"port":3000,"debug":true,"rateLimit":100},"createdAt":"2026-07-08T00:00:00Z"}`;

export default function JsonFormatter() {
  const [input, setInput] = useState(DEFAULT_JSON);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  /** 格式化 JSON：解析后重新序列化（美化） */
  const formatJson = useCallback(() => {
    if (!input.trim()) {
      setError('请输入 JSON 内容');
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError('');
    } catch (e) {
      setError(`解析失败：${e.message}`);
      setOutput('');
    }
  }, [input, indent]);

  /** 压缩 JSON：去除所有空白 */
  const minifyJson = useCallback(() => {
    if (!input.trim()) {
      setError('请输入 JSON 内容');
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError(`解析失败：${e.message}`);
      setOutput('');
    }
  }, [input]);

  /** 复制结果到剪贴板 */
  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('剪贴板访问失败');
    }
  }, [output]);

  /** 清空输入输出 */
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError('');
  }, []);

  // 输入或缩进变化时自动格式化，默认示例立即可见结果
  useEffect(() => {
    formatJson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, indent]);

  return (
    <div className="space-y-4">
      {/* 工具头部 */}
      <ToolHeader
        title="JSON 格式化"
        description="美化、压缩、校验 JSON 数据，支持 2/4 空格缩进切换"
      />

      {/* 操作工具栏 */}
      <div className="industrial-card flex flex-wrap items-center gap-3 p-4">
        <button type="button" onClick={formatJson} className="btn-industrial-primary">
          <Maximize2 size={16} /> 格式化
        </button>
        <button type="button" onClick={minifyJson} className="btn-industrial-secondary">
          <Minimize2 size={16} /> 压缩
        </button>
        <div className="flex items-center gap-2">
          <span className="tech-label">缩进</span>
          <div className="flex rounded-md bg-muted p-1 shadow-recessed">
            {[2, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setIndent(n)}
                className={[
                  'rounded px-3 py-1 font-mono text-xs font-bold transition-all duration-150',
                  indent === n
                    ? 'bg-chassis text-accent shadow-card'
                    : 'text-ink-muted hover:text-ink'
                ].join(' ')}
              >
                {n} 空格
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output}
            className="btn-industrial-secondary"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? '已复制' : '复制'}
          </button>
          <button type="button" onClick={handleClear} className="btn-industrial-ghost">
            <Trash2 size={16} /> 清空
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-accent/10 px-4 py-3 font-mono text-sm text-accent shadow-recessed">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 输入输出双栏 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="industrial-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">输入 // SOURCE</span>
            <span className="font-mono text-xxs text-ink-muted/60">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value", "list": [1, 2, 3]}'
            className="industrial-textarea industrial-scroll h-80"
            spellCheck={false}
          />
        </div>
        <div className="industrial-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">输出 // RESULT</span>
            <span className="font-mono text-xxs text-ink-muted/60">{output.length} chars</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="格式化结果将在此显示..."
            className="industrial-textarea industrial-scroll h-80 bg-muted/40"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 工具头部：标题 + 描述（工业标签风格）
 * @param {{title:string, description:string}} props
 */
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
