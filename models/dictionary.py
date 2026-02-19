import re
from typing import List
from .tiles import LanguageType
from .moves import PendingMove
import nltk
from hanzipy.dictionary import HanziDictionary

nltk.download('words')

class Dictionary:

    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            print("--- Loading Dictionary into Memory (Singleton) ---")
            cls._instance = super(Dictionary, cls).__new__(cls)
        return cls._instance

    def _load_data(self):
        
        try:
            nltk.data.find('corpora/words')
        except LookupError:
            print("--- NLTK Words not found. Downloading now... ---")
            nltk.download('words')

        from nltk.corpus import words

        self.english_words.update(set(w.lower() for w in words.words()))
        self.hanzi_dict = HanziDictionary()
        print(f"--- Dictionary Loaded: {len(self.english_words)} EN words, ?? Chinese ---")

    def __init__(self):
        if hasattr(self, '_initialized') and self._initialized:
            return
        
        print("--- Loading Dictionary (Once Only) ---")
        self.english_words = set()
        self.chinese_words = set()
        self.chengyu = set()
        self._load_data()
        
        # Mark as initialized
        self._initialized = True


    def validate_sequence(self, sequence: List[PendingMove]) -> bool:
        """
        Takes a full sequence (Pending + Existing tiles) 
        and validates it based on its language type.
        """
        if not sequence:
            return False

        # 1. Join the values into a single string
        word_str = "".join([m.value for m in sequence])
        lang = sequence[0].type

        # 2. Route to the correct validator
        if lang == LanguageType.ENGLISH:
            return self.is_english_word(word_str)
        elif lang == LanguageType.CHINESE:
            return self.is_chinese_valid(word_str)
        else:
            raise ValueError(f"Unsupported language type: {lang}")
        
        return False

    def is_english_word(self, word: str) -> bool:
        return word.lower() in self.english_words

    def is_chinese_valid(self, word: str) -> bool:
        """
        Checks if the string exists as a valid entry in CC-CEDICT.
        This automatically covers single characters, words, and ChengYu.
        """
        try:
            # definition_lookup returns a list of definitions if found, else None
            result = self.hanzi_dict.definition_lookup(word)
            return result is not None and len(result) > 0
        except KeyError:
            # If hanzipy doesn't know the word, it's just not a valid word!
            return False
    

    def validate_moves(self, all_formed_sequences: List[List[PendingMove]]) -> bool:
        if (not all_formed_sequences or not all_formed_sequences[0]):
            # Catches [] and [[]] and [[], ...]
            return False, "Your move doesn't form any words!"
        
        for seq in all_formed_sequences:
            if not self.validate_sequence(seq):
                word_str = "".join([m.value for m in seq])
                return False, f"'{word_str}' is not a valid word!"
                
        return True, "Valid Move!"
    
    def get_stroke_count(self, char: str) -> int:
        # TODO: Not sure if this is actually working, it seems to always return 5
        try:
            # hanzipy decomposition often includes stroke metadata
            data = self.hanzi_dict.get_character_in_section(char)
            # Fallback to a default if metadata is missing
            return data.get('stroke_count', 5)
        except:
            return 5 # Average stroke count fallback