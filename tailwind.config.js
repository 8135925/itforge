/**
 * Tailwind 配置 - 完整映射 Industrial.md Design Token System
 * 所有颜色、阴影、圆角、字体、缓动曲线均来源于 Industrial.md，禁止在此文件外硬编码
 */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      // ============ 颜色（工业拟物色板）============
      // 命名遵循 Industrial.md：物理材质语义化
      colors: {
        // Level 0：底盘底色（哑光 ABS 塑料）
        chassis: '#e0e5ec',
        // Level +1：抬升面板表面
        panel: '#f0f2f5',
        // Level -1：凹陷区域（输入框、屏幕边框）
        muted: '#d1d9e6',
        // 主文本（深炭墨）
        ink: '#2d3436',
        // 次文本/标签（深石板灰，WCAG AA 合规）
        'ink-muted': '#4a5568',
        // 安全橙强调色（Braun Red）- 仅用于交互/状态/警示
        accent: '#ff4757',
        'accent-foreground': '#ffffff',
        // 拟物阴影对：暗半部与亮半部
        'shadow-dark': '#babecc',
        'shadow-light': '#ffffff',
        // 深阴影边框
        'border-deep': '#a3b1c6',
        // LED 状态色
        'led-green': '#22c55e',
        'led-amber': '#f59e0b',
        'led-red': '#ff4757'
      },
      // ============ 字体配对 ============
      fontFamily: {
        // 主字体：Inter（标题、正文、UI 标签）
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        // 技术字体：JetBrains Mono（数字、代码、技术标签）
        mono: ['JetBrains Mono', 'Roboto Mono', 'ui-monospace', 'monospace']
      },
      // ============ 圆角比例（注塑塑料有机曲线）============
      borderRadius: {
        sm: '4px',    // 紧凑机械边缘（小按钮、徽章）
        md: '8px',    // 标准控件（输入框、小卡片）
        lg: '16px',   // 大型面板（卡片、模态框）
        xl: '24px',   // 主组件（设备边框、主要区块）
        '2xl': '30px' // 超大容器
      },
      // ============ 拟物阴影系统（核心视觉签名）============
      // 双阴影通过光线模拟立体感：暗影在右下，高光在左上
      boxShadow: {
        // 基础抬升：卡片、面板
        card: '8px 8px 16px #babecc, -8px -8px 16px #ffffff',
        // 高抬升：交互元素、悬浮卡片
        floating: '12px 12px 24px #babecc, -12px -12px 24px #ffffff, inset 1px 1px 0 rgba(255,255,255,0.5)',
        // 按压态：阴影方向反转，元素被推入表面
        pressed: 'inset 6px 6px 12px #babecc, inset -6px -6px 12px #ffffff',
        // 凹陷态：输入框、屏幕、凹槽
        recessed: 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff',
        // 机械硬边缘：金属标签、边框
        sharp: '4px 4px 8px rgba(0,0,0,0.15), -1px -1px 1px rgba(255,255,255,0.8)',
        // LED 发光：状态指示、聚焦
        glow: '0 0 10px 2px rgba(255, 71, 87, 0.6)',
        'glow-green': '0 0 10px 2px rgba(34, 197, 94, 0.6)',
        // 强调色按钮拟物阴影（红色染色）
        'accent-lift': '4px 4px 8px rgba(166,50,60,0.4), -4px -4px 8px rgba(255,100,110,0.4)'
      },
      // ============ 缓动曲线（机械弹簧物理）============
      transitionTimingFunction: {
        // Industrial.md 主缓动：轻微过冲/反弹
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'mechanical': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms'
      },
      // ============ 字号扩展（标签/元数据）============
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '1rem' }]
      },
      // ============ 字间距（冲压/印刷标签感）============
      letterSpacing: {
        'stamped': '0.05em',
        'wide-stamp': '0.08em'
      },
      // ============ 动画 ============
      animation: {
        'led-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 4s linear infinite',
        'scanline': 'scanline 8s linear infinite'
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      },
      // ============ 最大宽度 ============
      maxWidth: {
        'content': '72rem',  // 1152px 主内容容器
        'tool': '48rem'      // 768px 工具内容区
      }
    }
  },
  plugins: []
};
