import random

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

def selectRandomChineseCharacter():
    # Weighted choice based on your distribution
    roll = random.random()
    if roll < 0.60:
        char = random.choice(BASIC_CHARACTERS)
    elif roll < 0.90:
        char = random.choice(MEDIUM_CHARACTERS)
    else:
        char = random.choice(RARE_CHARACTERS)
    return char