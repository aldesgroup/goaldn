// ------------------------------------------------------------------------------------------------
// --- string <-> []number conversion functions
// ------------------------------------------------------------------------------------------------

const pow256 = [256 ** 0, 256 ** 1, 256 ** 2, 256 ** 3, 256 ** 4, 256 ** 5, 256 ** 6, 256 ** 7];

/**
 * This function transforms register values into a string.
 * For instance: [0, 3, 235, 122, 242, 238, 26, 65] => "1103338224360001".
 * If asHex = true: [ 176, 55 ] => "B037"
 * @param values the register values to transform
 * @param asHex returns the strings with hexadecimal values, instead of numerical ones
 * @category Modbus
 */
export function registerValuesToString(values: number[], asHex?: boolean): string {
    // the number of bytes should be even
    if (values.length % 2 === 1) {
        throw new Error('Odd number of bytes here! ' + values.toString());
    }

    // non-hexa mode
    if (!asHex) {
        const last = values.length - 1;

        // working with a long-ass number - yep, that's not a chatGPT comment here :)
        if (values.length > 6) {
            let sum = BigInt(0); // doing this cause the sum could exceed 2^53 - 1, the max JS integer
            for (let i = 0; i < values.length; i++) {
                // since the registers and the powers of (256^2) here are in opposite order:
                sum += BigInt(values[i]) * BigInt(pow256[last - i]);
            }
            return sum.toString();
        }

        // "normal" number, no need for big ints
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
            // since the registers and the powers of (256^2) here are in opposite order:
            sum += values[i] * pow256[last - i];
        }
        return sum.toString();
    }

    // hexa mode
    return values.map(value => value.toString(16).toUpperCase()).join(' ');
}

/**
 * This function transforms a number as string into register values:
 * For instance: "1103338224360001" => [0, 3, 235, 122, 242, 238, 26, 65]
 * @param numberAsString
 * @category Modbus
 */
export function stringToRegisterValues(numberAsString: string): number[] {
    const registers = [];

    // working with a big number
    if (numberAsString.length >= 14) {
        const base = 256n; // Base of the register (8 bits), as BigInt
        let number = BigInt(numberAsString);
        while (number > 0n) {
            // Get the remainder (current register value)
            const remainder = number % base;
            // Add to the beginning of the array - as a Number
            registers.unshift(Number(remainder));
            // Update the number by removing the processed part
            number = number / base;
        }
    } else {
        // almost the same, but with a not-as-big number
        let number = parseFloat(numberAsString);
        while (number > 0) {
            const remainder = Math.floor(number % 256);
            registers.unshift(remainder);
            number = Math.floor(number / 256);
        }
    }

    // making sure we have an even number of register values
    if (registers.length % 2 == 1) {
        registers.unshift(0);
    }

    return registers;
}
