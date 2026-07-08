import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Clock, ArrowRightLeft, Calendar } from 'lucide-react';

/**
 * DateConverter - 日期时间转换器
 * Unix 时间戳与 ISO 8601 互转，支持本地/UTC 时区显示
 */
export default function DateConverter() {
  const [timestamp, setTimestamp] = useState('');
  const [isoString, setIsoString] = useState('');
  const [copied, setCopied] = useState('');

  /** 同步当前时间 */
  const syncNow = useCallback(() => {
    const now = Date.now();
    setTimestamp(String(Math.floor(now / 1000)));
    setIsoString(new Date(now).toISOString());
  }, []);

  // 初始化为当前时间
  useEffect(() => {
    syncNow();
  }, [syncNow]);

  /** 时间戳 → ISO 字符串 */
  const fromTimestamp = useCallback((value) => {
    setTimestamp(value);
    if (!value) {
      setIsoString('');
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num)) {
      setIsoString('');
      return;
    }
    // 兼容秒/毫秒
    const ms = value.length > 10 ? num : num * 1000;
    setIsoString(new Date(ms).toISOString());
  }, []);

  /** ISO 字符串 → 时间戳 */
  const fromIso = useCallback((value) => {
    setIsoString(value);
    if (!value) {
      setTimestamp('');
      return;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      setTimestamp('');
      return;
    }
    setTimestamp(String(Math.floor(date.getTime() / 1000)));
  }, []);

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

  // 派生显示信息
  const derivedDate = isoString ? new Date(isoString) : null;
  const isValid = derivedDate && !Number.isNaN(derivedDate.getTime());

  return (
    <div className="space-y-4">
      <ToolHeader title="日期时间转换器" description="Unix 时间戳与 ISO 8601 互转，支持秒/毫秒自动识别" />

      <div className="industrial-card flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="led-on" aria-hidden="true" />
          <span className="tech-label">当前时间 // LIVE</span>
        </div>
        <button type="button" onClick={syncNow} className="btn-industrial-secondary">
          <Clock size={16} /> 同步现在
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Unix 时间戳输入 */}
        <div className="industrial-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">Unix 时间戳 // EPOCH</span>
            <button
              type="button"
              onClick={() => handleCopy(timestamp, 'ts')}
              className="btn-industrial-ghost text-xs"
            >
              {copied === 'ts' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <input
            type="text"
            value={timestamp}
            onChange={(e) => fromTimestamp(e.target.value)}
            placeholder="1700000000"
            className="industrial-input font-mono text-lg"
          />
          <p className="mt-2 font-mono text-xxs text-ink-muted/70">
            支持 10 位（秒）或 13 位（毫秒）
          </p>
        </div>

        {/* ISO 字符串输入 */}
        <div className="industrial-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">ISO 8601 // UTC</span>
            <button
              type="button"
              onClick={() => handleCopy(isoString, 'iso')}
              className="btn-industrial-ghost text-xs"
            >
              {copied === 'iso' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <input
            type="text"
            value={isoString}
            onChange={(e) => fromIso(e.target.value)}
            placeholder="2024-01-01T00:00:00.000Z"
            className="industrial-input font-mono text-sm"
          />
          <p className="mt-2 font-mono text-xxs text-ink-muted/70">标准 ISO 格式</p>
        </div>
      </div>

      {/* 转换方向指示 */}
      <div className="flex justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chassis shadow-card">
          <ArrowRightLeft size={18} className="text-accent" />
        </div>
      </div>

      {/* 派生信息展示 */}
      {isValid && (
        <div className="industrial-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-accent" />
            <span className="tech-label">解析结果 // PARSED</span>
          </div>
          <dl className="grid grid-cols-1 gap-3 font-mono text-sm sm:grid-cols-2">
            <InfoRow label="本地时间" value={derivedDate.toLocaleString('zh-CN')} />
            <InfoRow label="UTC 时间" value={derivedDate.toUTCString()} />
            <InfoRow label="星期" value={derivedDate.toLocaleDateString('zh-CN', { weekday: 'long' })} />
            <InfoRow label="毫秒时间戳" value={String(derivedDate.getTime())} />
          </dl>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-md bg-muted/40 px-3 py-2 shadow-recessed">
      <dt className="tech-label text-xxs">{label}</dt>
      <dd className="mt-1 break-all text-ink">{value}</dd>
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
