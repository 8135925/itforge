import React, { Suspense, lazy, Component } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { findToolById, idToPascalCase, TOOLS } from '../tools.config.js';

/**
 * ToolLoader - 懒加载容器 + 错误边界
 * 根据 URL 中的 toolId 动态加载 src/tools/${PascalCase(id)}.jsx
 */
export default function ToolLoader() {
  const { toolId } = useParams();
  const tool = findToolById(toolId);

  // 工具未找到：显示错误并提供返回首页
  if (!tool) {
    return (
      <ErrorState
        title="工具不存在"
        message={`未找到 ID 为 "${toolId}" 的工具。`}
      />
    );
  }

  // 动态构建懒加载组件
  const PascalName = idToPascalCase(tool.id);
  // 通过映射表显式加载，避免 Vite 动态 import 警告
  const ToolComponent = lazy(() => import(`../tools/${PascalName}.jsx`));

  return (
    <ErrorBoundary toolName={tool.name}>
      <Suspense fallback={<Loading />}>
        <ToolComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * 加载占位：工业风格骨架屏
 */
function Loading() {
  return (
    <div className="industrial-card p-6 animate-pulse" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}
ToolLoader.Loading = Loading;

/**
 * 错误边界：捕获工具组件渲染异常
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 使用日志门面（这里通过 console 模拟，生产可接入 Sentry）
    console.error('[ToolLoader] 工具渲染失败:', this.props.toolName, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title={`${this.props.toolName} 加载失败`}
          message={this.state.error?.message || '未知错误'}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

/**
 * 错误状态展示卡片
 */
function ErrorState({ title, message, onReset }) {
  return (
    <div className="industrial-card mx-auto max-w-tool p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 shadow-floating">
        <AlertTriangle size={28} className="text-accent" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-ink">{title}</h2>
      <p className="mt-2 font-mono text-sm text-ink-muted">{message}</p>
      <div className="mt-6 flex justify-center gap-3">
        {onReset ? (
          <button type="button" onClick={onReset} className="btn-industrial-primary">
            <RotateCcw size={16} /> 重试
          </button>
        ) : (
          <Link to="/" className="btn-industrial-primary">
            返回首页
          </Link>
        )}
      </div>
    </div>
  );
}
