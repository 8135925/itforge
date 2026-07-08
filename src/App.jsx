import React, { Suspense, useState, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Breadcrumb from './components/Breadcrumb.jsx';
import ToolLoader from './components/ToolLoader.jsx';
import HomePage from './pages/HomePage.jsx';

// 文本对比工具需要全屏布局，单独懒加载，跳出 max-w-content 框架限制
const TextDiff = lazy(() => import('./tools/TextDiff.jsx'));

/**
 * App - 应用布局框架
 * 结构：左侧可折叠 Sidebar + 右侧内容区（面包屑 + 工具内容）
 * 视觉规范遵循 Industrial.md
 */
export default function App() {
  // 折叠状态提升至 App 层，以便同步调整主内容区边距
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar collapsed={collapsed} onToggleCollapse={setCollapsed} />
      {/* 主内容区：边距随侧边栏折叠状态同步变化 */}
      <main
        className={[
          'flex-1 min-w-0 transition-all duration-300 ease-spring',
          collapsed ? 'md:ml-[72px]' : 'md:ml-60'
        ].join(' ')}
      >
        <Suspense fallback={<ToolLoader.Loading />}>
          <Routes>
            <Route path="/" element={
              <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 lg:px-8">
                <Breadcrumb />
                <div className="mt-4">
                  <HomePage />
                </div>
              </div>
            } />
            {/*
              文本对比：跳出 max-w-content 容器，直接占满 main 区域，
              Monaco DiffEditor 需要最大化可视面积
            */}
            <Route path="/tool/text-diff" element={<TextDiff />} />
            {/* 工具路由：/tool/:toolId，ToolLoader 负责懒加载 */}
            <Route path="/tool/:toolId" element={
              <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 lg:px-8">
                <Breadcrumb />
                <div className="mt-4">
                  <ToolLoader />
                </div>
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
