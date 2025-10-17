import {Buffer} from 'buffer';

// ----------------------------------------------------------------------------
// Utils
// ----------------------------------------------------------------------------

// MODBUS Exception codes
export const MODBUS_EXCEPTIONS: {[key: number]: string} = {
    0x01: 'Illegal Function',
    0x02: 'Illegal Data Address',
    0x03: 'Illegal Data Value',
    0x04: 'Slave Device Failure',
    0x05: 'Acknowledge',
    0x06: 'Slave Device Busy',
    0x08: 'Memory Parity Error',
    0x0a: 'Gateway Path Unavailable',
    0x0b: 'Gateway Target Device Failed to Respond',
};

export const MODBUS_FUNCTIONS = {
    // READ_COILS: 0x01,
    // READ_DISCRETE_INPUTS: 0x02,
    READ_HOLDING_REGISTERS: 0x03,
    // READ_INPUT_REGISTERS: 0x04,
    // WRITE_SINGLE_COIL: 0x05,
    // WRITE_SINGLE_REGISTER: 0x06,
    // WRITE_MULTIPLE_COILS: 0x0f,
    WRITE_MULTIPLE_REGISTERS: 0x10,
};

// Placeholder types for request/response
export type ModbusRequest = {
    slaveId: number;
    functionCode: number;
    startAddress: number;
    quantity?: number;
    value?: number | boolean;
    timeout?: number;
};

export type ModbusResponse = {
    slaveId: number;
    functionCode: number;
    dataLength?: number;
    rawData?: Buffer;
    stringData?: string;
    address?: number;
    rawValue?: number;
    startAddress?: number;
    quantity?: number;
    success: boolean;
};

export type ExpectedResponse = {
    slaveId?: number;
    functionCode?: number;
    address?: number;
    startAddress?: number;
    rawValue?: number | boolean;
    quantity?: number;
};

function calculateCRC16(buffer: Buffer): number {
    let crc = 0xffff;
    for (let i = 0; i < buffer.length; i++) {
        crc ^= buffer[i];
        for (let j = 0; j < 8; j++) {
            if (crc & 0x0001) {
                crc = (crc >> 1) ^ 0xa001;
            } else {
                crc = crc >> 1;
            }
        }
    }
    return crc;
}

// ----------------------------------------------------------------------------
// Requests
// ----------------------------------------------------------------------------

export function createModbusReadingFrame(slaveId: number, startAddress: number, quantity: number): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt8(slaveId, 0);
    buffer.writeUInt8(MODBUS_FUNCTIONS.READ_HOLDING_REGISTERS, 1);
    buffer.writeUInt16BE(startAddress, 2);
    buffer.writeUInt16BE(quantity, 4);
    const crc = calculateCRC16(buffer.slice(0, 6));
    buffer.writeUInt16LE(crc, 6);
    return buffer;
}

export function createModbusWritingFrame8bit(slaveId: number, startAddress: number, quantity: number, values: number[]): Buffer {
    const byteCount = values.length;
    const buffer = Buffer.alloc(7 + byteCount);

    buffer.writeUInt8(slaveId, 0);
    buffer.writeUInt8(MODBUS_FUNCTIONS.WRITE_MULTIPLE_REGISTERS, 1);
    buffer.writeUInt16BE(startAddress, 2);
    buffer.writeUInt16BE(quantity, 4);
    buffer.writeUInt8(byteCount, 6);

    for (let i = 0; i < values.length; i++) {
        buffer.writeUInt8(values[i], 7 + i);
    }

    const crc = calculateCRC16(buffer.slice(0, 7 + byteCount));
    const frameWithCRC = Buffer.concat([buffer, Buffer.alloc(2)]);
    frameWithCRC.writeUInt16LE(crc, 7 + byteCount);

    return frameWithCRC;
}

// ----------------------------------------------------------------------------
// Responses
// ----------------------------------------------------------------------------

export function parseModbusResponse(response: Buffer, expectedResponse: ExpectedResponse | null = null, asHex?: boolean): ModbusResponse {
    const buffer = Buffer.from(response);

    if (buffer.length < 5) {
        throw new Error('Response too short');
    }

    const slaveId = buffer[0];
    const functionCode = buffer[1];

    // Check for exception response
    if (functionCode & 0x80) {
        const originalFunction = functionCode & 0x7f;
        const exceptionCode = buffer[2];
        const exceptionMessage = MODBUS_EXCEPTIONS[exceptionCode] || `Unknown exception (${exceptionCode})`;

        throw new Error(
            `MODBUS Exception: ${exceptionMessage} (Function: ${originalFunction.toString(16)}, Exception: ${exceptionCode.toString(16)})`,
        );
    }

    // Verify CRC
    const receivedCRC = buffer.readUInt16LE(buffer.length - 2);
    const frameWithoutCRC = buffer.slice(0, buffer.length - 2);
    const calculatedCRC = calculateCRC16(frameWithoutCRC);

    if (receivedCRC !== calculatedCRC) {
        throw new Error('CRC mismatch - corrupted response');
    }

    // Parse based on function code
    switch (functionCode) {
        case MODBUS_FUNCTIONS.READ_HOLDING_REGISTERS:
            return parseReadRegistersResponse(buffer, asHex);

        case MODBUS_FUNCTIONS.WRITE_MULTIPLE_REGISTERS:
            return parseWriteMultipleResponse(buffer, expectedResponse);

        default:
            throw new Error(`Unsupported function code: ${functionCode}`);
    }
}

export function parseReadRegistersResponse(buffer: Buffer, asHex?: boolean): ModbusResponse {
    const slaveId = buffer[0];
    const functionCode = buffer[1];
    const dataLength = buffer[2];
    const rawData = buffer.slice(3, 3 + dataLength);

    return {
        slaveId,
        functionCode,
        dataLength,
        rawData,
        success: true,
    };
}

export function parseWriteMultipleResponse(buffer: Buffer, expectedResponse: ExpectedResponse | null): ModbusResponse {
    const slaveId = buffer[0];
    const functionCode = buffer[1];
    const startAddress = buffer.readUInt16BE(2);
    const quantity = buffer.readUInt16BE(4);

    // For write multiple, success means the response confirms the write
    const success =
        expectedResponse &&
        slaveId === expectedResponse.slaveId &&
        functionCode === expectedResponse.functionCode &&
        startAddress === expectedResponse.startAddress &&
        quantity === expectedResponse.quantity;

    if (!success && expectedResponse) {
        throw new Error('Write confirmation mismatch - request not properly executed');
    }

    return {
        slaveId,
        functionCode,
        startAddress,
        quantity,
        success: true,
    };
}
