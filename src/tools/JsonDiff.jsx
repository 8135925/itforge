import React, { useState, useMemo, useCallback } from 'react';
import { Copy, Check, GitCompare, AlertCircle, Filter } from 'lucide-react';

/**
 * JsonDiff - JSON 差异比较
 * 并排比对两个 JSON，递归高亮新增/删除/修改字段
 * 移植自 it-tools 的 json-diff，diff 算法与渲染均改为原生 React 实现
 */

// 默认示例：两个结构相同、值不同的 JSON，便于立即查看差异效果
const DEFAULT_LEFT = `{
  "name": "张三",
  "age": 28,
  "isStudent": false,
  "skills": ["JavaScript", "Python", "SQL"],
  "address": {
    "city": "北京",
    "district": "海淀区"
  }
}`;

const DEFAULT_RIGHT = `{
  "name": "李四",
  "age": 35,
  "isStudent": true,
  "skills": ["Go", "Rust", "Docker"],
  "address": {
    "city": "上海",
    "district": "浦东新区"
  }
}`;

// ========== diff 算法（移植自 it-tools json-diff.models.ts，lodash 替换为原生 deepEqual） ==========

/**
 * 深度相等判断（替代 lodash.isEqual）
 * 支持 null/undefined/数组/对象/原始值
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === 'object') {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

/** 取值类型：object / array / value */
function getType(value) {
  if (value === null || value === undefined) return 'value';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return 'value';
}

/** 计算差异状态 */
function getStatus(value, newValue) {
  if (value === undefined) return 'added';
  if (newValue === undefined) return 'removed';
  if (deepEqual(value, newValue)) return 'unchanged';
  if (getType(value) === getType(newValue) && (getType(value) === 'object' || getType(value) === 'array')) {
    return 'children-updated';
  }
  return 'updated';
}

/** 递归计算两个值的差异树 */
function diff(obj, newObj, { onlyShowDifferences = false } = {}) {
  if (getType(obj) === 'array' && getType(newObj) === 'array') {
    return { key: '', type: 'array', children: diffArrays(obj, newObj, { onlyShowDifferences }), oldValue: obj, value: newObj, status: getStatus(obj, newObj) };
  }
  if (getType(obj) === 'object' && getType(newObj) === 'object') {
    return { key: '', type: 'object', children: diffObjects(obj, newObj, { onlyShowDifferences }), oldValue: obj, value: newObj, status: getStatus(obj, newObj) };
  }
  return { key: '', type: 'value', oldValue: obj, value: newObj, status: getStatus(obj, newObj) };
}

/** 对象差异：合并两侧键，逐键递归 */
function diffObjects(obj, newObj, opts) {
  const keys = Object.keys({ ...obj, ...newObj });
  return keys
    .map((key) => createDifference(obj?.[key], newObj?.[key], key, opts))
    .filter((d) => !opts.onlyShowDifferences || d.status !== 'unchanged');
}

/** 数组差异：按索引逐项递归 */
function diffArrays(arr, newArr, opts) {
  const max = Math.max(0, arr?.length ?? 0, newArr?.length ?? 0);
  return Array.from({ length: max }, (_, i) => createDifference(arr?.[i], newArr?.[i], i, opts)).filter(
    (d) => !opts.onlyShowDifferences || d.status !== 'unchanged'
  );
}

/** 构造单个差异节点 */
function createDifference(value, newValue, key, opts) {
  const type = getType(value);
  if (type === 'object') {
    return { key, type, children: diffObjects(value ?? {}, newValue ?? {}, opts), oldValue: value, value: newValue, status: getStatus(value, newValue) };
  }
  if (type === 'array') {
    return { key, type, children: diffArrays(value ?? [], newValue ?? [], opts), oldValue: value, value: newValue, status: getStatus(value, newValue) };
  }
  return { key, type, value: newValue, oldValue: value, status: getStatus(value, newValue) };
}

// ========== 差异树渲染 ==========

/** 格式化值用于显示 */
function formatValue(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  return JSON.stringify(value);
}

/** 递归渲染差异节点 */
function DiffNode({ node, showKey, depth }) {
  const { type, status } = node;

  // 修改过的值：旧值(红) + 新值(绿) 并排
  if (status === 'updated') {
    return (
      <div className="updated-line py-0.5">
        {showKey && <span className="key">{node.key}: </span>}
        <ValueTag value={node.oldValue} status="removed" />
        <ValueTag value={node.value} status="added" />
        <span className="text-ink-muted/40">,</span>
      </div>
    );
  }

  // 数组容器
  if (type === 'array') {
    return <ContainerNode node={node} showKey={showKey} showChildrenKeys={false} openTag="[" closeTag="]" depth={depth} />;
  }

  // 对象容器
  if (type === 'object') {
    return <ContainerNode node={node} showKey={showKey} showChildrenKeys={true} openTag="{" closeTag="}" depth={depth} />;
  }

  // 叶子值
  const display = status === 'removed' ? node.oldValue : node.value;
  return (
    <div className={['py-0.5', status].join(' ')}>
      {showKey && <span className="key">{node.key}: </span>}
      <ValueTag value={display} status={status} />
      <span className="text-ink-muted/40">,</span>
    </div>
  );
}

/** 容器节点（对象/数组）：渲染开闭括号与子节点 */
function ContainerNode({ node, showKey, showChildrenKeys, openTag, closeTag, depth }) {
  const { children, status } = node;
  return (
    <div className={['block', status].join(' ')}>
      {showKey && <span className="key">{node.key}: </span>}
      <span className="text-ink-muted">{openTag}</span>
      {children.length > 0 && (
        <div style={{ paddingLeft: 20 }} className="border-l border-muted/30 ml-1">
          {children.map((child, i) => (
            <DiffNode key={i} node={child} showKey={showChildrenKeys} depth={depth + 1} />
          ))}
        </div>
      )}
      <span className="text-ink-muted">{closeTag}</span>
      <span className="text-ink-muted/40">,</span>
    </div>
  );
}

/** 值标签：根据状态着色（added 绿/removed 红） */
function ValueTag({ value, status }) {
  const cls = {
    added: 'bg-led-green/10 text-led-green',
    removed: 'bg-accent/10 text-accent',
    unchanged: 'text-ink-muted',
    'children-updated': 'text-ink',
    updated: 'text-ink'
  }[status] || 'text-ink-muted';
  return <span className={['rounded px-1 font-mono', cls].join(' ')}>{formatValue(value)}</span>;
}

// ========== 主组件 ==========

export default function JsonDiff() {
  const [rawLeft, setRawLeft] = useState(DEFAULT_LEFT);
  const [rawRight, setRawRight] = useState(DEFAULT_RIGHT);
  const [onlyShowDifferences, setOnlyShowDifferences] = useState(false);
  const [copied, setCopied] = useState('');

  /** 安全解析 JSON，失败返回 undefined */
  const safeParse = useCallback((text) => {
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }, []);

  const leftJson = useMemo(() => safeParse(rawLeft), [rawLeft, safeParse]);
  const rightJson = useMemo(() => safeParse(rawRight), [rawRight, safeParse]);

  const leftError = useMemo(() => (rawLeft.trim() && leftJson === undefined ? '无效的 JSON' : ''), [rawLeft, leftJson]);
  const rightError = useMemo(() => (rawRight.trim() && rightJson === undefined ? '无效的 JSON' : ''), [rawRight, rightJson]);

  /** 差异树：两侧都解析成功才计算 */
  const diffTree = useMemo(() => {
    if (leftJson === undefined || rightJson === undefined) return null;
    return diff(leftJson, rightJson, { onlyShowDifferences });
  }, [leftJson, rightJson, onlyShowDifferences]);

  const jsonAreSame = useMemo(() => deepEqual(leftJson, rightJson), [leftJson, rightJson]);
  const showResults = leftJson !== undefined && rightJson !== undefined;

  const handleCopy = useCallback(async (value, key) => {
    if (value === undefined || value === null) return;
    try {
      await navigator.clipboard.writeText(formatValue(value));
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      /* 静默 */
    }
  }, []);

  return (
    <div className="space-y-4">
      <ToolHeader title="JSON 差异比较" description="并排比对两个 JSON，高亮新增/删除/修改的字段" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 左侧 JSON */}
        <div className="industrial-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">JSON A // LEFT</span>
            {leftError && <span className="font-mono text-xxs text-accent">{leftError}</span>}
          </div>
          <textarea
            value={rawLeft}
            onChange={(e) => setRawLeft(e.target.value)}
            placeholder="粘贴第一个 JSON..."
            className="industrial-textarea industrial-scroll h-72 font-mono text-xs"
          />
        </div>

        {/* 右侧 JSON */}
        <div className="industrial-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tech-label">JSON B // RIGHT</span>
            {rightError && <span className="font-mono text-xxs text-accent">{rightError}</span>}
          </div>
          <textarea
            value={rawRight}
            onChange={(e) => setRawRight(e.target.value)}
            placeholder="粘贴要比较的 JSON..."
            className="industrial-textarea industrial-scroll h-72 font-mono text-xs"
          />
        </div>
      </div>

      {/* 仅显示差异开关 */}
      {showResults && (
        <div className="flex justify-center">
          <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-ink-muted">
            <Filter size={14} />
            <span>仅显示差异</span>
            <input
              type="checkbox"
              checked={onlyShowDifferences}
              onChange={(e) => setOnlyShowDifferences(e.target.checked)}
              className="accent-accent"
            />
          </label>
        </div>
      )}

      {/* 解析错误提示 */}
      {(leftError || rightError) && (
        <div className="flex items-center gap-2 rounded-md bg-accent/10 px-4 py-3 font-mono text-sm text-accent shadow-recessed">
          <AlertCircle size={16} /> <span>请先修正 JSON 语法错误</span>
        </div>
      )}

      {/* 差异结果 */}
      {showResults && (
        <div className="industrial-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <GitCompare size={14} className="text-ink-muted/60" />
            <span className="tech-label">差异结果 // DIFF</span>
          </div>
          {jsonAreSame ? (
            <div className="py-6 text-center font-mono text-sm text-ink-muted">两个 JSON 完全相同</div>
          ) : (
            <div className="industrial-scroll overflow-auto">
              <pre className="surface-display !p-3 !text-xs leading-relaxed">
                <DiffNode node={diffTree} showKey={false} depth={0} />
              </pre>
            </div>
          )}
        </div>
      )}

      {/* 图例 */}
      {showResults && !jsonAreSame && (
        <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xxs text-ink-muted">
          <span className="flex items-center gap-1">
            <span className="rounded bg-led-green/10 px-1.5 py-0.5 text-led-green">新增</span> A 中不存在
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent">删除</span> B 中不存在
          </span>
          <span className="flex items-center gap-1">
            <span className="text-ink-muted">,</span> 值已修改(左旧右新)
          </span>
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
