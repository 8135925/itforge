import React, { useState, useCallback } from 'react';
import { Copy, Check, ArrowRightLeft, AlertCircle, Link } from 'lucide-react';

/**
 * UrlEncoder - URL 编码/解码工具
 * 参照 it-tools 实现，提供两种模式：
 *   - encodeURI / decodeURI       ：保留 URL 特殊字符（: / ? # [ ] @ ! $ & ' ( ) * + , ; =），适用于完整 URL
 *   - encodeURIComponent / decodeURIComponent：编码所有非字母数字字符，适用于单个查询参数
 * 默认提供示例 URL，便于即时验证双向转换
 */

// 默认示例：含中文与查询参数的完整 URL
const DEFAULT_PLAIN = 'https://itforge.example.com/search?q=开发者工具&lang=zh-CN&page=1';

/** 模式枚举：两种编码范围 */
const MODES = [
  { key: 'component', label: 'encodeURIComponent', desc: '组件级（参数值）' },
  { key: 'uri', label: 'encodeURI', desc: 'URI 级（完整 URL）' }
];

export default function UrlEncoder() {
  const [plainText, setPlainText] = useState(DEFAULT_PLAIN);
  // 默认使用 encodeURIComponent，能完整编码中文与特殊字符，便于演示
  const [mode, setMode] = useState('component');
  const [encodedText, setEncodedText] = useState(() => encode(DEFAULT_PLAIN, 'component'));
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  /** 根据模式执行编码 */
  function encode(text, m) {
    if (!text) return '';
    return m === 'uri' ? encodeURI(text) : encodeURIComponent(text);
  }

  /** 根据模式执行解码 */
  function decode(text, m) {
    if (!text) return '';
    return m === 'uri' ? decodeURI(text) : decodeURIComponent(text);
  }

  /** 编码回调：明文 → 编码文本 */
  const handleEncode = useCallback(() => {
    if (!plainText) {
      setEncodedText('');
      setError('');
      return;
    }
    try {
      setEncodedText(encode(plainText, mode));
      setError('');
    } catch (e) {
      setError(`编码失败：${e.message}`);
    }
  }, [plainText, mode]);

  /** 解码回调：编码文本 → 明文 */
  const handleDecode = useCallback(() => {
    if (!encodedText) {
      setPlainText('');
      setError('');
      return;
    }
    try {
      setPlainText(decode(encodedText, mode));
      setError('');
    } catch (e) {
      setError(`解码失败：输入包含无效的转义序列`);
    }
  }, [encodedText, mode]);

  /** 切换模式时，基于明文重新编码，保证两侧始终对应 */
  const switchMode = useCallback(
    (nextMode) => {
      if (nextMode === mode) return;
      setMode(nextMode);
      try {
        setEncodedText(encode(plainText, nextMode));
        setError('');
      } catch (e) {
        setError(`编码失败：${e.message}`);
      }
    },
    [mode, plainText]
  );

  /** 复制到剪贴板 */
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
      <ToolHeader title="URL 编码/解码" description="对 URL 字符串进行编码与解码，支持完整 URL 与组件级两种模式" />

      {/* 模式切换 */}
      <div className="industrial-card flex flex-wrap items-center gap-3 p-4">
        <span className="tech-label">编码模式</span>
        <div className="flex rounded-md bg-muted p-1 shadow-recessed">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => switchMode(m.key)}
              title={m.desc}
              className={[
                'rounded px-3 py-1 font-mono text-xs font-bold transition-all duration-150',
                mode === m.key
                  ? 'bg-chassis text-accent shadow-card'
                  : 'text-ink-muted hover:text-ink'
              ].join(' ')}
            >
              {m.label}
            </button>
          ))}
        </div>
        <span className="font-mono text-xxs text-ink-muted/70">
          {mode === 'uri' ? '保留 :/?#[]@!$&\'()*+,;= 等分隔符' : '编码所有非字母数字字符'}
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-accent/10 px-4 py-3 font-mono text-sm text-accent shadow-recessed">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 明文输入 */}
        <div className="industrial-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label flex items-center gap-1">
              <Link size={12} /> 原始文本 // PLAIN
            </span>
            <button
              type="button"
              onClick={() => handleCopy(plainText, 'plain')}
              className="btn-industrial-ghost text-xs"
            >
              {copied === 'plain' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <textarea
            value={plainText}
            onChange={(e) => setPlainText(e.target.value)}
            placeholder="输入要编码的 URL 或文本..."
            className="industrial-textarea industrial-scroll h-56"
          />
        </div>

        {/* 编码结果 */}
        <div className="industrial-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">编码结果 // ENCODED</span>
            <button
              type="button"
              onClick={() => handleCopy(encodedText, 'enc')}
              className="btn-industrial-ghost text-xs"
            >
              {copied === 'enc' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <textarea
            value={encodedText}
            onChange={(e) => setEncodedText(e.target.value)}
            placeholder="输入要解码的 URL 编码字符串..."
            className="industrial-textarea industrial-scroll h-56 font-mono"
          />
        </div>
      </div>

      {/* 操作按钮：双向转换 */}
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={handleEncode} className="btn-industrial-primary">
          <ArrowRightLeft size={16} /> 编码 →
        </button>
        <button type="button" onClick={handleDecode} className="btn-industrial-secondary">
          <ArrowRightLeft size={16} className="rotate-180" /> ← 解码
        </button>
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
