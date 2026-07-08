import React, { useState, useMemo, useCallback } from 'react';
import { Copy, Check, Hash } from 'lucide-react';
import { MD5, RIPEMD160, SHA1, SHA224, SHA256, SHA3, SHA384, SHA512, enc } from 'crypto-js';

/**
 * HashText - Hash 文本计算
 * 参考 it-tools-main 项目实现，支持 8 种哈希算法：
 *   MD5、SHA1、SHA256、SHA224、SHA512、SHA384、SHA3、RIPEMD160
 * 支持多种编码输出：Hex / Base64 / Base64url / Binary
 * 默认输入值：12345678
 */

// 算法映射表（与 it-tools-main 保持一致）
const ALGOS = {
  MD5,
  SHA1,
  SHA256,
  SHA224,
  SHA512,
  SHA384,
  SHA3,
  RIPEMD160
};
const ALGO_NAMES = Object.keys(ALGOS);

// 编码选项
const ENCODINGS = [
  { label: 'Hexadecimal (base 16)', value: 'Hex' },
  { label: 'Binary (base 2)', value: 'Bin' },
  { label: 'Base64 (base 64)', value: 'Base64' },
  { label: 'Base64url (base 64 with url safe chars)', value: 'Base64url' }
];

/**
 * 将十六进制字符串转换为二进制字符串
 * @param {string} hex - 十六进制字符串
 * @returns {string} 二进制字符串
 */
function convertHexToBin(hex) {
  return hex
    .trim()
    .split('')
    .map((byte) => Number.parseInt(byte, 16).toString(2).padStart(4, '0'))
    .join('');
}

/**
 * 按指定编码格式化哈希结果
 * @param {import('crypto-js').lib.WordArray} words - crypto-js WordArray
 * @param {string} encoding - 编码类型
 * @returns {string} 格式化后的哈希字符串
 */
function formatWithEncoding(words, encoding) {
  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }
  if (encoding === 'Base64url') {
    // crypto-js 无内置 Base64url，将 Base64 中的 +/ 替换为 -_ 并去掉 = padding
    return words
      .toString(enc.Base64)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return words.toString(enc[encoding]);
}

export default function HashText() {
  // 默认输入值：12345678（与 it-tools 行为一致）
  const [input, setInput] = useState('12345678');
  const [encoding, setEncoding] = useState('Hex');
  const [copied, setCopied] = useState('');

  /** 计算所有算法的哈希结果（输入变化时实时计算） */
  const results = useMemo(() => {
    if (!input) return {};
    const computed = {};
    for (const algo of ALGO_NAMES) {
      try {
        const words = ALGOS[algo](input);
        computed[algo] = formatWithEncoding(words, encoding);
      } catch (e) {
        computed[algo] = `计算失败：${e.message}`;
      }
    }
    return computed;
  }, [input, encoding]);

  /** 复制指定算法的哈希值 */
  const handleCopy = useCallback(async (value, key) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      /* 静默处理剪贴板访问失败 */
    }
  }, []);

  /** 清空输入 */
  const handleClear = useCallback(() => {
    setInput('');
    setCopied('');
  }, []);

  return (
    <div className="space-y-4">
      <ToolHeader title="Hash 文本" description="MD5、SHA1、SHA256、SHA224、SHA512、SHA384、SHA3、RIPEMD160 多算法哈希计算" />

      {/* 输入文本 + 编码选择 */}
      <div className="industrial-card space-y-4 p-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">输入文本 // INPUT</span>
            <button type="button" onClick={handleClear} className="btn-industrial-ghost text-xs">
              清空
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入要哈希的文本..."
            className="industrial-textarea industrial-scroll h-28"
            autoFocus
          />
        </div>

        {/* 摘要编码选择 */}
        <div>
          <span className="tech-label mb-2 block">摘要编码 // ENCODING</span>
          <div className="flex flex-wrap gap-2">
            {ENCODINGS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEncoding(opt.value)}
                title={opt.label}
                className={[
                  'rounded-md px-3 py-1.5 font-mono text-xs font-bold transition-all duration-150',
                  encoding === opt.value
                    ? 'bg-chassis text-accent shadow-card'
                    : 'bg-muted/50 text-ink-muted shadow-recessed hover:text-ink'
                ].join(' ')}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 哈希结果列表：实时计算，无需点击按钮 */}
      {input && Object.keys(results).length > 0 && (
        <div className="space-y-2.5">
          {ALGO_NAMES.map((algo) => (
            <div key={algo} className="industrial-card p-3">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="tech-label w-24 shrink-0">{algo}</span>
                <div className="flex flex-1 items-center justify-end gap-2">
                  <span className="font-mono text-xxs text-ink-muted/60">
                    {results[algo]?.length ?? 0} chars
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(results[algo], algo)}
                    className="btn-industrial-ghost p-1.5"
                    aria-label={`复制 ${algo} 哈希值`}
                  >
                    {copied === algo ? (
                      <Check size={14} className="text-accent" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
              <div className="surface-display industrial-scroll break-all !p-3 !text-xs">
                {results[algo]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空输入提示 */}
      {!input && (
        <div className="industrial-card flex items-center gap-2 p-4 font-mono text-sm text-ink-muted">
          <Hash size={16} /> 请输入文本以计算哈希值
        </div>
      )}
    </div>
  );
}

/**
 * 工具头部
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
