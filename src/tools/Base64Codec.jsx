import React, { useState, useCallback } from 'react';
import { Copy, Check, ArrowRightLeft, AlertCircle, Binary } from 'lucide-react';

/**
 * Base64Codec - Base64 编码/解码工具
 * 支持 UTF-8 安全转换（处理多字节字符）
 */
export default function Base64Codec() {
  const [plainText, setPlainText] = useState('');
  const [base64Text, setBase64Text] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  /** UTF-8 安全的 Base64 编码：使用 TextEncoder 处理多字节字符 */
  const encode = useCallback(() => {
    if (!plainText) {
      setBase64Text('');
      setError('');
      return;
    }
    try {
      const bytes = new TextEncoder().encode(plainText);
      let binary = '';
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      setBase64Text(btoa(binary));
      setError('');
    } catch (e) {
      setError(`编码失败：${e.message}`);
    }
  }, [plainText]);

  /** UTF-8 安全的 Base64 解码：使用 TextDecoder 还原多字节字符 */
  const decode = useCallback(() => {
    if (!base64Text) {
      setPlainText('');
      setError('');
      return;
    }
    try {
      const binary = atob(base64Text.trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      setPlainText(new TextDecoder().decode(bytes));
      setError('');
    } catch (e) {
      setError(`解码失败：输入不是有效的 Base64 字符串`);
    }
  }, [base64Text]);

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
      <ToolHeader title="Base64 编码/解码" description="UTF-8 安全的 Base64 编码与解码，支持多字节字符" />

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
              <Binary size={12} /> 明文 // PLAIN
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
            placeholder="输入要编码的文本..."
            className="industrial-textarea industrial-scroll h-56"
          />
        </div>

        {/* Base64 输入 */}
        <div className="industrial-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">Base64 // ENCODED</span>
            <button
              type="button"
              onClick={() => handleCopy(base64Text, 'b64')}
              className="btn-industrial-ghost text-xs"
            >
              {copied === 'b64' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <textarea
            value={base64Text}
            onChange={(e) => setBase64Text(e.target.value)}
            placeholder="输入要解码的 Base64..."
            className="industrial-textarea industrial-scroll h-56"
          />
        </div>
      </div>

      {/* 操作按钮：双向转换 */}
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={encode} className="btn-industrial-primary">
          <ArrowRightLeft size={16} /> 编码 →
        </button>
        <button type="button" onClick={decode} className="btn-industrial-secondary">
          <ArrowRightLeft size={16} className="rotate-180" /> ← 解码
        </button>
      </div>
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
