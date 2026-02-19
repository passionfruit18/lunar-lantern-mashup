# 🏮 Lunar Lantern Mashup: a Lexical Logical Melee (LLM) 🏮
## A Bilingual Synergy Game powered by Gemini 2.5 Flash.

LLM is a competitive multiplayer game that challenges players to find poetic and logical connections between English and Chinese characters. It utilizes Large Language Models to provide real-time, nuanced scoring and semantic analysis.

---

### Rules

1. Players get infinite access to Chinese radicals. They get 10 basic Chinese characters and 10 English letters, replenished when used each turn.

2. In a turn, a player can:

    2a-i. Compose a Chinese character, a two-character word,
    or a 4-character ChengYu using the radicals and basic Chinese characters. Scored accordingly.

    2a-ii. Chinese-Chinese reuse:
    Can use a character from another player's Chinese character sequence
    (horizontal or vertical) to start another sequence
    (vertical or horizontal respectively).

    2a-iii. English as Chinese reuse:
    If English sequence forms a Pinyin of a Chinese character,
    the player may re-use that English sequence (from the end of the sequence)
    (whether perpendicularly or in sequence)
    as that Chinese character if they specify what that character is.

    2b-i. Compose an English word..

    2b-ii. English-English reuse.

    2b-iii. Chinese as English reuse:
    The first letter of the pinyin of the Chinese word
    or any of its radicals can be re-used as an English letter.

    2c: Chinese-English dual synergy: If a Chinese word or English word is placed next to the counterpart. The relationship between the words is rated out of 10 and EXPLAINED by an LLM (this is educational). The output of the explanation goes in the game log which can be reviewed. (Uses AI! Hooray!) Multiplier of basic score is (1 + 2 * (score/10))

---

### Basic Scoring
```
LETTER_POINTS = {
    'A': 1, 'E': 1, 'I': 1, 'O': 1, 'U': 1, 'L': 1, 'N': 1, 'R': 1, 'S': 1, 'T': 1,
    'D': 2, 'G': 2,
    'B': 3, 'C': 3, 'M': 3, 'P': 3,
    'F': 4, 'H': 4, 'V': 4, 'W': 4, 'Y': 4,
    'K': 5,
    'J': 8, 'X': 8,
    'Q': 10, 'Z': 10
}
```
```
def score_english_word(word: str) -> int:
    """
    Calculates the base point value of an English word.
    Includes a length bonus for words longer than 4 letters.
    """
    if not word:
        return 0
        
    # 1. Sum the individual letter values
    # We use .upper() to ensure it matches our dictionary keys
    base_sum = sum(LETTER_POINTS.get(char.upper(), 0) for char in word)
    
    # 2. Apply a Length Bonus
    # 5 letters: +2 points, 6 letters: +4 points, 7+ letters: +10 points (Bingo!)
    length = len(word)
    bonus = 0
    if length == 5:
        bonus = 2
    elif length == 6:
        bonus = 4
    elif length >= 7:
        bonus = 10
        
    return base_sum + bonus

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