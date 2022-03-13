// this LZ variant is used for compressing many types of data, it seems to be
// a Konami standard format since at least 1994 if not back furthe

const BUFFER_MASK = 0x3FF; // 10 bits window
const BUFFER_SIZE = 0x400;

export function decompress(buffer) {
    let writer = [];
    let bufferAux = new Uint8Array(BUFFER_SIZE);
    let bufferOffset = 0;
    let readerOffset = 0;
    let writerOffset = 0;
    let data = 0;
    let control = 0; // used as flags
    let distance = 0; // used as a byte-distance
    let length = 0; // used as a counter
    let loop = false;

    while(true) {
        loop = false;

        control >>= 1;
        if(control < 0x100) {
            control = buffer[readerOffset++] | 0xFF00;            
        }

        data = buffer[readerOffset++];

        // direct copy
        if((control & 1) === 0) {
            writer.push(data);
            writerOffset++;
            bufferAux[bufferOffset] = data;
            bufferOffset = (bufferOffset + 1) & BUFFER_MASK;
            continue;
        }

        // long distance
        if((data & 0x80) === 0) {
            distance = buffer[readerOffset++] | ((data & 0x3) << 8);
            length = (data >> 2) + 2;
            loop = true;
        }

        // short distance
        else if((data & 0x40) === 0) {
            distance = (data & 0xF) + 1;
            length = (data >> 4) - 7; // (data / 16) - 7
            loop = true;
        }

        // loop for jumps
        if(loop === true) {
            while(length-- >= 0) {
                data = bufferAux[(bufferOffset - distance) & BUFFER_MASK];
                writer.push(data);
                writerOffset++;
                bufferAux[bufferOffset] = data;
                bufferOffset = (bufferOffset + 1) & BUFFER_MASK;
            }
            continue;
        }

        // end of stream
        if (data === 0xFF) {
            break;
        }

        // block copy
        length = data - 0xB9;
        while(length >= 0) {
            data = buffer[readerOffset++];
            writer.push(data);
            writerOffset++;
            bufferAux[bufferOffset] = data;
            bufferOffset = (bufferOffset + 1) & BUFFER_MASK;
            length--;
        }
    }

    console.log(Uint8Array.from(writer));
}

function getHeaderClut(buffer) {
    const SIZE = buffer.length;

    for(let i = 0; i < SIZE - 16; i++) {
        if(
            (buffer[i] === 0x0A) && (buffer[i+1] === 0x00)
            (buffer[i+10] === 0x00) && (buffer[i+11] === 0x00) &&
            (buffer[i+15] === 0x80) && ((buffer[i+14] === 0x10) ||
            (buffer[i+14] === 0x11) || (buffer[i+14] === 0x12) ||
            (buffer[i+14] === 0x0C) || (buffer[i+14] === 0x0D) ||
            (buffer[i+14] === 0x0E) || (buffer[i+14] === 0x0F) ||
            (buffer[i+14] === 0x08))
        ) {
            let offset = 0;
            if(buffer[i+14] === 0x08) {
                offset = buffer[i+13] + buffer[i+12] + 5320; //0x14C8                
            }
            else if(buffer[i+14] === 0x0C) {

            }
            else if(buffer[i+14] === 0x0D) {

            }
            else if(buffer[i+14] === 0x0E) {
                
            }
        }
    }
}