import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Check, Ticket, AlertCircle, ShieldCheck } from 'lucide-react';

/**
 * JwtParser - JWT 解析器
 * 解码 JWT 的 Header 与 Payload，不验证签名
 * 默认提供示例 token：HS256 算法，含用户信息、权限、过期时间等业务字段
 */

// 默认示例 JWT：HS256 + 用户认证 Payload（含 iss/sub/aud/exp/nbf/iat/jti 等标准声明）
const DEFAULT_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiIsImFkbWluIjp0cnVlLCJpc3MiOiJ1c2VyLXNlcnZpY2UiLCJleHAiOjE3ODM1MjY0MDAsInN1YiI6InVzcl8yMDI2MDcwODAwMSIsImF1ZCI6WyJbXCJvcmRlci1zZXJ2aWNlXCIiLCIgXCJwYXltZW50LXNlcnZpY2VcIl0iXSwibmJmIjoxNzgzNTI2NDAwLCJpYXQiOjE3ODM1MjY0MDAsImp0aSI6InRva19hMWIyYzNkNGU1ZjZnN2g4aTlqMCJ9.4wMNMKoQg9xbxq6wOyieiv01VHYh50D5B9R8jr4Fjy4';

export default function JwtParser() {
  const [token, setToken] = useState(DEFAULT_JWT);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  /** Base64Url 安全解码：替换字符并补齐 padding */
  const base64UrlDecode = (str) => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // 补齐 padding
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  };

  /** 解析结果：header + payload + signature + exp 状态 */
  const parsed = useMemo(() => {
    if (!token.trim()) {
      setError('');
      return null;
    }
    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      setError('JWT 格式错误：必须为 header.payload.signature 三段结构');
      return null;
    }
    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      setError('');
      return { header, payload, signature: parts[2] };
    } catch (e) {
      setError(`解码失败：${e.message}`);
      return null;
    }
  }, [token]);

  /** 判断 token 是否过期 */
  const expirationInfo = useMemo(() => {
    if (!parsed?.payload?.exp) return null;
    const expDate = new Date(parsed.payload.exp * 1000);
    const now = new Date();
    return {
      date: expDate,
      expired: now > expDate,
      remaining: Math.max(0, expDate - now)
    };
  }, [parsed]);

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
      <ToolHeader title="JWT 解析器" description="解码 JWT 的 Header 与 Payload，不验证签名" />

      <div className="industrial-card p-4">
        <span className="tech-label mb-2 block flex items-center gap-1">
          <Ticket size={12} /> JWT 令牌 // TOKEN
        </span>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IklURm9yZ2UifQ.signature"
          className="industrial-textarea industrial-scroll h-28 break-all font-mono text-xs"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-accent/10 px-4 py-3 font-mono text-sm text-accent shadow-recessed">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      {parsed && (
        <div className="space-y-4">
          {/* 过期信息 */}
          {expirationInfo && (
            <div
              className={[
                'flex items-center gap-2 rounded-md px-4 py-3 font-mono text-sm shadow-recessed',
                expirationInfo.expired
                  ? 'bg-accent/10 text-accent'
                  : 'bg-led-green/10 text-led-green'
              ].join(' ')}
            >
              {expirationInfo.expired ? <AlertCircle size={16} /> : <ShieldCheck size={16} />}
              <span>
                {expirationInfo.expired ? '已过期' : '有效'} · 过期时间：
                {expirationInfo.date.toLocaleString('zh-CN')}
              </span>
            </div>
          )}

          {/* Header */}
          <div className="industrial-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="tech-label">Header</span>
              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(parsed.header, null, 2), 'header')}
                className="btn-industrial-ghost text-xs"
              >
                {copied === 'header' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <pre className="surface-display industrial-scroll overflow-auto !p-3 !text-xs">
              {JSON.stringify(parsed.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="industrial-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="tech-label">Payload</span>
              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(parsed.payload, null, 2), 'payload')}
                className="btn-industrial-ghost text-xs"
              >
                {copied === 'payload' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <pre className="surface-display industrial-scroll overflow-auto !p-3 !text-xs">
              {JSON.stringify(parsed.payload, null, 2)}
            </pre>
          </div>

          {/* Signature */}
          <div className="industrial-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="tech-label">Signature</span>
              <button
                type="button"
                onClick={() => handleCopy(parsed.signature, 'sig')}
                className="btn-industrial-ghost text-xs"
              >
                {copied === 'sig' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="industrial-scroll break-all rounded-md bg-muted/50 p-3 font-mono text-xs text-ink-muted shadow-recessed">
              {parsed.signature}
            </div>
          </div>
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
