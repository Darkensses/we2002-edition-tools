/**
 * MEXWE
 * https://www.facebook.com/MexWEdition
 * 
 * @author Jasiel Guillen
 * https://github.com/Darkensses
 * 
 * @author David Laborico
 * https://github.com/Laborico
 * 
 * Special thanks to SaxxonPike who reverse-engineered the code
 * from BeatMania and ported it to C#
 * Check their repos and suport them!
 * 
 * https://github.com/SaxxonPike/
 * https://github.com/SaxxonPike/scharfrichter/blob/master/Scharfrichter/Compression/BemaniLZ.cs
 */

// this LZ variant is used for compressing many types of data, it seems to be
// a Konami standard format since at least 1994 if not back furthe.

// The decompress algorithm IS in the game.
// You can decompile it using Ghidra and the ghidra_psx_ldr plugin,
// the function should be in SLPM_870.56 at line ~7408

const BUFFER_MASK = 0x3FF; // 10 bits window
const BUFFER_SIZE = 0x400;

function decompress(buffer) {
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
    
    return writer;
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

function getTIM(texFile, offBin, offClutHeader) {
    let buffer = new DataView(texFile.buffer);
    let offset_bin = buffer.getUint16(offBin,true);
    let offset_clut_header = buffer.getUint16(offClutHeader,true);

    let info_grap = [0x0C, 0x40, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x40, 0x00, 0x80, 0x00];
    let decompress_grap = decompress(texFile.slice(buffer.getUint16(offset_bin + 12, true), offset_bin)); 
    //console.log(decompress_grap)   
    
    //console.log(offset_bin - buffer.getUint16(offset_bin + 12, true)) // Size

    let tim_file = [
        ...[0x10, 0x00, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x0C, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00],
        ...texFile.slice(buffer.getUint16(offset_clut_header + 12, true), offset_clut_header),
        ...info_grap, 
        ...decompress_grap
    ];
    
    //console.log(Uint8Array.from(tim_file));
    return tim_file;
}

export function decompressTex(texFile) {
    let files = [];
    files.push({name: "1-1.tim", file:getTIM(texFile, 0, 4)});
    files.push({name: "2-1.tim", file:getTIM(texFile, 8, 12)});
    files.push({name: "1-2.tim", file:getTIM(texFile, 36, 16)});
    files.push({name: "2-2.tim", file:getTIM(texFile, 40, 20)});
    files.push({name: "flag.tim", file:getTIM(texFile, 28, 32)});

    return files;
}