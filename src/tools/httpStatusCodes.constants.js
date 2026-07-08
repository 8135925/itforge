/**
 * HTTP 状态码常量（移植自 it-tools）
 * 按 1xx~5xx 分类，包含 HTTP 与 WebDav 两种类型
 * @typedef {{ code: number, name: string, description: string, type: 'HTTP'|'WebDav' }} StatusCode
 * @typedef {{ category: string, codes: StatusCode[] }} StatusCategory
 */

/** @type {StatusCategory[]} */
export const codesByCategories = [
  {
    category: '1xx 信息响应',
    codes: [
      { code: 100, name: 'Continue', description: '等待客户端发送请求主体。', type: 'HTTP' },
      { code: 101, name: 'Switching Protocols', description: '服务器同意切换协议。', type: 'HTTP' },
      { code: 102, name: 'Processing', description: '服务器正在处理请求，暂无可用响应。', type: 'WebDav' },
      { code: 103, name: 'Early Hints', description: '服务器在最终 HTTP 消息前返回部分响应头。', type: 'HTTP' }
    ]
  },
  {
    category: '2xx 成功',
    codes: [
      { code: 200, name: 'OK', description: 'HTTP 请求成功的标准响应。', type: 'HTTP' },
      { code: 201, name: 'Created', description: '请求已完成，并创建了新资源。', type: 'HTTP' },
      { code: 202, name: 'Accepted', description: '请求已接受处理，但处理尚未完成。', type: 'HTTP' },
      { code: 203, name: 'Non-Authoritative Information', description: '请求成功，但内容由转换代理修改过。', type: 'HTTP' },
      { code: 204, name: 'No Content', description: '服务器成功处理请求，未返回任何内容。', type: 'HTTP' },
      { code: 205, name: 'Reset Content', description: '服务器指示重置发送此请求的文档视图。', type: 'HTTP' },
      { code: 206, name: 'Partial Content', description: '服务器因客户端 Range 头仅返回部分资源。', type: 'HTTP' },
      { code: 207, name: 'Multi-Status', description: '消息体为 XML，可包含多个独立响应码。', type: 'WebDav' },
      { code: 208, name: 'Already Reported', description: 'DAV 绑定成员已在前面(多状态)响应中枚举。', type: 'WebDav' },
      { code: 226, name: 'IM Used', description: '服务器已满足资源请求，响应为结果的表示。', type: 'HTTP' }
    ]
  },
  {
    category: '3xx 重定向',
    codes: [
      { code: 300, name: 'Multiple Choices', description: '资源存在多个可选项供客户端跟随。', type: 'HTTP' },
      { code: 301, name: 'Moved Permanently', description: '本请求及未来请求都应指向给定 URI。', type: 'HTTP' },
      { code: 302, name: 'Found', description: '重定向到另一 URL。这是行业实践与标准矛盾的示例。', type: 'HTTP' },
      { code: 303, name: 'See Other', description: '请求响应可在另一 URI 用 GET 方法获取。', type: 'HTTP' },
      { code: 304, name: 'Not Modified', description: '资源自请求头指定版本后未修改。', type: 'HTTP' },
      { code: 305, name: 'Use Proxy', description: '请求资源只能通过代理访问，地址在响应中提供。', type: 'HTTP' },
      { code: 306, name: 'Switch Proxy', description: '已不再使用。原意为"后续请求应使用指定代理"。', type: 'HTTP' },
      { code: 307, name: 'Temporary Redirect', description: '本次请求应使用另一 URI 重复；未来请求仍用原 URI。', type: 'HTTP' },
      { code: 308, name: 'Permanent Redirect', description: '本请求及所有未来请求都应使用另一 URI 重复。', type: 'HTTP' }
    ]
  },
  {
    category: '4xx 客户端错误',
    codes: [
      { code: 400, name: 'Bad Request', description: '服务器因明显客户端错误无法/不愿处理请求。', type: 'HTTP' },
      { code: 401, name: 'Unauthorized', description: '类似 403，但专用于需要认证但失败或未提供时。', type: 'HTTP' },
      { code: 402, name: 'Payment Required', description: '保留将来使用。原意图用于数字现金或微支付方案。', type: 'HTTP' },
      { code: 403, name: 'Forbidden', description: '请求有效，但服务器拒绝执行。用户可能无权限。', type: 'HTTP' },
      { code: 404, name: 'Not Found', description: '请求的资源未找到，但未来可能可用。', type: 'HTTP' },
      { code: 405, name: 'Method Not Allowed', description: '请求方法不被请求资源支持。', type: 'HTTP' },
      { code: 406, name: 'Not Acceptable', description: '资源只能生成不符合 Accept 头的内容。', type: 'HTTP' },
      { code: 407, name: 'Proxy Authentication Required', description: '客户端必须先向代理认证。', type: 'HTTP' },
      { code: 408, name: 'Request Timeout', description: '服务器等待请求超时。', type: 'HTTP' },
      { code: 409, name: 'Conflict', description: '请求因冲突(如编辑冲突)无法处理。', type: 'HTTP' },
      { code: 410, name: 'Gone', description: '请求资源已不可用且不会再可用。', type: 'HTTP' },
      { code: 411, name: 'Length Required', description: '请求未指定内容长度，而资源要求该字段。', type: 'HTTP' },
      { code: 412, name: 'Precondition Failed', description: '服务器不满足请求者设置的前置条件。', type: 'HTTP' },
      { code: 413, name: 'Payload Too Large', description: '请求大于服务器愿意或能够处理的范围。', type: 'HTTP' },
      { code: 414, name: 'URI Too Long', description: '提供的 URI 过长，服务器无法处理。', type: 'HTTP' },
      { code: 415, name: 'Unsupported Media Type', description: '请求实体的媒体类型不被服务器或资源支持。', type: 'HTTP' },
      { code: 416, name: 'Range Not Satisfiable', description: '客户端请求文件部分，但服务器无法提供该部分。', type: 'HTTP' },
      { code: 417, name: 'Expectation Failed', description: '服务器无法满足 Expect 请求头字段要求。', type: 'HTTP' },
      { code: 418, name: "I'm a teapot", description: '服务器拒绝用茶壶煮咖啡的尝试。', type: 'HTTP' },
      { code: 421, name: 'Misdirected Request', description: '请求指向无法生成响应的服务器。', type: 'HTTP' },
      { code: 422, name: 'Unprocessable Entity', description: '请求格式正确，但因语义错误无法执行。', type: 'HTTP' },
      { code: 423, name: 'Locked', description: '正在访问的资源已被锁定。', type: 'HTTP' },
      { code: 424, name: 'Failed Dependency', description: '请求因前一请求失败而失败。', type: 'HTTP' },
      { code: 425, name: 'Too Early', description: '服务器不愿冒险处理可能被重放的请求。', type: 'HTTP' },
      { code: 426, name: 'Upgrade Required', description: '客户端应切换到其他协议(如 TLS/1.0)。', type: 'HTTP' },
      { code: 428, name: 'Precondition Required', description: '源服务器要求请求为条件请求。', type: 'HTTP' },
      { code: 429, name: 'Too Many Requests', description: '用户在给定时间内发送了过多请求。', type: 'HTTP' },
      { code: 431, name: 'Request Header Fields Too Large', description: '单个或所有头字段过大，服务器不愿处理。', type: 'HTTP' },
      { code: 451, name: 'Unavailable For Legal Reasons', description: '服务器运营者收到法律要求，拒绝访问资源。', type: 'HTTP' }
    ]
  },
  {
    category: '5xx 服务器错误',
    codes: [
      { code: 500, name: 'Internal Server Error', description: '通用错误消息，遇到意外条件且无更具体消息时使用。', type: 'HTTP' },
      { code: 501, name: 'Not Implemented', description: '服务器不识别请求方法，或无能力完成请求。', type: 'HTTP' },
      { code: 502, name: 'Bad Gateway', description: '服务器作为网关/代理时收到上游无效响应。', type: 'HTTP' },
      { code: 503, name: 'Service Unavailable', description: '服务器当前不可用(过载或维护)。', type: 'HTTP' },
      { code: 504, name: 'Gateway Timeout', description: '服务器作为网关/代理时未及时收到上游响应。', type: 'HTTP' },
      { code: 505, name: 'HTTP Version Not Supported', description: '服务器不支持请求使用的 HTTP 协议版本。', type: 'HTTP' },
      { code: 506, name: 'Variant Also Negotiates', description: '请求的透明内容协商导致循环引用。', type: 'HTTP' },
      { code: 507, name: 'Insufficient Storage', description: '服务器无法存储完成请求所需的表示。', type: 'HTTP' },
      { code: 508, name: 'Loop Detected', description: '服务器处理请求时检测到无限循环。', type: 'HTTP' },
      { code: 510, name: 'Not Extended', description: '需要进一步扩展请求服务器才能完成。', type: 'HTTP' },
      { code: 511, name: 'Network Authentication Required', description: '客户端需认证以获取网络访问权限。', type: 'HTTP' }
    ]
  }
];
