import React, { useState, useRef, useEffect } from 'react';
import { DiffEditor, loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { GitCompare, Plus, Minus, Code2, Eraser, Copy, Check } from 'lucide-react';

/**
 * TextDiff - 文本对比工具
 * 基于 Monaco Editor 的 DiffEditor（与 VS Code 同款），1:1 复刻 it-tools 的 text-diff
 * 左右并排显示原始文本与修改后文本，支持行内差异高亮、语法高亮、可编辑左侧文本
 */

// ========== Monaco 配置：使用本地 monaco-editor，不依赖 CDN ==========

// 配置 web worker，避免 monaco 在 Vite 环境下无法创建 worker 的警告
self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

// 注册本地 monaco 实例，@monaco-editor/react 将使用本地包而非 CDN
loader.config({ monaco });

// 定义透明背景的暗色主题（融入项目工业风背景）
monaco.editor.defineTheme('itforge-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
    'diffEditor.insertedTextBackground': '#22c55e33',
    'diffEditor.removedTextBackground': '#ef444433',
    'diffEditorGutter.insertedLineBackground': '#22c55e22',
    'diffEditorGutter.removedLineBackground': '#ef444422',
  },
});

// ========== 默认示例 ==========

const DEFAULT_LEFT = `const greeting = 'Hello';
const name = 'World';
console.log(greeting, name);`;

const DEFAULT_RIGHT = `const greeting = 'Hi';
const name = 'ITForge';
console.log(greeting, name);
console.log('Done');`;

// 支持的语言列表
const LANGUAGES = [
  { id: 'plaintext', label: '纯文本' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'json', label: 'JSON' },
  { id: 'xml', label: 'XML' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'sql', label: 'SQL' },
  { id: 'markdown', label: 'Markdown' },
];

// ========== 主组件 ==========

export default function TextDiff() {
  const [leftText, setLeftText] = useState(DEFAULT_LEFT);
  const [rightText, setRightText] = useState(DEFAULT_RIGHT);
  const [language, setLanguage] = useState('plaintext');
  const [stats, setStats] = useState({ added: 0, removed: 0 });
  const [copied, setCopied] = useState(false);

  const editorRef = useRef(null);
  const isInternalChange = useRef(false);

  /**
   * 编辑器挂载回调
   * 注册 diff 更新事件以统计新增/删除行数
   * 注册 original editor 的内容变更事件以同步 state（modified 由 onChange 同步）
   */
  const handleMount = (editor) => {
    editorRef.current = editor;

    // diff 计算完成后统计行数
    editor.onDidUpdateDiff(() => {
      const changes = editor.getLineChanges() || [];
      let added = 0;
      let removed = 0;
      for (const change of changes) {
        if (change.originalEndLineNumber === 0) {
          // 纯新增行
          added += change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1;
        } else if (change.modifiedEndLineNumber === 0) {
          // 纯删除行
          removed += change.originalEndLineNumber - change.originalStartLineNumber + 1;
        } else {
          // 修改行：两侧都计数
          added += change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1;
          removed += change.originalEndLineNumber - change.originalStartLineNumber + 1;
        }
      }
      setStats({ added, removed });
    });

    // 监听左侧（original）编辑器内容变化，同步 state
    const originalEditor = editor.getOriginalEditor();
    originalEditor.onDidChangeModelContent(() => {
      if (isInternalChange.current) return;
      const value = originalEditor.getValue();
      if (value !== leftText) {
        setLeftText(value);
      }
    });
  };

  /**
   * 右侧（modified）内容变化回调
   * @monaco-editor/react 的 onChange 仅在 modified 变化时触发
   */
  const handleChange = (value) => {
    if (isInternalChange.current) return;
    if (value !== undefined && value !== rightText) {
      setRightText(value);
    }
  };

  /** 清空两侧文本 */
  const handleClear = () => {
    isInternalChange.current = true;
    setLeftText('');
    setRightText('');
    setStats({ added: 0, removed: 0 });
    setTimeout(() => {
      isInternalChange.current = false;
    }, 0);
  };

  /** 复制右侧（修改后）文本 */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rightText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用时静默忽略
    }
  };

  // 组件卸载时清理 editor 实例
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex h-screen flex-col bg-surface-dark">
      {/* 紧凑标题栏：单行，含标题、统计、语言选择、操作按钮 */}
      <div className="flex shrink-0 items-center justify-between border-b border-muted/20 px-4 py-2">
        <div className="flex items-center gap-2">
          <GitCompare size={16} className="text-accent" />
          <h1 className="text-sm font-bold text-ink text-emboss-dark">文本对比</h1>
          <span className="font-mono text-xxs text-ink-muted/50">// MONACO DIFF</span>
        </div>

        <div className="flex items-center gap-3">
          {/* 统计信息 */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="flex items-center gap-1 text-led-green">
              <Plus size={12} /> {stats.added}
            </span>
            <span className="flex items-center gap-1 text-accent">
              <Minus size={12} /> {stats.removed}
            </span>
          </div>

          {/* 语言选择 */}
          <div className="flex items-center gap-1">
            <Code2 size={12} className="text-ink-muted/60" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded border border-muted/30 bg-surface-dark px-2 py-0.5 font-mono text-xxs text-ink focus:border-accent focus:outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* 操作按钮 */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!rightText}
            className="btn-industrial-ghost px-2 py-1 text-xs"
            title="复制修改后文本"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="btn-industrial-ghost px-2 py-1 text-xs"
            title="清空两侧文本"
          >
            <Eraser size={12} />
          </button>
        </div>
      </div>

      {/* Monaco DiffEditor：撑满剩余空间，最大化可视面积 */}
      <div className="min-h-0 flex-1">
        <DiffEditor
          original={leftText}
          modified={rightText}
          language={language}
          theme="itforge-dark"
          onMount={handleMount}
          onChange={handleChange}
          options={{
            originalEditable: true,
            minimap: { enabled: false },
            renderSideBySide: true,
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineHeight: 20,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            scrollBounce: true,
            padding: { top: 8, bottom: 8 },
            automaticLayout: true,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
              useShadows: false,
            },
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 8,
            lineNumbersMinChars: 3,
            contextmenu: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            renderLineHighlight: 'line',
            roundedSelection: true,
          }}
        />
      </div>
    </div>
  );
}
