import random
from .dictionary import Dictionary

# 60% Common Characters (60 total)
# Focus: High frequency, low complexity, easy for beginners
BASIC_CHARACTERS = [
    "的", "一", "是", "不", "了", "在", "人", "有", "我", "他", 
    "这", "个", "们", "中", "来", "上", "大", "为", "和", "国", 
    "地", "到", "以", "说", "时", "要", "就", "出", "会", "可", 
    "也", "你", "对", "生", "能", "而", "子", "那", "得", "于", 
    "着", "下", "自", "之", "年", "过", "发", "后", "作", "里", 
    "用", "道", "行", "所", "然", "家", "种", "事", "成", "方"
]

# 30% Functional Characters (30 total)
# Focus: Concrete nouns, clear actions, high semantic "linkability"
MEDIUM_CHARACTERS = [
    "心", "多", "天", "小", "好", "都", "没", "日", "起", "还",
    "想", "看", "文", "无", "开", "手", "十", "主", "又", "如",
    "前", "本", "见", "经", "头", "面", "公", "同", "三", "已"
]

# 10% Complex Characters (10 total)
# Focus: High point value, higher stroke count, deeper meanings
RARE_CHARACTERS = [
    "德", "繁", "藏", "露", "解", "愿", "影", "懂", "赛", "藏"
]

# Total Pool for the Random Generator
FULL_CHARACTER_POOL = BASIC_CHARACTERS + MEDIUM_CHARACTERS + RARE_CHARACTERS


BASIC_CHARACTERS_2 = [
    "的", "一", "是", "不", "了", "在", "人", "有", "我", "他", "这", "个", "们", "中", "来", "上", "大", "为", "和", "国",
    "地", "到", "以", "说", "时", "要", "就", "出", "会", "可", "也", "你", "对", "生", "能", "而", "子", "那", "得", "于",
    "着", "下", "自", "之", "年", "过", "发", "后", "作", "里", "用", "道", "行", "所", "然", "家", "种", "事", "成", "方",
    "多", "经", "么", "去", "法", "学", "如", "都", "同", "现", "当", "没", "动", "面", "起", "看", "定", "天", "分", "还",
    "进", "好", "小", "部", "其", "些", "主", "样", "理", "心", "她", "本", "前", "开", "但", "因", "只", "从", "想", "实",
    "意", "力", "化", "并", "间", "别", "各", "少", "直", "通", "真", "提", "立", "内", "最", "机", "两", "全", "向", "解",
    "系", "正", "位", "新", "果", "度", "且", "常", "引", "已", "由", "比", "代", "表", "战", "目", "打", "老", "更", "问",
    "安", "才", "体", "光", "门", "任", "重", "头", "快", "死", "此", "月", "什", "与", "及", "它", "设", "反", "流", "放",
    "指", "很", "结", "干", "被", "哪", "谁", "每", "即", "使", "若", "否", "却", "左", "右", "外", "东", "南", "西", "北",
    "长", "儿", "其", "几", "先", "或", "再", "又", "入", "求", "完", "接", "该", "正", "什", "它", "每", "且", "若", "否",
    "却", "这", "那", "哪", "谁", "各", "此", "由", "与", "其", "该", "并", "使", "即", "若", "否", "且", "或", "却", "由",
    "此", "从", "到", "于", "为", "了", "自", "后", "向", "下", "前", "后", "左", "右", "内", "外", "里", "外", "中", "间",
    "东", "南", "西", "北", "六", "七", "八", "九", "万", "亿", "平", "级", "政", "全", "意", "此", "情", "明", "性", "点",
    "正", "基", "情", "水", "机", "工", "物", "体", "二", "三", "四", "五", "天", "日", "手", "口", "分", "又", "什", "共",
    "再", "几", "先", "入", "求", "完", "接", "该", "并", "每", "即", "使", "若", "否", "且", "或", "却", "由", "此", "从"
]

MEDIUM_CHARACTERS_2 = [
    "文", "无", "手", "十", "见", "公", "气", "位", "口", "目", "足", "水", "火", "山", "石", "田", "土", "风", "雷", "云",
    "雨", "星", "海", "川", "路", "车", "马", "牛", "羊", "狗", "猫", "鱼", "鸟", "草", "木", "花", "叶", "米", "饭", "茶",
    "酒", "书", "笔", "画", "琴", "棋", "纸", "墨", "金", "银", "铁", "铜", "衣", "食", "住", "行", "走", "跑", "坐", "立",
    "言", "语", "听", "读", "写", "思", "感", "觉", "爱", "恨", "情", "仇", "笑", "哭", "冷", "热", "高", "低", "新", "旧",
    "强", "弱", "慢", "黑", "白", "红", "蓝", "黄", "绿", "青", "紫", "男", "女", "父", "母", "兄", "弟", "姐", "妹", "友",
    "朋", "师", "生", "医", "农", "工", "商", "兵", "王", "民", "神", "鬼", "仙", "佛", "朝", "夕", "古", "今", "早", "晚",
    "明", "暗", "阴", "阳", "空", "满", "光", "响", "味", "香", "甜", "苦", "辣", "咸", "深", "浅", "厚", "薄", "忙", "闲",
    "美", "丑", "善", "恶", "真", "假", "梦", "幻", "形", "影", "声", "色", "音", "乐", "舞"
]

RARE_CHARACTERS_2 = [
    "德", "繁", "藏", "露", "解", "愿", "影", "懂", "赛", "墨", "衡", "瀚", "麟", "黛", "翼", "霜", "霞", "魂", "魄", "幽",
    "幻", "禅", "儒", "圣", "贤", "鼎", "剑", "峰", "渊", "阔", "静", "默", "凝", "聚", "散", "离", "合", "缘", "劫", "命",
    "运", "灵", "蕴", "粹", "雅", "颂", "赋", "韵", "律", "极"
]

TECH_BASIC_CHARACTERS = [
    "电", "子", "数", "据", "网", "络", "算", "法", "信", "息", 
    "机", "器", "人", "智", "能", "芯", "片", "云", "端", "端", 
    "用", "户", "手", "机", "端", "开", "关", "输", "入", "出", 
    "库", "存", "文", "件", "码", "量", "化", "流", "度", "通", 
    "位", "元", "自", "动", "化", "点", "击", "搜", "索", "频", 
    "屏", "幕", "显", "示", "存", "储", "内", "存", "硬", "盘", 
    "路", "由", "连", "接", "发", "送", "接", "收", "传", "输", 
    "下", "载", "上", "传", "安", "全", "防", "护", "密", "码", 
    "工", "具", "应", "用", "软", "件", "系", "统", "核", "心"
]

TECH_MEDIUM_CHARACTERS = [
    "视", "频", "音", "频", "图", "像", "模", "拟", "数", "字", 
    "控", "制", "指", "令", "编", "程", "源", "代", "码", "虚", 
    "拟", "现", "实", "增", "强", "跨", "界", "交", "互", "界", 
    "面", "驱", "动", "扩", "展", "集", "成", "端", "口", "信", 
    "号", "基", "站", "感", "应"
]

TECH_RARE_CHARACTERS = [
    "巅", "覆", "隧", "链", "熵", "阈", "耦", "辖", "矩", "阵", 
    "晶", "硅", "磁", "量子", "瞬"
]
# Note: '量子' is technically two characters, but in a tech theme, 
# '量' and '子' are in Basic. If you need single-character 'Rare':
# ["巅", "覆", "隧", "链", "熵", "阈", "耦", "辖", "矩", "阵", "晶", "硅", "磁", "玄", "核"]

BASIC_CHARACTERS_LIST = [BASIC_CHARACTERS, BASIC_CHARACTERS_2, TECH_BASIC_CHARACTERS]
MEDIUM_CHARACTERS_LIST = [MEDIUM_CHARACTERS, MEDIUM_CHARACTERS_2, TECH_MEDIUM_CHARACTERS]
RARE_CHARACTERS_LIST = [RARE_CHARACTERS, RARE_CHARACTERS_2, TECH_RARE_CHARACTERS]


def selectRandomChineseCharacter():
    # Weighted choice based on your distribution
    which_set = 3 # Choice of set (1-indexed)
    roll = random.random()
    if roll < 0.60:
        char = random.choice(BASIC_CHARACTERS_LIST[which_set - 1])
    elif roll < 0.90:
        char = random.choice(MEDIUM_CHARACTERS_LIST[which_set - 1])
    else:
        char = random.choice(RARE_CHARACTERS_LIST[which_set - 1])
    return char

def score_chinese_word(word: str) -> int:
    """
    Calculates score based on stroke count and sequence length.
    """
    base_score = 0
    dict = Dictionary()
    
    for char in word:
        # 1. Get stroke count (using hanzipy or a helper)
        # For now, let's assume a helper that returns 2 points per stroke
        strokes = dict.get_stroke_count(char)
        base_score += strokes

    # 2. Length Multiplier
    # Rewards longer words and ChengYu specifically
    if len(word) == 4:
        return base_score * 3  # Big bonus for 4-character idioms!
    elif len(word) > 1:
        return base_score * 2  # Standard word bonus
        
    return base_score