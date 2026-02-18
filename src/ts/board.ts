
export enum SquareType {
    NORMAL = "NORMAL",
    SPECIAL_TRANSLATION = "SPECIAL_TRANSLATION",
    DOUBLE_POINT = "DOUBLE_POINT",
    TRIPLE_POINT = "TRIPLE_POINT"
}

export interface TileData {
    type: 'english' | 'chinese';
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

export const simplePrintSquare = (square: SquareData): string => {
    if (square.tile) {
        // TODO: this should be a switch statement on an Enum
        if (square.tile.type == "english") {
            return square.tile.display;
        }
        else {
            return square.tile.display;
        }
    }
    else {
        return ""
    }
};

export type Board = SquareData[][];