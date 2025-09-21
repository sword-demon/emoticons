// 基于图1的关键词数据库
export interface EmotionKeyword {
  keyword: string;
  description: string;
  category: string;
}

export const emotionKeywords: EmotionKeyword[] = [
  // 情绪表达类
  { keyword: "笑出鹅叫", description: "[主体]仰头张嘴笑出强烈声波纹, 身体剧烈抖动, 眼泪飞溅", category: "情绪表达" },
  { keyword: "开心到起飞", description: "[主体]脚下喷射火箭火焰冲上天, 双手高举比耶, 发丝/毛发竖直上飘", category: "情绪表达" },
  { keyword: "快乐摸鱼", description: "[主体]戴墨镜翘二郎腿躺椅, 手持饮料杯冒冷气", category: "情绪表达" },
  { keyword: "打工人爆肝", description: "[主体]旋坐冒烟电脑前, 咖啡杯炸裂, 头顶齿轮卡停崩坏角", category: "情绪表达" },
  { keyword: "CPU干烧了", description: "[主体]头顶过载CPU芯片冒火星, 散热风扇扭曲变形", category: "情绪表达" },
  { keyword: "瞳孔地震", description: "[主体]眼睛瞪圆瞳孔碎裂进石, 下巴脱臼下落", category: "情绪表达" },
  { keyword: "狂喜劈叉", description: "[主体]腾空劈叉跳起, 裙摆/衣角炸出星星, 头发呈放射状", category: "情绪表达" },
  { keyword: "核爆怒气", description: "[主体]头顶膨胀炸出蘑菇云, 脸红裂缝喷火星, 牙齿咬碎", category: "情绪表达" },
  { keyword: "泪奔成河", description: "[主体]狂奔哭出洪水, 泪流中掉道路, 手抓纸巾飘摆", category: "情绪表达" },
  { keyword: "一键三连", description: "[主体]机械拳猛硬点赞/收藏/转发按钮, 按钮凹陷火花四射", category: "情绪表达" },
  { keyword: "比心发射", description: "[主体]手比爱心射出激光心形, 击中屏幕产生蛛网裂痕", category: "情绪表达" },
  { keyword: "炫饭狂魔", description: "[主体]怀抱巨碗狂扒饭, 饭粒龙卷风环绕, 嘴部鼓胀", category: "情绪表达" },
  { keyword: "电子咸鱼瘫", description: "[主体]发光咸鱼竞技椅, 手柄掉落, 屏幕显示'DEFEAT'红字", category: "情绪表达" },

  // 日常生活类
  { keyword: "生气", description: "[主体]脸部通红愤怒表情, 额头青筋暴起, 拳头紧握", category: "日常生活" },
  { keyword: "委屈", description: "[主体]眼角含泪委屈表情, 嘴角下垂, 低头不语", category: "日常生活" },
  { keyword: "困惑", description: "[主体]挠头疑惑表情, 头顶问号, 眉头紧锁", category: "日常生活" },
  { keyword: "无语", description: "[主体]翻白眼无语表情, 手扶额头, 一脸无奈", category: "日常生活" },
  { keyword: "英勇", description: "[主体]英勇无畏表情, 胸膛挺起, 目光坚定", category: "日常生活" },
  { keyword: "哭泣", description: "[主体]泪如雨下表情, 纸巾不离手, 肩膀颤抖", category: "日常生活" },
  { keyword: "微笑", description: "[主体]温和微笑表情, 眼角弯弯, 嘴角上扬", category: "日常生活" },
  { keyword: "得意", description: "[主体]得意洋洋表情, 双手叉腰, 仰天大笑", category: "日常生活" },
  { keyword: "害羞", description: "[主体]脸红害羞表情, 双手捂脸, 偷偷张望", category: "日常生活" },
  { keyword: "惊讶", description: "[主体]瞪大眼睛惊讶表情, 嘴巴张开, 手捂嘴巴", category: "日常生活" },

  // 社交互动类
  { keyword: "加油", description: "[主体]握拳加油表情, 热血沸腾, 充满斗志", category: "社交互动" },
  { keyword: "拜托", description: "[主体]双手合十拜托表情, 眼神恳求, 诚恳态度", category: "社交互动" },
  { keyword: "谢谢", description: "[主体]感激谢谢表情, 微微鞠躬, 心怀感恩", category: "社交互动" },
  { keyword: "晚安", description: "[主体]温馨晚安表情, 月亮星星背景, 安详睡意", category: "社交互动" },
  { keyword: "早安", description: "[主体]精神早安表情, 阳光灿烂背景, 活力满满", category: "社交互动" },
  { keyword: "抱抱", description: "[主体]张开双臂拥抱表情, 温暖怀抱, 爱意满满", category: "社交互动" },
  { keyword: "亲亲", description: "[主体]嘟嘴亲亲表情, 爱心飞舞, 甜蜜温馨", category: "社交互动" },
  { keyword: "打招呼", description: "[主体]挥手打招呼表情, 友善微笑, 热情洋溢", category: "社交互动" },

  // 动作特效类
  { keyword: "思考", description: "[主体]沉思表情, 手托下巴, 眼神专注深邃", category: "动作特效" },
  { keyword: "疑问", description: "[主体]疑惑表情, 头顶大问号, 眉头紧皱", category: "动作特效" },
  { keyword: "点赞", description: "[主体]竖起大拇指点赞, 自信笑容, 认可赞同", category: "动作特效" },
  { keyword: "鼓掌", description: "[主体]热烈鼓掌表情, 双手拍击, 赞赏认可", category: "动作特效" },
  { keyword: "比心", description: "[主体]双手比心表情, 爱心特效, 甜蜜可爱", category: "动作特效" },
  { keyword: "敬礼", description: "[主体]标准敬礼姿势, 严肃认真表情, 庄重正式", category: "动作特效" },
  { keyword: "招手", description: "[主体]友好招手表情, 热情洋溢, 欢迎姿态", category: "动作特效" },
  { keyword: "飞吻", description: "[主体]飞吻表情, 爱心飘飞特效, 浪漫甜蜜", category: "动作特效" },

  // 天气季节类
  { keyword: "炎热", description: "[主体]热得汗流浃背, 用扇子拼命扇风, 太阳背景", category: "天气季节" },
  { keyword: "寒冷", description: "[主体]冻得瑟瑟发抖, 呼出白气, 雪花背景", category: "天气季节" },
  { keyword: "下雨", description: "[主体]撑伞躲雨表情, 雨滴纷飞, 水花四溅", category: "天气季节" },
  { keyword: "晴天", description: "[主体]阳光明媚心情好, 太阳高照, 万里无云", category: "天气季节" },

  // 美食相关类
  { keyword: "饿了", description: "[主体]饥饿难耐表情, 肚子咕咕叫, 口水直流", category: "美食相关" },
  { keyword: "好吃", description: "[主体]品尝美食陶醉表情, 眼神迷离, 满足享受", category: "美食相关" },
  { keyword: "想吃", description: "[主体]垂涎欲滴表情, 眼冒金光, 渴望美食", category: "美食相关" },

  // 工作学习类
  { keyword: "摸鱼", description: "[主体]偷偷摸鱼表情, 鬼鬼祟祟, 左顾右盼", category: "工作学习" },
  { keyword: "加班", description: "[主体]深夜加班表情, 疲惫不堪, 台灯昏暗", category: "工作学习" },
  { keyword: "开会", description: "[主体]开会听讲表情, 正襟危坐, 专注认真", category: "工作学习" },
  { keyword: "下班", description: "[主体]下班欣喜表情, 收拾东西, 迫不及待", category: "工作学习" },
  { keyword: "周一", description: "[主体]周一忧郁表情, 无精打采, 不想上班", category: "工作学习" },
  { keyword: "周五", description: "[主体]周五兴奋表情, 精神抖擞, 期待周末", category: "工作学习" },
  { keyword: "老板", description: "[主体]面对老板表情, 紧张拘谨, 小心翼翼", category: "工作学习" },
  { keyword: "升职", description: "[主体]升职喜悦表情, 意气风发, 志得意满", category: "工作学习" },
  { keyword: "社畜", description: "[主体]社畜疲惫表情, 身心俱疲, 麻木不仁", category: "工作学习" },

  // 网络用语类
  { keyword: "佛系", description: "[主体]佛系淡然表情, 云淡风轻, 无欲无求", category: "网络用语" },
  { keyword: "咸鱼", description: "[主体]咸鱼瘫倒表情, 毫无动力, 懒散随意", category: "网络用语" },
  { keyword: "躺平", description: "[主体]躺平摆烂表情, 平躺不动, 放弃挣扎", category: "网络用语" },
  { keyword: "摆烂", description: "[主体]摆烂放弃表情, 破罐破摔, 无所谓态度", category: "网络用语" },
  { keyword: "内卷", description: "[主体]内卷焦虑表情, 压力山大, 疲于奔命", category: "网络用语" },
  { keyword: "打工人", description: "[主体]打工人坚韧表情, 默默承受, 努力生活", category: "网络用语" },
  { keyword: "yyds", description: "[主体]永远的神表情, 崇拜敬仰, 五体投地", category: "网络用语" },
  { keyword: "绝绝子", description: "[主体]绝绝子惊艳表情, 赞叹不已, 目瞪口呆", category: "网络用语" }
];

// 按分类组织关键词
export const keywordsByCategory = emotionKeywords.reduce((acc, keyword) => {
  if (!acc[keyword.category]) {
    acc[keyword.category] = [];
  }
  acc[keyword.category].push(keyword);
  return acc;
}, {} as Record<string, EmotionKeyword[]>);

// 获取所有分类
export const categories = Object.keys(keywordsByCategory);