
export enum SquareType {
    NORMAL = "NORMAL",
    SPECIAL_TRANSLATION = "SPECIAL_TRANSLATION",
    DOUBLE_POINT = "DOUBLE_POINT",
    TRIPLE_POINT = "TRIPLE_POINT"
}

export interface TileData {
    type: LanguageType;
    display: string;
    components?: string[];
    points?: number;
}

export interface SquareData {
    square_type: SquareType;
    tile: TileData | null;
}

export const printAllSquareDetails = (square: SquareData): string => {
    return JSON.stringify(square, null, 2);
};

export enum LanguageType {
    ENGLISH = "ENGLISH",
    CHINESE = "CHINESE"
}

export const simplePrintSquare = (square: SquareData): string => {
    if (square.tile) {
        switch (square.tile.type) {
            case LanguageType.ENGLISH:
                return square.tile.display;
                // logic for English scoring/validation
                break;
            
            case LanguageType.CHINESE:
                return square.tile.display;
                // logic for Radical/Character composition
                break;
    
            default:
                const _exhaustiveCheck: never = square.tile.type;
                throw new Error(`Unknown language type: ${square.tile.type}`);
        }
    }
    else {
        return ""
    }
};

export type Board = SquareData[][];