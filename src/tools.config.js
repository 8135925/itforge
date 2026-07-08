/**
 * tools.config.js - 菜单配置（唯一数据源）
 *
 * 扩展新工具的步骤：
 * 1. 在 src/tools/ 下创建 PascalCase 命名的组件文件（如 NewTool.jsx）
 * 2. 在下方 TOOLS 数组的对应 group.items 中添加一项：
 *    { id: "new-tool", name: "新工具名称", desc: "工具描述", icon: "🔧" }
 *    - id 必须为 kebab-case，且能通过 PascalCase(id) 映射到组件文件名
 *    - 例如 id="new-tool" → 文件 NewTool.jsx
 * 3. ToolLoader 会通过 React.lazy(() => import(`./tools/${PascalCase(id)}.jsx`)) 自动加载
 * 4. 无需修改其他文件即可生效
 */

export const TOOLS = [
  {
    group: '加密 / 安全',
    icon: '🔒',
    items: [
      {
        id: 'token-generator',
        name: 'Token 生成器',
        desc: '生成随机安全令牌，支持自定义长度与字符集',
        icon: '🔑'
      },
      {
        id: 'hash-text',
        name: 'Hash 文本',
        desc: 'MD5、SHA1/256/512、SHA3、RIPEMD160 多算法哈希计算',
        icon: '#️⃣'
      }
    ]
  },
  {
    group: '转换器',
    icon: '🔄',
    items: [
      {
        id: 'base64-codec',
        name: 'Base64 编码/解码',
        desc: 'Base64 编码与解码，支持 UTF-8 安全转换',
        icon: '🔢'
      },
      {
        id: 'date-converter',
        name: '日期时间转换器',
        desc: 'Unix 时间戳与 ISO 8601 互转，支持本地/UTC 时区',
        icon: '📅'
      },
      {
        id: 'case-converter',
        name: '大小写转换',
        desc: 'camelCase / snake_case / kebab-case 等多种命名风格互转',
        icon: '🔤'
      }
    ]
  },
  {
    group: '编解码 / 格式化',
    icon: '📋',
    items: [
      {
        id: 'csv-to-json',
        name: 'CSV to JSON',
        desc: 'CSV 数据解析为 JSON 数组，支持自定义分隔符',
        icon: '📊'
      },
      {
        id: 'json-formatter',
        name: 'JSON 格式化',
        desc: 'JSON 美化、压缩、校验，支持 2/4 空格缩进',
        icon: '✨'
      },
      {
        id: 'yaml-to-json',
        name: 'YAML 到 JSON',
        desc: 'YAML 与 JSON 互转，适用于配置文件处理',
        icon: '📄'
      },
      {
        id: 'jwt-parser',
        name: 'JWT 解析器',
        desc: '解码 JWT 的 Header 与 Payload，无需签名验证',
        icon: '🎟️'
      },
      {
        id: 'xml-to-json',
        name: 'XML 到 JSON',
        desc: 'XML 文档转换为 JSON 结构，支持属性与命名空间',
        icon: '🏷️'
      }
    ]
  },
  {
    group: 'Web',
    icon: '🌐',
    items: [
      {
        id: 'http-status-codes',
        name: 'HTTP 状态码',
        desc: '查询 HTTP / WebDav 状态码含义，支持模糊搜索',
        icon: '📡'
      },
      {
        id: 'json-diff',
        name: 'JSON 差异比较',
        desc: '并排比对两个 JSON，高亮新增/删除/修改的字段',
        icon: '🔍'
      }
    ]
  }
];

/**
 * 工具 ID 转 PascalCase 文件名
 * @param {string} id - kebab-case 工具 ID（如 "token-generator"）
 * @returns {string} PascalCase 组件名（如 "TokenGenerator"）
 */
export function idToPascalCase(id) {
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * 根据 id 查找工具配置
 * @param {string} id
 * @returns {{id:string,name:string,desc?:string,icon?:string}|undefined}
 */
export function findToolById(id) {
  for (const group of TOOLS) {
    const found = group.items.find((item) => item.id === id);
    if (found) return found;
  }
  return undefined;
}
