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
      // 使用 CSS 变量 + RGB 通道格式，支持透明度修饰符（如 bg-muted/30）和深色模式切换
      colors: {
        // Level 0：底盘底色（哑光 ABS 塑料）
        chassis: 'rgb(var(--chassis) / <alpha-value>)',
        // Level +1：抬升面板表面
        panel: 'rgb(var(--panel) / <alpha-value>)',
        // Level -1：凹陷区域（输入框、屏幕边框）
        muted: 'rgb(var(--muted) / <alpha-value>)',
        // 主文本（深炭墨）
        ink: 'rgb(var(--ink) / <alpha-value>)',
        // 次文本/标签（深石板灰，WCAG AA 合规）
        'ink-muted': 'rgb(var(--ink-muted) / <alpha-value>)',
        // 安全橙强调色（Braun Red）- 仅用于交互/状态/警示
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-foreground': 'rgb(var(--accent-foreground) / <alpha-value>)',
        // 拟物阴影对：暗半部与亮半部
        'shadow-dark': 'rgb(var(--shadow-dark-color) / <alpha-value>)',
        'shadow-light': 'rgb(var(--shadow-light-color) / <alpha-value>)',
        // 深阴影边框
        'border-deep': 'rgb(var(--border-deep) / <alpha-value>)',
        // LED 状态色
        'led-green': 'rgb(var(--led-green) / <alpha-value>)',
        'led-amber': 'rgb(var(--led-amber) / <alpha-value>)',
        'led-red': 'rgb(var(--led-red) / <alpha-value>)',
        // 深色纯色表面：用于代码块、结果框、终端显示区
        // 严格禁止在此类元素上使用 background-image、网格、噪点、扫描线等图案
        'surface-dark': 'rgb(var(--surface-dark) / <alpha-value>)',
        // 深色表面上的主文本色（柔和白）
        'surface-text': 'rgb(var(--surface-text) / <alpha-value>)',
        // 深色表面上的次要文本色
        'surface-muted': 'rgb(var(--surface-muted) / <alpha-value>)'
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
      // 使用 CSS 变量，支持深色模式自动切换阴影色值
      boxShadow: {
        // 基础抬升：卡片、面板
        card: 'var(--shadow-card)',
        // 高抬升：交互元素、悬浮卡片
        floating: 'var(--shadow-floating)',
        // 按压态：阴影方向反转，元素被推入表面
        pressed: 'var(--shadow-pressed)',
        // 凹陷态：输入框、屏幕、凹槽
        recessed: 'var(--shadow-recessed)',
        // 机械硬边缘：金属标签、边框
        sharp: 'var(--shadow-sharp)',
        // LED 发光：状态指示、聚焦
        glow: 'var(--shadow-glow)',
        'glow-green': 'var(--shadow-glow-green)',
        // 强调色按钮拟物阴影（红色染色）
        'accent-lift': 'var(--shadow-accent-lift)'
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
