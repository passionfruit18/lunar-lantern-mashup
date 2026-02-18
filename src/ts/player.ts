import { LanguageType } from "./board";

export interface ScoreData {
    english_words: string[];
    chinese_words: string[];
    synergy_score: number;
    synergy_explanation: string;
    multiplier: number;
    final_score: number;
    move_language: LanguageType;
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

export const printAllPlayerDetailsPretty = (player: PlayerData): string => {

    // 1. Create a shallow copy so we don't mutate the actual player data
    const displayData = { ...player };

    // 2. Pre-format the hand arrays into strings so JSON.stringify treats them as single lines
    // This turns ["A", "B", "C"] into "[A, B, C]"
    (displayData.hand as any) = {
        chinese: `[ ${displayData.hand.chinese.join(", ")} ]`,
        english: `[ ${displayData.hand.english.join(", ")} ]`
    };

    // 3. 
    return `<div class="player-card">
            <h3>Username: ${displayData.username}</h3>
            <dl>
                <dt>Score</dt>
                <dd>${displayData.total_score}</dd>
                <dt>English Hand</dt>
                <dd>${displayData.hand.english}</dd>
                <dt>Chinese Hand</dt>
                <dd>${displayData.hand.chinese}</dd>
                <dt>Score History</dt>
                <dd>${displayData.score_history.map(score => prettyPrintScore(score)).join("<hr/>")}</dd>
            </dl>
        </div>`
};

function prettyPrintScore(data: ScoreData): string {
    const english = data.english_words.length > 0 ? data.english_words.join(', ') : 'None';
    const chinese = data.chinese_words.length > 0 ? data.chinese_words.join(', ') : 'None';

    // Calculate "Pizzazz" levels
    const synergy_score = data.synergy_score;
    let auraStyle = "";
    
    if (synergy_score >= 7) {
        // Increases intensity from 7.0 to 10.0
        const intensity = (synergy_score - 6) * 4; 
        const opacity = Math.min((synergy_score - 6) * 0.2, 0.8);
        auraStyle = `
            border: ${synergy_score/4}px solid rgba(168, 85, 247, ${opacity});
            box-shadow: 0 0 ${intensity}px rgba(168, 85, 247, ${opacity / 2});
            background: linear-gradient(to right, rgba(168, 85, 247, 0.05), transparent);
        `;
    }

    return `
        <div class="score-entry" style="${auraStyle}">
            <div class="score-header">
                <strong>Turn Score: ${data.final_score}</strong> 
                <small>(x${data.multiplier} Multiplier) [Language: ${data.move_language}]</small>
            </div>
            <div class="words-found">
                <div>🔤 English Words: <em>${english}</em></div>
                <div>🏮 Chinese Words: <em>${chinese}</em></div>
            </div>
            <div class="synergy-box">
                <strong>Synergy (+${data.synergy_score}):</strong> ${data.synergy_explanation}
            </div>
        </div>
    `;
}