import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Trash2, Minimize2, Maximize2, AlertCircle, Code2 } from 'lucide-react';

/**
 * XmlFormatter - XML 格式化工具
 * 参照 it-tools 实现，功能：美化、压缩、校验 XML，支持 2/4 空格缩进
 * 使用浏览器内置 DOMParser 解析，手动递归序列化以实现可控缩进
 * 默认提供示例数据：用户配置文件（含属性、嵌套、列表）
 */

// 默认示例 XML：压缩形态，便于演示格式化效果
const DEFAULT_XML = `<?xml version="1.0" encoding="UTF-8"?><config id="app-001" version="1.0.0"><name>ITForge</name><description>在线开发者工具箱</description><server><host>0.0.0.0</host><port>3000</port><debug>true</debug></server><features><feature name="token-generator" enabled="true"/><feature name="hash-text" enabled="true"/></features></config>`;

export default function XmlFormatter() {
  const [input, setInput] = useState(DEFAULT_XML);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  /**
   * 递归将 DOM 节点序列化为带缩进的 XML 字符串
   * - 元素：标签 + 属性 + 换行递归子节点
   * - 文本节点：非空时单行输出
   * - 注释节点：保留并缩进
   * @param {Node} node     - 当前 DOM 节点
   * @param {number} depth  - 当前缩进深度
   * @param {string} pad    - 单层缩进字符串（如 '  '）
   * @returns {string} 序列化结果
   */
  const serializeNode = (node, depth, pad) => {
    const indentation = pad.repeat(depth);
    // 元素节点
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.nodeName;
      // 拼接属性
      const attrs = Array.from(node.attributes)
        .map((a) => `${a.name}="${a.value}"`)
        .join(' ');
      const attrStr = attrs ? ' ' + attrs : '';
      // 子节点过滤：仅保留元素 / 文本 / 注释
      const children = Array.from(node.childNodes).filter(
        (c) =>
          c.nodeType === Node.ELEMENT_NODE ||
          c.nodeType === Node.TEXT_NODE ||
          c.nodeType === Node.COMMENT_NODE
      );
      // 空元素：自闭合
      if (children.length === 0) {
        return `${indentation}<${tag}${attrStr}/>`;
      }
      // 仅含纯文本的叶子元素：单行输出，避免多余换行
      const onlyText =
        children.length === 1 && children[0].nodeType === Node.TEXT_NODE;
      if (onlyText) {
        const text = children[0].textContent.trim();
        if (text) {
          return `${indentation}<${tag}${attrStr}>${escapeXmlText(text)}</${tag}>`;
        }
        return `${indentation}<${tag}${attrStr}/>`;
      }
      // 含子元素：换行递归
      const inner = children
        .map((c) => serializeNode(c, depth + 1, pad))
        .filter((s) => s !== '')
        .join('\n');
      return `${indentation}<${tag}${attrStr}>\n${inner}\n${indentation}</${tag}>`;
    }
    // 文本节点：仅保留非空白内容
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      return text ? `${indentation}${escapeXmlText(text)}` : '';
    }
    // 注释节点：保留
    if (node.nodeType === Node.COMMENT_NODE) {
      return `${indentation}<!--${node.textContent}-->`;
    }
    return '';
  };

  /** 转义 XML 文本内容中的特殊字符 */
  function escapeXmlText(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /** 压缩 XML：去除节点间多余空白，输出单行紧凑形态 */
  const minifyXml = useCallback(() => {
    if (!input.trim()) {
      setError('请输入 XML 内容');
      setOutput('');
      return;
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'application/xml');
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML 格式无效');
      }
      // 直接序列化后压缩：去除标签间空白
      const serializer = new XMLSerializer();
      const raw = serializer.serializeToString(doc.documentElement);
      setOutput(raw.replace(/>\s+</g, '><').trim());
      setError('');
    } catch (e) {
      setError(`解析失败：${e.message}`);
      setOutput('');
    }
  }, [input]);

  /** 格式化 XML：递归序列化，带缩进美化 */
  const formatXml = useCallback(() => {
    if (!input.trim()) {
      setError('请输入 XML 内容');
      setOutput('');
      return;
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'application/xml');
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML 格式无效');
      }
      const pad = ' '.repeat(indent);
      // 处理根节点的所有子节点（含声明、注释、根元素）
      const parts = Array.from(doc.childNodes)
        .map((node) => {
          // XML 声明：直接保留
          if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
            return `<?xml ${node.data}?>`;
          }
          // 注释
          if (node.nodeType === Node.COMMENT_NODE) {
            return `<!--${node.textContent}-->`;
          }
          // 元素：递归序列化，从第 0 层开始
          if (node.nodeType === Node.ELEMENT_NODE) {
            return serializeNode(node, 0, pad);
          }
          return '';
        })
        .filter((s) => s !== '');
      setOutput(parts.join('\n'));
      setError('');
    } catch (e) {
      setError(`解析失败：${e.message}`);
      setOutput('');
    }
  }, [input, indent]);

  /** 复制结果到剪贴板 */
  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('剪贴板访问失败');
    }
  }, [output]);

  /** 清空输入输出 */
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError('');
  }, []);

  // 输入或缩进变化时自动格式化，默认示例立即可见结果
  useEffect(() => {
    formatXml();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, indent]);

  return (
    <div className="space-y-4">
      {/* 工具头部 */}
      <ToolHeader
        title="XML 格式化"
        description="美化、压缩、校验 XML 文档，支持 2/4 空格缩进切换"
      />

      {/* 操作工具栏 */}
      <div className="industrial-card flex flex-wrap items-center gap-3 p-4">
        <button type="button" onClick={formatXml} className="btn-industrial-primary">
          <Maximize2 size={16} /> 格式化
        </button>
        <button type="button" onClick={minifyXml} className="btn-industrial-secondary">
          <Minimize2 size={16} /> 压缩
        </button>
        <div className="flex items-center gap-2">
          <span className="tech-label">缩进</span>
          <div className="flex rounded-md bg-muted p-1 shadow-recessed">
            {[2, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setIndent(n)}
                className={[
                  'rounded px-3 py-1 font-mono text-xs font-bold transition-all duration-150',
                  indent === n
                    ? 'bg-chassis text-accent shadow-card'
                    : 'text-ink-muted hover:text-ink'
                ].join(' ')}
              >
                {n} 空格
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output}
            className="btn-industrial-secondary"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? '已复制' : '复制'}
          </button>
          <button type="button" onClick={handleClear} className="btn-industrial-ghost">
            <Trash2 size={16} /> 清空
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-accent/10 px-4 py-3 font-mono text-sm text-accent shadow-recessed">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 输入输出双栏 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="industrial-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label flex items-center gap-1">
              <Code2 size={12} /> 输入 // SOURCE
            </span>
            <span className="font-mono text-xxs text-ink-muted/60">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'<root>\n  <item id="1">值</item>\n</root>'}
            className="industrial-textarea industrial-scroll h-80 font-mono"
            spellCheck={false}
          />
        </div>
        <div className="industrial-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">输出 // RESULT</span>
            <span className="font-mono text-xxs text-ink-muted/60">{output.length} chars</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="格式化结果将在此显示..."
            className="industrial-textarea industrial-scroll h-80 bg-muted/40 font-mono"
            spellCheck={false}
          />
        </div>
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
