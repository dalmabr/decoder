export function hexToBits(hex) {
    const bits = [];
    for (let i = 0; i < hex.length; i += 2) {
        bits.push(
            ...parseInt(hex.substr(i, 2), 16)
                .toString(2)
                .padStart(8, '0')
                .split('')
        );
    }
    return bits;
}
