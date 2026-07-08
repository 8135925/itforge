import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Tag, AlertCircle } from 'lucide-react';

/**
 * XmlToJson - XML 转 JSON 工具
 * 使用浏览器内置 DOMParser 解析 XML，递归转换为 JSON 结构
 * 默认提供示例数据：用户配置文件（含嵌套、属性、列表）
 */

// 默认示例 XML：用户配置文件（含属性、嵌套元素、重复子节点）
const DEFAULT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<config id="app-001" version="1.0.0">
  <name>ITForge</name>
  <description>在线开发者工具箱</description>
  <server>
    <host>0.0.0.0</host>
    <port>3000</port>
    <debug>true</debug>
  </server>
  <features>
    <feature name="token-generator" enabled="true"/>
    <feature name="hash-text" enabled="true"/>
    <feature name="base64-codec" enabled="true"/>
    <feature name="json-formatter" enabled="true"/>
  </features>
  <author name="HL" email="dev@qq.com"/>
</config>`;

export default function XmlToJson() {
  const [xmlInput, setXmlInput] = useState(DEFAULT_XML);
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  /**
   * 递归将 DOM 节点转为 JSON 兼容对象
   * - 元素子节点同名时合并为数组
   * - 属性以 @ 前缀标记
   * - 文本节点直接返回字符串
   * @param {Element} node - DOM 元素节点
   * @returns {object|string}
   */
  const nodeToJson = (node) => {
    // 文本节点
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      return text || null;
    }
    // 元素节点
    if (node.nodeType === Node.ELEMENT_NODE) {
      const obj = {};
      // 处理属性
      for (const attr of node.attributes) {
        obj[`@${attr.name}`] = attr.value;
      }
      // 处理子节点
      const children = Array.from(node.childNodes);
      for (const child of children) {
        const value = nodeToJson(child);
        if (value === null) continue;
        const name = child.nodeName;
        if (obj[name] !== undefined) {
          // 同名节点合并为数组
          if (!Array.isArray(obj[name])) {
            obj[name] = [obj[name]];
          }
          obj[name].push(value);
        } else {
          obj[name] = value;
        }
      }
      // 纯文本元素：直接返回文本值
      const text = node.textContent.trim();
      const hasAttrs = node.attributes.length > 0;
      const hasChildElements = node.children.length > 0;
      if (!hasAttrs && !hasChildElements && text) {
        return text;
      }
      return obj;
    }
    return null;
  };

  /** 执行 XML → JSON 转换 */
  const convert = useCallback(() => {
    if (!xmlInput.trim()) {
      setError('请输入 XML 内容');
      setJsonOutput('');
      return;
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlInput, 'application/xml');
      // 检查解析错误
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML 格式无效');
      }
      const root = doc.documentElement;
      const result = { [root.nodeName]: nodeToJson(root) };
      setJsonOutput(JSON.stringify(result, null, 2));
      setError('');
    } catch (e) {
      setError(`解析失败：${e.message}`);
      setJsonOutput('');
    }
  }, [xmlInput]);

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

  // XML 输入变化时自动转换，默认示例立即可见结果
  useEffect(() => {
    convert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xmlInput]);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)]">
      <ToolHeader title="XML 到 JSON" description="XML 文档转换为 JSON 结构，属性以 @ 前缀标记" />

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-accent/10 px-4 py-3 font-mono text-sm text-accent shadow-recessed">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 flex-1 min-h-0">
        <div className="industrial-card flex flex-col p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label flex items-center gap-1">
              <Tag size={12} /> XML 输入
            </span>
            <span className="font-mono text-xxs text-ink-muted/60">{xmlInput.length} chars</span>
          </div>
          <textarea
            value={xmlInput}
            onChange={(e) => setXmlInput(e.target.value)}
            placeholder={'<root>\n  <item id="1">值</item>\n  <item id="2">值2</item>\n</root>'}
            className="industrial-textarea industrial-scroll flex-1 min-h-0 resize-none font-mono"
          />
        </div>
        <div className="industrial-card flex flex-col p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">JSON 输出</span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!jsonOutput}
              className="btn-industrial-ghost text-xs"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} 复制
            </button>
          </div>
          <textarea
            value={jsonOutput}
            readOnly
            placeholder="转换结果..."
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
