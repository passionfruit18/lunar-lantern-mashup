# 2026_02_17_Hanzi_Dash: Chinese + English Scrabble

Run pip install -r requirements.txt

Run npm install

Run npm run dev (maybe in a separate terminal tab) to build the game engine. Compiling Transcript to Javascript.

Run python app.py to run!

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

    2b-i. Compose an English word as in normal Scrabble.

    2b-ii. English-English reuse: as in normal Scrabble.

    2b-iii. Chinese as English reuse:
    The first letter of the pinyin of the Chinese word
    or any of its radicals can be re-used as an English letter.


2c: Chinese-English dual synergy: If a Chinese word or English word is placed next to the counterpart. The relationship between the words is rated out of 10 and EXPLAINED by an LLM (this is educational). The output of the explanation goes in the game log which can be reviewed. (Uses AI! Hooray!) Multiplier of basic score is (1 + 2 * (score/10))