const TOKEN_TYPE = Object.freeze({
    UNASSIGNED: -1,
    RAW: 3,
    SHORT: 2,
    LONG: 0
});

const defaultToken = {data:null, length:0, offset:0, type:TOKEN_TYPE.UNASSIGNED};

function findMatch(buffer, lowIndex, offsetIndex, length, matchMinLength, matchMaxLength) {
    let bestOffset = -1;
    let bestLength = matchMinLength;

    for(let idx = Math.max(0, lowIndex); idx < offsetIndex; idx++) {
        let matchLength = 0;
        let matchIdx = 0;
        for(;matchIdx < matchMaxLength && matchIdx < length && offsetIndex + matchIdx < length; matchIdx++) {
            if(buffer[idx + matchIdx] !== buffer[offsetIndex + matchIdx]) {
                break;
            }

            matchLength++;
        }

        if(matchLength >= bestLength) {
            bestOffset = idx;
            bestLength = matchLength;
        }
    }
    
    return {
        offset: bestOffset,
        length: bestOffset < 0 ? 0 : bestLength        
    }
}

function getTokens(buffer) {
    const SIZE = buffer.length;
    let offset = 0;

    let tokens = [];
    let token = Object.create(defaultToken);
    
    while(offset < SIZE) {
        // Long:  0LLLLLDD DDDDDDDD (length 3-34, distance 0-1023)
        // Short: 10LLDDDD (length 2-5, distance 1-16)
        // Block: 11LLLLLL (length 8-70, 1:1)
        let shortMatch = findMatch(buffer, offset - 0x10, offset, SIZE, 2, 5);
        let longMatch = findMatch(buffer, offset - 0x3FF, offset, SIZE, 3, 34);

        let useShortMatch = shortMatch.offset >= 0 && shortMatch.length > 0 && shortMatch.length >= longMatch.length;
        let useLongMatch = longMatch.offset >= 0 && longMatch.length > 0 && longMatch.length > shortMatch.length;

        if(useShortMatch === true) {
            if(token.type !== TOKEN_TYPE.UNASSIGNED) {
                tokens.push(token);
            }
            token =  Object.create(defaultToken);

            tokens.push({
                data: null,
                length: shortMatch.length,
                offset: offset - shortMatch.offset,
                type: TOKEN_TYPE.SHORT
            });

            offset += shortMatch.length;

        } else if(useLongMatch === true) {
            if(token.type !== TOKEN_TYPE.UNASSIGNED){
                tokens.push(token);
            }
            token =  Object.create(defaultToken);

            tokens.push({
                data: null,
                length: longMatch.length,
                offset: offset - longMatch.offset,
                type: TOKEN_TYPE.LONG
            });

            offset += longMatch.length;

        } else {
            if(token.type === TOKEN_TYPE.UNASSIGNED) {
                token.type = TOKEN_TYPE.RAW;
                token.data = [];
            }

            token.data.push(buffer[offset++]);

            // Maximum block length 0x46
            if(token.data.length === 70) {
                tokens.push(token);
                token =  Object.create(defaultToken);
            }
        }

        
    }

    if(token.type !== TOKEN_TYPE.UNASSIGNED)
        tokens.push(token);
    
    return tokens;
}

function writeCommandBit(writer, flag, bytes) {
    writer.control >>= 1;
    if(flag === true) 
        writer.control |= 0x80;
    
    writer.buffer.push(...bytes);

    if(--writer.bits !== 0) 
        return
    
    writer.bits = 8;
    writer.output.push(writer.control);
    writer.output.push(...writer.buffer);
    writer.buffer = [];
    writer.control = 0;
}

function encodeTokens(tokens) {
    let writer = {
        output: [],
        control: 0,
        bits: 8,
        buffer: []
    };

    tokens.forEach(token => {
        switch(token.type) {
            case TOKEN_TYPE.SHORT: {
                let length = (token.length - 2) << 4;
                let distance = token.offset - 1;
                writeCommandBit(writer, true, [0x80 | length | distance]);
                break;
            }

            case TOKEN_TYPE.LONG: {
                let length = (token.length - 3) << 10;
                let distance = token.offset;
                let composite = length | distance;
                writeCommandBit(writer, true, [composite >> 8, composite]);
                break;
            }

            case TOKEN_TYPE.RAW: {
                if(token.data.length < 8) {
                    token.data.forEach(data => {
                        writeCommandBit(writer, false, [data]);
                    });
                } else {
                    writeCommandBit(writer, true, [0xB8 + token.data.length, ...token.data]);
                }
                break;
            }

            default: {
                throw new Error("Tokenizer Error");
            }
        }
    });

    writeCommandBit(writer, true, [0xFF]);

    while(writer.bits !== 8) 
        writeCommandBit(writer, true, []);
    
    return Uint8Array.from(writer.output);
}

export function compress(source) {
    let dataview = new DataView(source.buffer);
    const CLUT_SIZE = dataview.getUint16(8,true) + 12;    
    let tokens = getTokens(source.slice(8+CLUT_SIZE));
    let encoding = encodeTokens(tokens);
    return encoding;
}