import React, { useState, useCallback, useEffect } from 'react';
import yaml from 'js-yaml';
import { Copy, Check, ArrowRight, ArrowLeft, FileText, AlertCircle } from 'lucide-react';

/**
 * YamlToJson - YAML 与 JSON 互转工具
 * 依赖 js-yaml 库实现解析
 * 默认提供示例数据：应用配置文件（含嵌套、列表、多类型）
 */

// 默认示例 YAML：应用配置文件
const DEFAULT_YAML = `# ITForge 应用配置
name: ITForge
version: 1.0.0
description: 在线开发者工具箱

server:
  host: 0.0.0.0
  port: 3000
  debug: true

database:
  driver: postgres
  url: postgres://localhost:5432/itforge
  pool:
    min: 5
    max: 20

features:
  - token-generator
  - hash-text
  - base64-codec
  - json-formatter

author:
  name: HL
  email: dev@qq.com
  url: https://ittool.qq.com`;

export default function YamlToJson() {
  const [yamlInput, setYamlInput] = useState(DEFAULT_YAML);
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  /** YAML → JSON */
  const yamlToJson = useCallback(() => {
    if (!yamlInput.trim()) {
      setError('请输入 YAML 内容');
      setJsonOutput('');
      return;
    }
    try {
      const parsed = yaml.load(yamlInput);
      if (parsed === null || parsed === undefined) {
        setError('YAML 内容为空');
        setJsonOutput('');
        return;
      }
      setJsonOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError(`YAML 解析失败：${e.message}`);
      setJsonOutput('');
    }
  }, [yamlInput]);

  /** JSON → YAML */
  const jsonToYaml = useCallback(() => {
    if (!jsonOutput.trim()) {
      setError('请输入 JSON 内容');
      return;
    }
    try {
      const parsed = JSON.parse(jsonOutput);
      setYamlInput(yaml.dump(parsed, { indent: 2, lineWidth: 120 }));
      setError('');
    } catch (e) {
      setError(`JSON 解析失败：${e.message}`);
    }
  }, [jsonOutput]);

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

  // YAML 输入变化时自动转换为 JSON，默认示例立即可见结果
  useEffect(() => {
    yamlToJson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yamlInput]);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)]">
      <ToolHeader title="YAML 到 JSON" description="YAML 与 JSON 双向互转，适用于配置文件处理" />

      {/* 双向转换按钮 */}
      <div className="industrial-card flex flex-wrap justify-center gap-3 p-4">
        <button type="button" onClick={yamlToJson} className="btn-industrial-primary">
          <ArrowRight size={16} /> YAML → JSON
        </button>
        <button type="button" onClick={jsonToYaml} className="btn-industrial-secondary">
          <ArrowLeft size={16} /> JSON → YAML
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!jsonOutput}
          className="btn-industrial-ghost"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />} 复制 JSON
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
              <FileText size={12} /> YAML
            </span>
            <span className="font-mono text-xxs text-ink-muted/60">{yamlInput.length} chars</span>
          </div>
          <textarea
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
            placeholder={'name: ITForge\nversion: 1.0.0\nfeatures:\n  - token\n  - hash'}
            className="industrial-textarea industrial-scroll flex-1 min-h-0 resize-none font-mono"
          />
        </div>
        <div className="industrial-card flex flex-col p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">JSON</span>
            <span className="font-mono text-xxs text-ink-muted/60">{jsonOutput.length} chars</span>
          </div>
          <textarea
            value={jsonOutput}
            onChange={(e) => setJsonOutput(e.target.value)}
            placeholder='{"key": "value"}'
            className="industrial-textarea industrial-scroll flex-1 min-h-0 resize-none bg-muted/40 font-mono"
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
