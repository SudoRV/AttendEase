export function scopes(attr, val) {
    const scope = {
        "notification_type": {
            "class_cancellation": 1,
            "class_cancelled": 1,
            "class_substitution": 2,
            "announcement": 3
        },
        "branch": {
            "CSE": 1,
            "AI": 2,
            "RA": 3,
            "ME": 4,
            "CE": 5,
            "BCA": 6,
            "all": 7,
        },
        "year": {
            "1": 1,
            "2": 2,
            "3": 3,
            "4": 4,
            "5": 5,
            "all": 6,
        },
        "section": {
            "A": 1,
            "B": 2,
            "C": 3,
            "D": 4,
            "E": 5,
            "F": 6,
            "G": 7,
            "H": 8,
            "I": 9,
            "J": 10,
            "K": 11,
            "L": 12,
            "M": 13,
            "N": 14,
            "all": 15,
        },
        "day": {
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6,
            "Sunday": 7,
        }
    }

    return scope[attr][val];
}

export function decToHex(decimal) {
    // 1. Convert number to hex string base 16
    return decimal.toString(16);
}

export function hexToDec(hex) {
    return parseInt(hex, 16);
}