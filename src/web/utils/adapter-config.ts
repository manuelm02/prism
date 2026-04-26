/**
 * OpenCLI 适配器配置文件
 * 包含所有网站的命令配置和友好的参数映射
 */

// ==================== 类型定义 ====================

/**
 * 参数类型
 */
export type ParamType = 'string' | 'number' | 'boolean' | 'select'

/**
 * 输出类型
 */
export type OutputType = 'text' | 'json' | 'table' | 'file'

/**
 * 参数配置
 */
export interface ParamConfig {
  /** 原始参数名 */
  name: string
  /** 友好的中文显示名 */
  friendlyName: string
  /** 参数类型 */
  type: ParamType
  /** 是否必填 */
  required: boolean
  /** 默认值 */
  default?: string | number | boolean
  /** 选项列表（用于 select 类型） */
  options?: string[]
  /** 参数说明 */
  description: string
  /** 是否为位置参数 */
  positional?: boolean
  /** 是否隐藏（不显示在表单中） */
  hidden?: boolean
}

/**
 * 命令配置
 */
export interface CommandConfig {
  /** 命令ID */
  id: string
  /** 命令名称 */
  name: string
  /** 命令描述 */
  description: string
  /** OpenCLI 命令名 */
  opencliCommand: string
  /** 参数列表 */
  params: ParamConfig[]
  /** 输出类型 */
  outputType: OutputType
  /** 输出列 */
  columns?: string[]
}

/**
 * 网站配置
 */
export interface SiteConfig {
  /** 网站ID */
  id: string
  /** 网站名称 */
  name: string
  /** 图标（emoji或图片路径） */
  icon: string
  /** 网站描述 */
  description: string
  /** 网站域名 */
  domain: string
  /** 网站主题色 */
  themeColor?: string
  /** 命令列表 */
  commands: CommandConfig[]
}

// ==================== Bilibili 配置 ====================

const bilibiliConfig: SiteConfig = {
  id: 'bilibili',
  name: '哔哩哔哩',
  icon: '📺',
  description: 'B站视频、动态、评论等内容',
  domain: 'www.bilibili.com',
  themeColor: '#00a1d6',
  commands: [
    {
      id: 'bilibili-video',
      name: '视频详情',
      description: '获取B站视频元数据（标题、作者、时长、统计等）',
      opencliCommand: 'video',
      params: [
        {
          name: 'bvid',
          friendlyName: '视频BV号',
          type: 'string',
          required: true,
          positional: true,
          description: 'BV号、视频URL或b23.tv短链接'
        }
      ],
      outputType: 'json',
      columns: ['field', 'value']
    },
    {
      id: 'bilibili-search',
      name: '搜索视频',
      description: '搜索B站视频或用户',
      opencliCommand: 'search',
      params: [
        {
          name: 'query',
          friendlyName: '搜索关键词',
          type: 'string',
          required: true,
          positional: true,
          description: '搜索关键词'
        },
        {
          name: 'type',
          friendlyName: '搜索类型',
          type: 'select',
          required: false,
          default: 'video',
          options: ['video', 'user'],
          description: '搜索视频或用户'
        },
        {
          name: 'page',
          friendlyName: '页码',
          type: 'number',
          required: false,
          default: 1,
          description: '结果页码',
          hidden: true
        },
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回结果数量'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'title', 'author', 'score', 'url']
    },
    {
      id: 'bilibili-hot',
      name: '热门视频',
      description: 'B站热门视频榜单',
      opencliCommand: 'hot',
      params: [
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回视频数量'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'title', 'author', 'play', 'danmaku']
    },
    {
      id: 'bilibili-ranking',
      name: '排行榜',
      description: 'B站视频排行榜',
      opencliCommand: 'ranking',
      params: [
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回视频数量'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'title', 'author', 'score', 'url']
    },
    {
      id: 'bilibili-comments',
      name: '视频评论',
      description: '获取B站视频评论（使用官方API + WBI签名）',
      opencliCommand: 'comments',
      params: [
        {
          name: 'bvid',
          friendlyName: '视频BV号',
          type: 'string',
          required: true,
          positional: true,
          description: '视频BV号（如 BV1WtAGzYEBm）'
        },
        {
          name: 'limit',
          friendlyName: '评论数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回评论数量（最多50）'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'author', 'text', 'likes', 'replies', 'time']
    },
    {
      id: 'bilibili-subtitle',
      name: '视频字幕',
      description: '获取B站视频的字幕',
      opencliCommand: 'subtitle',
      params: [
        {
          name: 'bvid',
          friendlyName: '视频BV号',
          type: 'string',
          required: true,
          positional: true,
          description: '视频BV号'
        },
        {
          name: 'lang',
          friendlyName: '字幕语言',
          type: 'string',
          required: false,
          description: '字幕语言代码（如 zh-CN, en-US, ai-zh），默认取第一个'
        }
      ],
      outputType: 'table',
      columns: ['index', 'from', 'to', 'content']
    },
    {
      id: 'bilibili-download',
      name: '下载视频',
      description: '下载B站视频（需要 yt-dlp）',
      opencliCommand: 'download',
      params: [
        {
          name: 'bvid',
          friendlyName: '视频BV号',
          type: 'string',
          required: true,
          positional: true,
          description: '视频BV号（如 BV1xxx）'
        },
        {
          name: 'output',
          friendlyName: '输出目录',
          type: 'string',
          required: false,
          default: './bilibili-downloads',
          description: '输出目录'
        },
        {
          name: 'quality',
          friendlyName: '视频质量',
          type: 'select',
          required: false,
          default: 'best',
          options: ['best', '1080p', '720p', '480p'],
          description: '视频质量'
        }
      ],
      outputType: 'table',
      columns: ['bvid', 'title', 'status', 'size']
    },
    {
      id: 'bilibili-user-videos',
      name: '用户投稿',
      description: '查看指定用户的投稿视频',
      opencliCommand: 'user-videos',
      params: [
        {
          name: 'uid',
          friendlyName: '用户UID',
          type: 'string',
          required: true,
          positional: true,
          description: '用户UID或用户名'
        },
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回结果数量'
        },
        {
          name: 'order',
          friendlyName: '排序方式',
          type: 'select',
          required: false,
          default: 'pubdate',
          options: ['pubdate', 'click', 'stow'],
          description: '排序：发布日期、播放量、收藏数'
        },
        {
          name: 'page',
          friendlyName: '页码',
          type: 'number',
          required: false,
          default: 1,
          description: '页码',
          hidden: true
        }
      ],
      outputType: 'table',
      columns: ['rank', 'title', 'plays', 'likes', 'date', 'url']
    },
    {
      id: 'bilibili-feed',
      name: '动态时间线',
      description: '动态时间线（不传uid查关注时间线，传uid查指定用户动态）',
      opencliCommand: 'feed',
      params: [
        {
          name: 'uid',
          friendlyName: '用户UID',
          type: 'string',
          required: false,
          positional: true,
          description: '用户UID或用户名（不传则显示关注时间线）'
        },
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '最大返回结果'
        },
        {
          name: 'type',
          friendlyName: '类型过滤',
          type: 'select',
          required: false,
          default: 'all',
          options: ['all', 'video', 'article', 'draw', 'text'],
          description: '过滤类型'
        },
        {
          name: 'pages',
          friendlyName: '页数',
          type: 'number',
          required: false,
          default: 1,
          description: '获取页数（每页约20条）'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'time', 'author', 'title', 'type', 'likes', 'url']
    },
    {
      id: 'bilibili-following',
      name: '关注列表',
      description: '获取B站用户的关注列表',
      opencliCommand: 'following',
      params: [
        {
          name: 'uid',
          friendlyName: '用户UID',
          type: 'string',
          required: false,
          positional: true,
          description: '目标用户ID（默认为当前登录用户）'
        },
        {
          name: 'page',
          friendlyName: '页码',
          type: 'number',
          required: false,
          default: 1,
          description: '结果页码',
          hidden: true
        },
        {
          name: 'limit',
          friendlyName: '每页数量',
          type: 'number',
          required: false,
          default: 50,
          description: '每页数量（最多50）'
        }
      ],
      outputType: 'table',
      columns: ['mid', 'name', 'sign', 'following', 'fans']
    },
    {
      id: 'bilibili-history',
      name: '观看历史',
      description: '我的观看历史',
      opencliCommand: 'history',
      params: [
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回结果数量'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'title', 'author', 'progress', 'url']
    },
    {
      id: 'bilibili-favorite',
      name: '我的收藏',
      description: '我的收藏夹',
      opencliCommand: 'favorite',
      params: [
        {
          name: 'fid',
          friendlyName: '收藏夹ID',
          type: 'string',
          required: false,
          description: `收藏夹ID获取方法：
1. 打开B站，进入"个人中心" → "收藏"
2. 点击要查看的收藏夹
3. 从浏览器地址栏复制URL中的 fid 参数值
例如：space.bilibili.com/xxx/favlist?fid=123456
则收藏夹ID为 123456`
        },
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回结果数量'
        },
        {
          name: 'page',
          friendlyName: '页码',
          type: 'number',
          required: false,
          default: 1,
          description: '页码',
          hidden: true
        }
      ],
      outputType: 'table',
      columns: ['rank', 'title', 'author', 'plays', 'url']
    },
    {
      id: 'bilibili-me',
      name: '我的信息',
      description: '我的B站账号信息',
      opencliCommand: 'me',
      params: [],
      outputType: 'json',
      columns: ['name', 'uid', 'level', 'coins', 'followers', 'following']
    }
  ]
}

// ==================== 小红书配置 ====================

const xiaohongshuConfig: SiteConfig = {
  id: 'xiaohongshu',
  name: '小红书',
  icon: '📕',
  description: '小红书笔记、创作者中心、评论等',
  domain: 'www.xiaohongshu.com',
  themeColor: '#fe2c55',
  commands: [
    {
      id: 'xiaohongshu-note',
      name: '笔记详情',
      description: '获取小红书笔记正文和互动数据',
      opencliCommand: 'note',
      params: [
        {
          name: 'note-id',
          friendlyName: '笔记ID',
          type: 'string',
          required: true,
          positional: true,
          description: '完整的小红书笔记URL（含xsec_token）'
        }
      ],
      outputType: 'json',
      columns: ['field', 'value']
    },
    {
      id: 'xiaohongshu-search',
      name: '搜索笔记',
      description: '搜索小红书笔记',
      opencliCommand: 'search',
      params: [
        {
          name: 'query',
          friendlyName: '搜索关键词',
          type: 'string',
          required: true,
          positional: true,
          description: '搜索关键词'
        },
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回结果数量'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'title', 'author', 'likes', 'published_at', 'url']
    },
    {
      id: 'xiaohongshu-feed',
      name: '首页推荐',
      description: '小红书首页推荐Feed',
      opencliCommand: 'feed',
      params: [
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回结果数量'
        }
      ],
      outputType: 'table',
      columns: ['title', 'author', 'likes', 'type', 'url']
    },
    {
      id: 'xiaohongshu-comments',
      name: '笔记评论',
      description: '获取小红书笔记评论（支持楼中楼子回复）',
      opencliCommand: 'comments',
      params: [
        {
          name: 'note-id',
          friendlyName: '笔记ID',
          type: 'string',
          required: true,
          positional: true,
          description: '完整的小红书笔记URL（含xsec_token）'
        },
        {
          name: 'limit',
          friendlyName: '评论数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回评论数量（最多50）'
        },
        {
          name: 'with-replies',
          friendlyName: '包含回复',
          type: 'boolean',
          required: false,
          default: false,
          description: '是否包含楼中楼回复'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'author', 'text', 'likes', 'time', 'is_reply', 'reply_to']
    },
    {
      id: 'xiaohongshu-user',
      name: '用户笔记',
      description: '获取小红书用户的公开笔记',
      opencliCommand: 'user',
      params: [
        {
          name: 'id',
          friendlyName: '用户ID',
          type: 'string',
          required: true,
          positional: true,
          description: '用户ID或主页URL'
        },
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回笔记数量'
        }
      ],
      outputType: 'table',
      columns: ['id', 'title', 'type', 'likes', 'url']
    },
    {
      id: 'xiaohongshu-download',
      name: '下载笔记',
      description: '下载小红书笔记中的图片和视频',
      opencliCommand: 'download',
      params: [
        {
          name: 'note-id',
          friendlyName: '笔记ID',
          type: 'string',
          required: true,
          positional: true,
          description: '完整的小红书笔记URL或xhslink短链接'
        },
        {
          name: 'output',
          friendlyName: '输出目录',
          type: 'string',
          required: false,
          default: './xiaohongshu-downloads',
          description: '输出目录'
        }
      ],
      outputType: 'table',
      columns: ['index', 'type', 'status', 'size']
    },
    {
      id: 'xiaohongshu-creator-profile',
      name: '创作者信息',
      description: '小红书创作者账号信息（粉丝/关注/获赞/成长等级）',
      opencliCommand: 'creator-profile',
      params: [],
      outputType: 'json',
      columns: ['field', 'value']
    },
    {
      id: 'xiaohongshu-creator-stats',
      name: '创作者数据',
      description: '小红书创作者数据总览（观看/点赞/收藏/评论/分享/涨粉，含每日趋势）',
      opencliCommand: 'creator-stats',
      params: [
        {
          name: 'period',
          friendlyName: '统计周期',
          type: 'select',
          required: false,
          default: 'seven',
          options: ['seven', 'thirty'],
          description: '统计周期：7天或30天'
        }
      ],
      outputType: 'table',
      columns: ['metric', 'total', 'trend']
    },
    {
      id: 'xiaohongshu-creator-notes',
      name: '我的笔记列表',
      description: '小红书创作者笔记列表及每篇数据',
      opencliCommand: 'creator-notes',
      params: [
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回笔记数量'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'id', 'title', 'date', 'views', 'likes', 'collects', 'comments', 'url']
    },
    {
      id: 'xiaohongshu-creator-note-detail',
      name: '笔记详细数据',
      description: '小红书单篇笔记详情页数据（笔记信息+核心/互动数据+观看来源+观众画像+趋势数据）',
      opencliCommand: 'creator-note-detail',
      params: [
        {
          name: 'note-id',
          friendlyName: '笔记ID',
          type: 'string',
          required: true,
          positional: true,
          description: '笔记ID（从创作者笔记列表或笔记详情页URL获取）'
        }
      ],
      outputType: 'table',
      columns: ['section', 'metric', 'value', 'extra']
    },
    {
      id: 'xiaohongshu-notifications',
      name: '通知消息',
      description: '小红书通知（提及/点赞/关注）',
      opencliCommand: 'notifications',
      params: [
        {
          name: 'type',
          friendlyName: '通知类型',
          type: 'select',
          required: false,
          default: 'mentions',
          options: ['mentions', 'likes', 'connections'],
          description: '通知类型：提及、点赞、关注'
        },
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回通知数量'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'user', 'action', 'content', 'note', 'time']
    },
    {
      id: 'xiaohongshu-publish',
      name: '发布笔记',
      description: '小红书发布图文笔记',
      opencliCommand: 'publish',
      params: [
        {
          name: 'title',
          friendlyName: '笔记标题',
          type: 'string',
          required: true,
          description: '笔记标题（最多20字）'
        },
        {
          name: 'content',
          friendlyName: '笔记正文',
          type: 'string',
          required: true,
          positional: true,
          description: '笔记正文'
        },
        {
          name: 'images',
          friendlyName: '图片路径',
          type: 'string',
          required: true,
          description: '图片路径，逗号分隔，最多9张（jpg/png/gif/webp）'
        },
        {
          name: 'topics',
          friendlyName: '话题标签',
          type: 'string',
          required: false,
          description: '话题标签，逗号分隔，不含#号'
        },
        {
          name: 'draft',
          friendlyName: '保存草稿',
          type: 'boolean',
          required: false,
          default: false,
          description: '保存为草稿，不直接发布'
        }
      ],
      outputType: 'table',
      columns: ['status', 'detail']
    }
  ]
}

// ==================== 携程配置 ====================

const ctripConfig: SiteConfig = {
  id: 'ctrip',
  name: '携程',
  icon: '✈️',
  description: '携程目的地、景区和酒店搜索',
  domain: 'www.ctrip.com',
  themeColor: '#0086f6',
  commands: [
    {
      id: 'ctrip-search',
      name: '搜索',
      description: '搜索携程目的地、景区和酒店联想结果',
      opencliCommand: 'search',
      params: [
        {
          name: 'query',
          friendlyName: '搜索关键词',
          type: 'string',
          required: true,
          positional: true,
          description: '搜索关键词（城市或景点）'
        },
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回结果数量'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'name', 'type', 'score', 'price', 'url']
    }
  ]
}

// ==================== 淘宝配置 ====================

const taobaoConfig: SiteConfig = {
  id: 'taobao',
  name: '淘宝',
  icon: '🛒',
  description: '淘宝商品搜索、详情、购物车等',
  domain: 'www.taobao.com',
  themeColor: '#ff5000',
  commands: [
    {
      id: 'taobao-search',
      name: '搜索商品',
      description: '淘宝商品搜索',
      opencliCommand: 'search',
      params: [
        {
          name: 'query',
          friendlyName: '搜索关键词',
          type: 'string',
          required: true,
          positional: true,
          description: '搜索关键词'
        },
        {
          name: 'sort',
          friendlyName: '排序方式',
          type: 'select',
          required: false,
          default: 'default',
          options: ['default', 'sale', 'price'],
          description: '排序：默认、销量、价格'
        },
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回结果数量（最多40）'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'title', 'price', 'sales', 'shop', 'location', 'item_id', 'url']
    },
    {
      id: 'taobao-detail',
      name: '商品详情',
      description: '淘宝商品详情',
      opencliCommand: 'detail',
      params: [
        {
          name: 'id',
          friendlyName: '商品ID',
          type: 'string',
          required: true,
          positional: true,
          description: '商品ID'
        }
      ],
      outputType: 'json',
      columns: ['field', 'value']
    },
    {
      id: 'taobao-reviews',
      name: '商品评价',
      description: '淘宝商品评价',
      opencliCommand: 'reviews',
      params: [
        {
          name: 'id',
          friendlyName: '商品ID',
          type: 'string',
          required: true,
          positional: true,
          description: '商品ID'
        },
        {
          name: 'limit',
          friendlyName: '评价数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回评价数量（最多20）'
        }
      ],
      outputType: 'table',
      columns: ['rank', 'user', 'content', 'date', 'spec']
    },
    {
      id: 'taobao-cart',
      name: '购物车',
      description: '查看淘宝购物车',
      opencliCommand: 'cart',
      params: [
        {
          name: 'limit',
          friendlyName: '结果数量',
          type: 'number',
          required: false,
          default: 10,
          description: '返回数量（最多50）'
        }
      ],
      outputType: 'table',
      columns: ['index', 'title', 'price', 'spec', 'shop']
    },
    {
      id: 'taobao-add-cart',
      name: '加入购物车',
      description: '淘宝加入购物车',
      opencliCommand: 'add-cart',
      params: [
        {
          name: 'id',
          friendlyName: '商品ID',
          type: 'string',
          required: true,
          positional: true,
          description: '商品ID'
        },
        {
          name: 'spec',
          friendlyName: '规格关键词',
          type: 'string',
          required: false,
          description: '规格关键词（如"180度"、"红色 XL"），多个规格用空格分隔'
        },
        {
          name: 'dry-run',
          friendlyName: '预览模式',
          type: 'boolean',
          required: false,
          default: false,
          description: '仅预览，不实际加入购物车'
        }
      ],
      outputType: 'table',
      columns: ['status', 'title', 'price', 'selected_spec', 'item_id']
    }
  ]
}

// ==================== 所有网站配置 ====================

export const siteConfigs: SiteConfig[] = [
  xiaohongshuConfig,
  bilibiliConfig,
  taobaoConfig,
  ctripConfig
]

// ==================== 辅助函数 ====================

/**
 * 根据ID获取网站配置
 */
export function getSiteConfig(siteId: string): SiteConfig | undefined {
  return siteConfigs.find(site => site.id === siteId)
}

/**
 * 根据网站ID和命令ID获取命令配置
 */
export function getCommandConfig(siteId: string, commandId: string): CommandConfig | undefined {
  const site = getSiteConfig(siteId)
  if (!site) return undefined
  return site.commands.find(cmd => cmd.id === commandId)
}

/**
 * 根据OpenCLI命令名获取命令配置
 */
export function getCommandByOpenCLIName(siteId: string, opencliCommand: string): CommandConfig | undefined {
  const site = getSiteConfig(siteId)
  if (!site) return undefined
  return site.commands.find(cmd => cmd.opencliCommand === opencliCommand)
}

/**
 * 获取所有网站ID列表
 */
export function getAllSiteIds(): string[] {
  return siteConfigs.map(site => site.id)
}

/**
 * 获取网站的命令ID列表
 */
export function getSiteCommandIds(siteId: string): string[] {
  const site = getSiteConfig(siteId)
  if (!site) return []
  return site.commands.map(cmd => cmd.id)
}

/**
 * 构建OpenCLI命令参数
 */
export function buildOpenCLIArgs(command: CommandConfig, paramValues: Record<string, string | number | boolean>): string {
  const args: string[] = []
  
  for (const param of command.params) {
    const value = paramValues[param.name]
    
    // 如果没有值且有默认值，使用默认值
    const finalValue = value ?? param.default
    
    // 跳过没有值的可选参数
    if (finalValue === undefined || finalValue === '') continue
    
    // 位置参数直接添加值（用单引号包裹以支持空格）
    if (param.positional) {
      args.push(`'${String(finalValue).replace(/'/g, "'\\''")}'`)
    } else {
      // 命名参数使用 --name value 格式
      if (param.type === 'boolean') {
        if (finalValue === true) {
          args.push(`--${param.name}`)
        }
      } else {
        // 用单引号包裹以支持空格
        args.push(`--${param.name}`, `'${String(finalValue).replace(/'/g, "'\\''")}'`)
      }
    }
  }
  
  return args.join(' ')
}

/**
 * 验证参数是否满足必填要求
 */
export function validateParams(command: CommandConfig, paramValues: Record<string, string | number | boolean>): { valid: boolean; missing: string[] } {
  const missing: string[] = []
  
  for (const param of command.params) {
    if (param.required) {
      const value = paramValues[param.name]
      if (value === undefined || value === '') {
        missing.push(param.friendlyName)
      }
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  }
}
