import random

# Why this specific distribution? From Gemini:
# Vowel Dominance: Vowels (A, E, I, O, U) make up nearly 42% of the pool.
# In Hanzi-Dash, vowels are essential not just for English words, but for finishing Pinyin endings (like -ao, -ian, -ui).

# The "H" Factor: I have slightly bumped the frequency of H.
# Since many Chinese characters start with Sh-, Ch-, or Zh-, a shortage of 'H' tiles can frustrate players trying to use the "English on Chinese" reuse rule.

# The Rare Letters: Q, X, and Z are kept at a count of 1.
# In English, they are "hard" letters, but in Pinyin, they are common.
# Keeping them rare ensures that using them for a Pinyin bridge feels like a high-skill, high-reward "power move."
    
# Frequency table based on English usage and common Pinyin sounds
# (A:9, B:2, C:2, D:4, E:12, etc.)
weighted_pool = (
    "A" * 9 + "B" * 2 + "C" * 2 + "D" * 4 + "E" * 12 + 
    "F" * 2 + "G" * 3 + "H" * 4 + "I" * 9 + "J" * 1 + 
    "K" * 1 + "L" * 4 + "M" * 2 + "N" * 6 + "O" * 8 + 
    "P" * 2 + "Q" * 1 + "R" * 6 + "S" * 6 + "T" * 6 + 
    "U" * 4 + "V" * 2 + "W" * 2 + "X" * 1 + "Y" * 2 + "Z" * 1
)
def selectRandomEnglishLetter() -> str:
    """
    Returns a random uppercase English letter using a weighted distribution.
    Tuned for general English play and Pinyin compatibility.
    """
    
    return random.choice(weighted_pool)

LETTER_POINTS = {
    'A': 1, 'E': 1, 'I': 1, 'O': 1, 'U': 1, 'L': 1, 'N': 1, 'R': 1, 'S': 1, 'T': 1,
    'D': 2, 'G': 2,
    'B': 3, 'C': 3, 'M': 3, 'P': 3,
    'F': 4, 'H': 4, 'V': 4, 'W': 4, 'Y': 4,
    'K': 5,
    'J': 8, 'X': 8,
    'Q': 10, 'Z': 10
}

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