import React, { useState, useCallback } from 'react';
import { Copy, Check, Hash, AlertCircle } from 'lucide-react';

/**
 * HashText - Hash 文本计算
 * 使用 Web Crypto API (SubtleCrypto) 计算 SHA-1/256/384/512
 */
export default function HashText() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState({});
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

  /** 计算 hash：将文本编码后通过 SubtleCrypto 摘要 */
  const computeHash = useCallback(async () => {
    if (!input) {
      setError('请输入要哈希的文本');
      setResults({});
      return;
    }
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const computed = {};
      // 并行计算所有算法
      await Promise.all(
        ALGORITHMS.map(async (algo) => {
          const hashBuffer = await crypto.subtle.digest(algo, data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          computed[algo] = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        })
      );
      setResults(computed);
      setError('');
    } catch (e) {
      setError(`计算失败：${e.message}`);
    }
  }, [input]);

  const handleCopy = useCallback(async (value, key) => {
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
      <ToolHeader title="Hash 文本" description="使用 Web Crypto API 计算 SHA-1/256/384/512 哈希值" />

      <div className="industrial-card p-4">
        <span className="tech-label mb-2 block">输入文本 // INPUT</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要哈希的文本..."
          className="industrial-textarea industrial-scroll h-32"
        />
        <div className="mt-3">
          <button type="button" onClick={computeHash} className="btn-industrial-primary">
            <Hash size={16} /> 计算哈希
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-accent/10 px-4 py-3 font-mono text-sm text-accent shadow-recessed">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="space-y-3">
          {ALGORITHMS.map((algo) => (
            <div key={algo} className="industrial-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="tech-label">{algo}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(results[algo], algo)}
                  className="btn-industrial-ghost text-xs"
                >
                  {copied === algo ? <Check size={14} /> : <Copy size={14} />}
                  {copied === algo ? '已复制' : '复制'}
                </button>
              </div>
              <div className="industrial-scroll break-all rounded-md bg-ink/95 p-3 font-mono text-xs text-led-green shadow-recessed">
                {results[algo]}
              </div>
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
