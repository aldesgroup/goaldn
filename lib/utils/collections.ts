// TODO put into caroTS, like the fields.ts file and others..
export function findKeyForValueInMap<VAL extends string | number | boolean>(value: VAL, map: Record<string, VAL>, defModbusValue: string) {
    for (const key in map) {
        if (map[key] === value) {
            return key;
        }
    }
    return defModbusValue;
}
