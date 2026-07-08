import React, { Suspense, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Breadcrumb from './components/Breadcrumb.jsx';
import ToolLoader from './components/ToolLoader.jsx';
import HomePage from './pages/HomePage.jsx';

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
        <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb />
          <div className="mt-4">
            <Suspense fallback={<ToolLoader.Loading />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                {/* 工具路由：/tool/:toolId，ToolLoader 负责懒加载 */}
                <Route path="/tool/:toolId" element={<ToolLoader />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
