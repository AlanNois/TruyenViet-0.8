/**
 * DRM Decryption module for CuuTruyen
 * Based on the Kotlin implementation from CuuTruyenImageInterceptor
 */

import { RawData } from '@paperback/types';

const DECRYPTION_KEY = '3141592653589793';

/**
 * Base64 decode utility
 */
function base64Decode(base64String: string): Uint8Array {
    // Remove any whitespace and newlines
    const cleanBase64 = base64String.replace(/[\n\r\s]/g, '');

    // Use Buffer for Node.js environment, atob for browser
    if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
        return Buffer.from(cleanBase64, 'base64');
    } else if (typeof atob !== 'undefined') {
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } else {
        throw new Error('Base64 decoding not supported in this environment.');
    }
}

/**
 * Encodes a string into a Uint8Array (UTF-8 equivalent for basic ASCII)
 */
function encodeString(text: string): Uint8Array {
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
        bytes[i] = text.charCodeAt(i);
    }
    return bytes;
}

/**
 * Decodes a Uint8Array into a string (UTF-8 equivalent for basic ASCII)
 */
function decodeString(bytes: Uint8Array): string {
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
        result += String.fromCharCode(bytes[i]!);
    }
    return result;
}

/**
 * XOR cipher decryption
 */
function decodeXorCipher(data: Uint8Array, key: string): Uint8Array {
    const keyBytes = encodeString(key);
    const result = new Uint8Array(data.length);

    for (let i = 0; i < data.length; i++) {
        result[i] = data[i]! ^ keyBytes[i % keyBytes.length]!;
    }

    return result;
}

/**
 * Main unscrambling function
 */
export async function unscrambleImage(imageBytes: RawData, drmData: string): Promise<RawData> {
    // Decode the DRM data
    const drmBytes = base64Decode(drmData);
    const decryptedBytes = decodeXorCipher(drmBytes, DECRYPTION_KEY);
    const drmString = decodeString(decryptedBytes);

    // console.log(`DRM String: ${drmString}`);

    // Validate DRM data format
    if (!drmString.startsWith('#v4|')) {
        throw new Error(`Invalid DRM data (does not start with expected magic bytes): ${drmString}`);
    }

    // Load the scrambled image into a PBImage
    const originalImage = App.createPBImage({ data: imageBytes });
    // console.log('OK')
    // Create result canvas
    const resultCanvas = App.createPBCanvas();
    resultCanvas.setSize(originalImage.width, originalImage.height);

    // Parse scrambling instructions and unscramble
    const instructions = drmString.split('|').slice(1); // Skip the '#v4' part
    let sourceY = 0;

    for (const instruction of instructions) {
        if (!instruction.trim()) continue;

        const parts = instruction.split('-');
        if (parts.length !== 2) {
            console.warn(`Invalid instruction format: ${instruction}`);
            continue;
        }

        const destY = parseInt(parts[0]!.trim(), 10);
        const height = parseInt(parts[1]!.trim(), 10);

        if (isNaN(destY) || isNaN(height)) {
            console.warn(`Invalid instruction values: ${instruction}`);
            continue;
        }

        // Draw the section from source position to destination position
        resultCanvas.drawImage(
            originalImage,
            0, sourceY, originalImage.width, height!,  // source rect
            0, destY!                                   // dest rect
        );

        sourceY += height!;
    }

    return resultCanvas.encode('image/jpeg')!;
}