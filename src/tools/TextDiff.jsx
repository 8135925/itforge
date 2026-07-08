import React, { useState, useMemo } from 'react';
import { GitCompare, FileText, Minus, Plus, Equal } from 'lucide-react';

/**
 * TextDiff - 文本对比工具
 * 基于 LCS 算法逐行对比两段文本，左右并排高亮新增/删除/修改
 * 对配对的"删除+新增"行额外做字符级 inline diff，精确定位变化字符
 * 移植自 it-tools 的 text-diff，改为零依赖的纯 React 实现
 */

// 默认示例：展示修改行、新增行、相同行三种情况
const DEFAULT_LEFT = `const greeting = 'Hello';
const name = 'World';
console.log(greeting, name);`;

const DEFAULT_RIGHT = `const greeting = 'Hi';
const name = 'ITForge';
console.log(greeting, name);
console.log('Done');`;

// ========== diff 算法（零依赖 LCS 实现） ==========

/**
 * 行级 LCS diff
 * @param {string[]} a - 左侧行数组
 * @param {string[]} b - 右侧行数组
 * @returns {{type:'equal'|'removed'|'added', text:string}[]}
 */
function diffLines(a, b) {
  const m = a.length;
  const n = b.length;
  // DP 表：dp[i][j] 表示 a[i:] 与 b[j:] 的 LCS 长度
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  // 回溯生成 diff 序列
  const result = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      result.push({ type: 'equal', text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: 'removed', text: a[i] });
      i++;
    } else {
      result.push({ type: 'added', text: b[j] });
      j++;
    }
  }
  while (i < m) {
    result.push({ type: 'removed', text: a[i] });
    i++;
  }
  while (j < n) {
    result.push({ type: 'added', text: b[j] });
    j++;
  }
  return result;
}

/**
 * 字符级 LCS diff（用于配对行的 inline 高亮）
 * @param {string} a
 * @param {string} b
 * @returns {{type:'equal'|'removed'|'added', text:string}[]}
 */
function diffChars(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      result.push({ type: 'equal', text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: 'removed', text: a[i] });
      i++;
    } else {
      result.push({ type: 'added', text: b[j] });
      j++;
    }
  }
  while (i < m) {
    result.push({ type: 'removed', text: a[i] });
    i++;
  }
  while (j < n) {
    result.push({ type: 'added', text: b[j] });
    j++;
  }
  return result;
}

/** 合并连续同类型字符段，减少渲染节点 */
function mergeSegments(segments) {
  const merged = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (last && last.type === seg.type) {
      last.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

/**
 * 将 diff 序列转换为左右对齐的行对
 * 连续的 removed 与后续 added 配对，便于字符级 inline diff
 * @returns {{left:{type,text}|null, right:{type,text}|null}[]}
 */
function toRowPairs(diff) {
  const rows = [];
  let i = 0;
  while (i < diff.length) {
    const item = diff[i];
    if (item.type === 'equal') {
      rows.push({ left: item, right: item });
      i++;
    } else if (item.type === 'removed') {
      // 收集连续 removed
      const removed = [];
      while (i < diff.length && diff[i].type === 'removed') {
        removed.push(diff[i]);
        i++;
      }
      // 收集紧随的连续 added
      const added = [];
      while (i < diff.length && diff[i].type === 'added') {
        added.push(diff[i]);
        i++;
      }
      // 配对：按位置对齐，多出的单独成行
      const max = Math.max(removed.length, added.length);
      for (let k = 0; k < max; k++) {
        rows.push({ left: removed[k] || null, right: added[k] || null });
      }
    } else if (item.type === 'added') {
      // 无前置 removed 的纯新增
      while (i < diff.length && diff[i].type === 'added') {
        rows.push({ left: null, right: diff[i] });
        i++;
      }
    } else {
      i++;
    }
  }
  return rows;
}

// ========== 渲染组件 ==========

/** 渲染字符级 diff 段：旧文本侧重 removed 高亮，新文本侧重 added 高亮 */
function CharDiffSegments({ segments, side }) {
  // side='left' 显示旧文本（removed 红字+保留 equal 灰字）
  // side='right' 显示新文本（added 绿字+保留 equal 灰字）
  return (
    <>
      {segments.map((seg, idx) => {
        if (seg.type === 'equal') {
          return (
            <span key={idx} className="text-ink-muted">
              {seg.text}
            </span>
          );
        }
        if (side === 'left' && seg.type === 'removed') {
          return (
            <span key={idx} className="rounded bg-accent/20 text-accent">
              {seg.text}
            </span>
          );
        }
        if (side === 'right' && seg.type === 'added') {
          return (
            <span key={idx} className="rounded bg-led-green/20 text-led-green">
              {seg.text}
            </span>
          );
        }
        // 另一侧的段不显示（left 侧不显示 added，right 侧不显示 removed）
        return null;
      })}
    </>
  );
}

/** 渲染单条差异行：removed(红) / added(绿) / modified(配对标红) */
function DiffEntry({ pair, lineNo }) {
  // 修改行：左右都有，做字符级 diff，旧值标红 + 新值标绿
  if (pair.left && pair.right) {
    const segs = mergeSegments(diffChars(pair.left.text, pair.right.text));
    return (
      <div className="space-y-0.5">
        <div className="flex items-start gap-1.5 rounded-sm bg-accent/10 px-1.5 py-0.5">
          <Minus size={12} className="mt-0.5 shrink-0 text-accent" />
          <span className="whitespace-pre-wrap break-all font-mono text-xs">
            <CharDiffSegments segments={segs} side="left" />
          </span>
        </div>
        <div className="flex items-start gap-1.5 rounded-sm bg-led-green/10 px-1.5 py-0.5">
          <Plus size={12} className="mt-0.5 shrink-0 text-led-green" />
          <span className="whitespace-pre-wrap break-all font-mono text-xs">
            <CharDiffSegments segments={segs} side="right" />
          </span>
        </div>
      </div>
    );
  }
  // 纯删除行：标红
  if (pair.left) {
    return (
      <div className="flex items-start gap-1.5 rounded-sm bg-accent/15 px-1.5 py-0.5">
        <Minus size={12} className="mt-0.5 shrink-0 text-accent" />
        <span className="whitespace-pre-wrap break-all font-mono text-xs text-accent">
          {pair.left.text || '\u00A0'}
        </span>
      </div>
    );
  }
  // 纯新增行：标绿
  return (
    <div className="flex items-start gap-1.5 rounded-sm bg-led-green/15 px-1.5 py-0.5">
      <Plus size={12} className="mt-0.5 shrink-0 text-led-green" />
      <span className="whitespace-pre-wrap break-all font-mono text-xs text-led-green">
        {pair.right.text || '\u00A0'}
      </span>
    </div>
  );
}

// ========== 主组件 ==========

export default function TextDiff() {
  const [leftText, setLeftText] = useState(DEFAULT_LEFT);
  const [rightText, setRightText] = useState(DEFAULT_RIGHT);

  /** 计算行级 diff + 行对 + 行号 + 仅含差异的行对 */
  const { diffPairs, stats } = useMemo(() => {
    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');
    const diff = diffLines(leftLines, rightLines);
    const rowPairs = toRowPairs(diff);
    // 只保留有差异的行对（equal 行跳过）
    const onlyDiffs = rowPairs.filter(
      (p) => (p.left && p.left.type !== 'equal') || (p.right && p.right.type !== 'equal')
    );
    let added = 0;
    let removed = 0;
    let equal = 0;
    for (const d of diff) {
      if (d.type === 'added') added++;
      else if (d.type === 'removed') removed++;
      else equal++;
    }
    return { diffPairs: onlyDiffs, stats: { added, removed, equal } };
  }, [leftText, rightText]);

  return (
    <div className="flex h-[calc(100vh-130px)] min-h-[480px] flex-col gap-2">
      {/* 紧凑标题栏：单行，节省垂直空间 */}
      <div className="industrial-card flex shrink-0 items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="led-on" aria-hidden="true" />
          <h1 className="text-lg font-bold text-ink text-emboss">文本对比</h1>
        </div>
        <div className="flex items-center gap-3 font-mono text-xxs">
          <span className="flex items-center gap-1 text-led-green">
            <Plus size={12} /> +{stats.added}
          </span>
          <span className="flex items-center gap-1 text-accent">
            <Minus size={12} /> -{stats.removed}
          </span>
          <span className="flex items-center gap-1 text-ink-muted/60">
            <Equal size={12} /> {stats.equal}
          </span>
        </div>
      </div>

      {/* 主区域：三列并排，最大化可视面积 */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_1fr]">
        {/* 文本 A */}
        <div className="industrial-card flex min-h-0 flex-col overflow-hidden p-0">
          <div className="flex shrink-0 items-center justify-between border-b border-muted/30 px-3 py-1.5">
            <span className="tech-label flex items-center gap-1">
              <FileText size={12} /> 文本 A // LEFT
            </span>
            <span className="font-mono text-xxs text-ink-muted/50">{leftText.split('\n').length} 行</span>
          </div>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="粘贴原始文本..."
            className="industrial-textarea industrial-scroll h-full flex-1 resize-none rounded-none border-0 font-mono text-xs"
          />
        </div>

        {/* 文本 B */}
        <div className="industrial-card flex min-h-0 flex-col overflow-hidden p-0">
          <div className="flex shrink-0 items-center justify-between border-b border-muted/30 px-3 py-1.5">
            <span className="tech-label flex items-center gap-1">
              <FileText size={12} /> 文本 B // RIGHT
            </span>
            <span className="font-mono text-xxs text-ink-muted/50">{rightText.split('\n').length} 行</span>
          </div>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="粘贴修改后的文本..."
            className="industrial-textarea industrial-scroll h-full flex-1 resize-none rounded-none border-0 font-mono text-xs"
          />
        </div>

        {/* 差异列：最右侧，仅显示差异行，标红，可滚动 */}
        <div className="industrial-card flex min-h-0 flex-col overflow-hidden p-0">
          <div className="flex shrink-0 items-center gap-2 border-b border-muted/30 px-3 py-1.5">
            <GitCompare size={12} className="text-accent" />
            <span className="tech-label">差异 // DIFF</span>
            <span className="ml-auto font-mono text-xxs text-ink-muted/50">{diffPairs.length} 处</span>
          </div>
          <div className="industrial-scroll flex-1 space-y-1 overflow-auto p-2">
            {diffPairs.length === 0 ? (
              <div className="py-8 text-center font-mono text-xs text-ink-muted">
                两个文本完全相同
              </div>
            ) : (
              diffPairs.map((pair, idx) => <DiffEntry key={idx} pair={pair} lineNo={idx + 1} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
