"""
type PendingMove = {
    row: number,
    col: number,
    type: BoardModule.LanguageType,
    value: string }
"""
def is_straight_line(moves):
    if len(moves) < 2: return True
    rows = [m['row'] for m in moves]
    cols = [m['col'] for m in moves]
    return len(set(rows)) == 1 or len(set(cols)) == 1