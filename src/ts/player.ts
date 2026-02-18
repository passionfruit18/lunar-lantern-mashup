export interface ScoreData {
    english_words: string[];
    chinese_words: string[];
    synergy_score: number;
    synergy_explanation: string;
    multiplier: number;
    final_score: number;
}

export interface PlayerData {
    username: string;
    hand: {
        chinese: string[];
        english: string[];
    };
    score_history: ScoreData[];
    total_score: number;
}

export const printAllPlayerDetails = (player: PlayerData): string => {

    // 1. Create a shallow copy so we don't mutate the actual player data
    const displayData = { ...player };

    // 2. Pre-format the hand arrays into strings so JSON.stringify treats them as single lines
    // This turns ["A", "B", "C"] into "[A, B, C]"
    (displayData.hand as any) = {
        chinese: `[ ${displayData.hand.chinese.join(", ")} ]`,
        english: `[ ${displayData.hand.english.join(", ")} ]`
    };

    // 3. Stringify the result. The hand strings will now stay on one line!
    return JSON.stringify(displayData, null, 2);
};