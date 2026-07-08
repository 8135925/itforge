import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, RefreshCw, KeyRound } from 'lucide-react';

/**
 * TokenGenerator - Token 生成器
 * 使用 crypto.getRandomValues 生成密码学安全的随机令牌
 */
export default function TokenGenerator() {
  const [token, setToken] = useState('');
  const [length, setLength] = useState(32);
  const [charset, setCharset] = useState('alphanumeric');
  const [copied, setCopied] = useState(false);

  /** 字符集定义 */
  const CHARSETS = {
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    hex: '0123456789abcdef',
    'hex-upper': '0123456789ABCDEF',
    base62: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    numeric: '0123456789',
    'special-chars': '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  /** 生成安全随机令牌 */
  const generate = useCallback(() => {
    const chars = CHARSETS[charset];
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    setToken(result);
  }, [length, charset]);

  // 初始化生成一次
  useEffect(() => {
    generate();
    // 仅首次挂载生成
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 剪贴板访问失败静默处理 */
    }
  }, [token]);

  return (
    <div className="space-y-4">
      <ToolHeader title="Token 生成器" description="生成密码学安全的随机令牌，支持自定义长度与字符集" />

      {/* 配置面板 */}
      <div className="industrial-card space-y-4 p-5">
        {/* 长度滑块 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">长度 // LENGTH</span>
            <span className="font-mono text-lg font-bold text-accent">{length}</span>
          </div>
          <input
            type="range"
            min="8"
            max="128"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </div>

        {/* 字符集选择 */}
        <div>
          <span className="tech-label mb-2 block">字符集 // CHARSET</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.keys(CHARSETS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCharset(key)}
                className={[
                  'rounded-md px-3 py-2 font-mono text-xs font-bold uppercase transition-all duration-150',
                  charset === key
                    ? 'bg-chassis text-accent shadow-card'
                    : 'bg-muted/50 text-ink-muted shadow-recessed hover:text-ink'
                ].join(' ')}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={generate} className="btn-industrial-primary">
            <RefreshCw size={16} /> 重新生成
          </button>
          <button type="button" onClick={handleCopy} className="btn-industrial-secondary">
            {copied ? <Check size={16} /> : <Copy size={16} />} 复制
          </button>
        </div>
      </div>

      {/* 结果显示：纯色深色表面，无扫描线/网格 */}
      <div className="industrial-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound size={14} className="text-accent" />
            <span className="tech-label">生成的令牌 // TOKEN</span>
          </div>
          <span className="font-mono text-xxs text-ink-muted/60">{token.length} 位</span>
        </div>
        <div className="surface-display industrial-scroll break-all">
          {token || '点击生成按钮...'}
        </div>
      </div>
    </div>
  );
}

/** 工具头部 */
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
