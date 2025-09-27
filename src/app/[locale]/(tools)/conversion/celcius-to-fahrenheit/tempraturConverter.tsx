export function convertTemp(mode: "CF" | "FC", input: number): number {
    let newTemp: number;
    if (mode == 'CF') {
        newTemp = CF(input);
    } else {
        newTemp = FC(input);
    }
    return newTemp;
}

export function CF(input: number): number {
    return input * 1.8 + 32
}

export function FC(input: number): number {
    return (input - 32) / 1.8
}

