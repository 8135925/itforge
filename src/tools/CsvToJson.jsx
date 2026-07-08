import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, FileSpreadsheet, ArrowRight, AlertCircle } from 'lucide-react';

/**
 * CsvToJson - CSV 转 JSON 工具
 * 支持自定义分隔符、首行作为表头、引号包裹字段
 * 默认提供示例数据：开发者信息表（含表头 + 3 条记录）
 */

// 默认示例 CSV：开发者信息表
const DEFAULT_CSV = `name,age,city,role,active
Alice,30,Beijing,Engineer,true
Bob,25,Shanghai,Designer,false
Charlie,28,Shenzhen,Manager,true`;

export default function CsvToJson() {
  const [csvInput, setCsvInput] = useState(DEFAULT_CSV);
  const [jsonOutput, setJsonOutput] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  /**
   * 解析 CSV 单行：支持引号包裹的字段与转义引号
   * @param {string} line - 单行 CSV
   * @param {string} delim - 分隔符
   * @returns {string[]} 字段数组
   */
  const parseLine = (line, delim) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // 转义引号："" → "
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delim && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map((s) => s.trim());
  };

  /** 执行 CSV → JSON 转换 */
  const convert = useCallback(() => {
    if (!csvInput.trim()) {
      setError('请输入 CSV 内容');
      setJsonOutput('');
      return;
    }
    try {
      const lines = csvInput.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length === 0) {
        setError('CSV 内容为空');
        setJsonOutput('');
        return;
      }
      const rows = lines.map((line) => parseLine(line, delimiter));
      let result;
      if (hasHeader && rows.length > 0) {
        const headers = rows[0];
        result = rows.slice(1).map((row) => {
          const obj = {};
          headers.forEach((h, i) => {
            obj[h || `field_${i}`] = row[i] ?? '';
          });
          return obj;
        });
      } else {
        result = rows;
      }
      setJsonOutput(JSON.stringify(result, null, 2));
      setError('');
    } catch (e) {
      setError(`解析失败：${e.message}`);
      setJsonOutput('');
    }
  }, [csvInput, delimiter, hasHeader]);

  const handleCopy = useCallback(async () => {
    if (!jsonOutput) return;
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 静默 */
    }
  }, [jsonOutput]);

  // 输入或配置变化时自动转换，默认示例立即可见结果
  useEffect(() => {
    convert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csvInput, delimiter, hasHeader]);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)]">
      <ToolHeader title="CSV 到 JSON" description="CSV 数据解析为 JSON 数组，支持自定义分隔符与表头" />

      {/* 配置面板 */}
      <div className="industrial-card flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <span className="tech-label">分隔符</span>
          <div className="flex rounded-md bg-muted p-1 shadow-recessed">
            {[
              { key: ',', label: '逗号' },
              { key: ';', label: '分号' },
              { key: '\t', label: 'Tab' },
              { key: '|', label: '竖线' }
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setDelimiter(opt.key)}
                className={[
                  'rounded px-3 py-1 font-mono text-xs font-bold transition-all',
                  delimiter === opt.key
                    ? 'bg-chassis text-accent shadow-card'
                    : 'text-ink-muted hover:text-ink'
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={hasHeader}
            onChange={(e) => setHasHeader(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          <span className="tech-label">首行为表头</span>
        </label>
        <button type="button" onClick={convert} className="btn-industrial-primary ml-auto">
          <ArrowRight size={16} /> 转换
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-accent/10 px-4 py-3 font-mono text-sm text-accent shadow-recessed">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 flex-1 min-h-0">
        <div className="industrial-card flex flex-col p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label flex items-center gap-1">
              <FileSpreadsheet size={12} /> CSV 输入
            </span>
            <span className="font-mono text-xxs text-ink-muted/60">{csvInput.length} chars</span>
          </div>
          <textarea
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder={'name,age,city\nAlice,30,Beijing\nBob,25,Shanghai'}
            className="industrial-textarea industrial-scroll flex-1 min-h-0 resize-none"
          />
        </div>
        <div className="industrial-card flex flex-col p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">JSON 输出</span>
            <button type="button" onClick={handleCopy} disabled={!jsonOutput} className="btn-industrial-ghost text-xs">
              {copied ? <Check size={14} /> : <Copy size={14} />} 复制
            </button>
          </div>
          <textarea
            value={jsonOutput}
            readOnly
            placeholder="转换结果..."
            className="industrial-textarea industrial-scroll flex-1 min-h-0 resize-none bg-muted/40"
          />
        </div>
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
