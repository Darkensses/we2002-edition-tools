// DON'T FORGET TO ADD THIS IF YOU'RE USING CODE FROM HERE:
// Author: MexWE
// Dev: Jasiel Guillen

const SEPARATOR = 0x800F // hexeditor: 0F 80
const MAIN_HEADER_SIZE = 48; // The Main Header sized 48 bytes length.
const FILE_HEADER_SIZE = 32; // This header is for files (i.e *.bin, *.tim) and contains the offset where the data starts.
const CLUT_FILE_SIZE = 512;

let buffer = new ArrayBuffer(MAIN_HEADER_SIZE)
let header = new DataView(buffer);

function calculateMainHeader(files) {
    // BYTE [00,01]: 48 BYTES + LOCAL_BIN Length
    header.setUint16(0,MAIN_HEADER_SIZE + files.LOCAL_BIN.length, true); // set true for little endianess

    // WRITE SEPARATOR [02,03]
    header.setUint16(2,SEPARATOR,true);

    // BYTE [04,05]:
    // It takes you to the LOCAL_CLUT's file offset
    header.setUint16(
      4,
      MAIN_HEADER_SIZE +
      files.LOCAL_BIN.length +
      FILE_HEADER_SIZE +
      files.SLEVES_LOCAL_BIN.length +
      FILE_HEADER_SIZE +
      files.LOCAL_CLUT.length, // or CLUT_FILE_SIZE.
      true
    );

    // WRITE SEPARATOR [06,07]
    header.setUint16(6,SEPARATOR,true);

    // BYTE [08,09]:
    // It takes you to the AWAY_BIN's file offset
    // MAIN_HEADER_SIZE + LOCAL_BIN + FILE_HEADER_SIZE + SLEVES_LOCAL_BIN + FILE_HEADER_SIZE + (LOCAL_CLUT - 20) + FILE_HEADER_SIZE + (LOCAL_CLUT - 20) + FILE_HEADER_SIZE + AWAY_BIN
    // MAIN_HEADER_SIZE + (4 * FILE_HEADER_SIZE) + LOCAL_BIN + SLEVES_LOCAL_BIN + AWAY_BIN + 2 * (LOCAL_CLUT - 20)
    header.setUint16(
        8,
        MAIN_HEADER_SIZE +
        (FILE_HEADER_SIZE * 4) + // 4 header files: LOCAL_BIN, SLEVES_LOCAL_BIN, LOCAL_CLUT, LOCAL_CLUT again.
        files.LOCAL_BIN.length +
        files.SLEVES_LOCAL_BIN.length +
        2 * files.LOCAL_CLUT.length +
        files.AWAY_BIN.length,
        true
    );

    // WRITE SEPARATOR [10,11]
    header.setUint16(10,SEPARATOR,true);

    // BYTE [12, 13]:
    // It takes you to the first AWAY_CLUT's header file offset
    header.setUint16(
        12,
        MAIN_HEADER_SIZE + 
        files.LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.SLEVES_LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.AWAY_BIN.length + 
        FILE_HEADER_SIZE +
        files.SLEVES_AWAY_BIN.length +
        FILE_HEADER_SIZE +
        files.AWAY_CLUT.length,
        true
    );

    // WRITE SEPARATOR [14,15]
    header.setUint16(14,SEPARATOR,true);

    // BYTE [16,17]:
    // It takes you to the second LOCAL_CLUT's header file offset
    header.setUint16(
        16,
        MAIN_HEADER_SIZE +
        files.LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.SLEVES_LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length,
        true
    );

    // WRITE SEPARATOR [18,19]
    header.setUint16(18,SEPARATOR,true);

    // BYTE [20,21]:
    // It takes you to the second AWAY_CLUT's header file offset
    header.setUint16(
        20,
        MAIN_HEADER_SIZE + 
        files.LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.SLEVES_LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.AWAY_BIN.length + 
        FILE_HEADER_SIZE +
        files.SLEVES_AWAY_BIN.length +
        FILE_HEADER_SIZE +
        files.AWAY_CLUT.length +
        FILE_HEADER_SIZE +
        files.AWAY_CLUT.length,
        true
    );

    // WRITE SEPARATOR [22,23]
    header.setUint16(22,SEPARATOR,true);
    // WRITE SEPARATOR 00 00 [24,25]
    header.setUint16(24,0,true);
    // WRITE SEPARATOR 00 00 [26,27]
    header.setUint16(26,0,true);

    // BYTE [28,29]:
    // It takes you to the FLAG_BIN's header file offset
    header.setUint16(
        28,
        MAIN_HEADER_SIZE + 
        files.LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.SLEVES_LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.AWAY_BIN.length + 
        FILE_HEADER_SIZE +
        files.SLEVES_AWAY_BIN.length +
        FILE_HEADER_SIZE +
        files.AWAY_CLUT.length +
        FILE_HEADER_SIZE +
        files.AWAY_CLUT.length +
        FILE_HEADER_SIZE +
        files.FLAG_BIN.length,
        true
    );

    // WRITE SEPARATOR [30,31]
    header.setUint16(30,SEPARATOR,true);

    // BYTE [32,33]:
    // It takes you to the FLAG_CLUT's header file offset
    header.setUint16(
        32,
        MAIN_HEADER_SIZE + 
        files.LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.SLEVES_LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.AWAY_BIN.length + 
        FILE_HEADER_SIZE +
        files.SLEVES_AWAY_BIN.length +
        FILE_HEADER_SIZE +
        files.AWAY_CLUT.length +
        FILE_HEADER_SIZE +
        files.AWAY_CLUT.length +
        FILE_HEADER_SIZE +
        files.FLAG_BIN.length +
        FILE_HEADER_SIZE +
        files.FLAG_CLUT.length,
        true
    );

    // WRITE SEPARATOR [34,35]
    header.setUint16(34,SEPARATOR,true);

    // BYTE [36,37]:
    // It takes you to the SLEVES_LOCAL_BIN's header file offset
    header.setUint16(
        36,
        MAIN_HEADER_SIZE +
        files.LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.SLEVES_LOCAL_BIN.length,
        true
    );

    // WRITE SEPARATOR [38,39]
    header.setUint16(38,SEPARATOR,true);

    // BYTE [40,41]:
    // It takes you to the SLEVES_AWAY_BIN's header file offset
    header.setUint16(
        40,
        MAIN_HEADER_SIZE + 
        files.LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.SLEVES_LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.AWAY_BIN.length + 
        FILE_HEADER_SIZE +
        files.SLEVES_AWAY_BIN.length,
        true
    );

    // WRITE SEPARATOR [42,43]
    header.setUint16(42,SEPARATOR,true);

    // BYTE [44,45]:
    // It takes you to the REFEREE_BIN's header file offset
    header.setUint16(
        44,
        MAIN_HEADER_SIZE + 
        files.LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.SLEVES_LOCAL_BIN.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.LOCAL_CLUT.length +
        FILE_HEADER_SIZE +
        files.AWAY_BIN.length + 
        FILE_HEADER_SIZE +
        files.SLEVES_AWAY_BIN.length +
        FILE_HEADER_SIZE +
        files.AWAY_CLUT.length +
        FILE_HEADER_SIZE +
        files.AWAY_CLUT.length +
        FILE_HEADER_SIZE +
        files.FLAG_BIN.length +
        FILE_HEADER_SIZE +
        files.FLAG_CLUT.length +
        FILE_HEADER_SIZE +
        files.REFEREE_BIN.length,
        true
    );

    // WRITE SEPARATOR [46,47]
    header.setUint16(46,SEPARATOR,true);

    console.log(new Uint8Array(header.buffer));
    return header;
}

export function createTex(files) {

    // Create or copy the files to normalize the CLUT files.
    let files_normalized = Object.create(files);
    // The first 20 bytes are the TIM file header and it's not necessary.
    // So, let's take 512 (CLUT_FILE_SIZE) the bytes from the offset 20.
    // That's because the .BIN files are the 'Image Data' compressed from the TIM file.
    files_normalized.LOCAL_CLUT = files.LOCAL_CLUT.slice(20, CLUT_FILE_SIZE);
    files_normalized.AWAY_CLUT = files.AWAY_CLUT.slice(20, CLUT_FILE_SIZE);
    files_normalized.FLAG_CLUT = files.FLAG_CLUT.slice(20, CLUT_FILE_SIZE);

    // Bytes [12,13] contain the offset position. Value 0x66 ONLY FOR REFERENCE!
    // Bytes [14,15] are the separator in all the headers.
    let header_TEX_BIN        = [0x0A, 0x00, 0x40, 0x02, 0x00, 0x01, 0x40, 0x00, 0x80, 0x00, 0x00, 0x00, 0x66, 0x66, 0x0F, 0x80];    
    let header_SLEVES_TEX_BIN = [0x0A, 0x00, 0x40, 0x02, 0x80, 0x01, 0x40, 0x00, 0x80, 0x00, 0x00, 0x00, 0x66, 0x66, 0x0F, 0x80];
    let header_TEX_CLUT_1     = [0x09, 0xFF, 0x00, 0x00, 0xE6, 0x01, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x66, 0x66, 0x0F, 0x80];
    let header_TEX_CLUT_2     = [0x09, 0xFF, 0x00, 0x00, 0xE8, 0x01, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x66, 0x66, 0x0F, 0x80];

    let header_FLAG_BIN       = [0x0A, 0x00, 0xC0, 0x02, 0x00, 0x01, 0x40, 0x00, 0x40, 0x00, 0x00, 0x00, 0x66, 0x66, 0x0F, 0x80];
    let header_FLAG_CLUT      = [0x09, 0xFF, 0x00, 0x01, 0xE0, 0x01, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x66, 0x66, 0x0F, 0x80];
    let header_REFEREE_BIN    = [0x0A, 0x00, 0x00, 0x03, 0x80, 0x01, 0x40, 0x00, 0x80, 0x00, 0x00, 0x00, 0x66, 0x66, 0x0F, 0x80];

    let header_SEPARATOR = Array(16).fill(0);
    header_SEPARATOR[0] = 0xFF;

    
    let mainHeader = calculateMainHeader(files_normalized);

    let offset_bytes = new Uint16Array(1);
    let offset_position = new DataView(offset_bytes.buffer);     
    // Now, We finally can create the TEX
    let tex = [];

    // 1. MAIN HEADER
    tex.push(...Array.from(new Uint8Array(mainHeader.buffer)));    

    // 2. LOCAL TEX BIN, 3. HEADER LOCAL TEX BIN, 4. HEADER SEPARATOR
    // You also can modify the offset position in this way:
    // let header_TEX_BIN        = [0x0A, 0x00, 0x40, 0x02, 0x00, 0x01, 0x40, 0x00, 0x80, 0x00, 0x00, 0x00, ...new Uint8Array(offset_position.buffer), 0x0F, 0x80];
    // We're going to use the following one to keep things simple:
    offset_position.setUint16(0,mainHeader.getUint16(0, true) - files.LOCAL_BIN.length, true);   
    header_TEX_BIN.splice(12,2,...new Uint8Array(offset_position.buffer));
    // Push the file, header and the header separator to the tex array,
    // You can spread the arrays:
    tex.push(...[...files.LOCAL_BIN,...header_TEX_BIN,...header_SEPARATOR]);
    // Or you can push one by one each array:
    //tex.push(...header_TEX_BIN);
    //tex.push(...header_SEPARATOR);

    // 5. SLEVES LOCAL TEX BIN, 6. HEADER SLEVES LOCAL TEX BIN, 7. HEADER SEPARATOR
    offset_position.setUint16(0,mainHeader.getUint16(36, true) - files.SLEVES_LOCAL_BIN.length, true); 
    header_SLEVES_TEX_BIN.splice(12,2,...new Uint8Array(offset_position.buffer));
    tex.push(...[...files.SLEVES_LOCAL_BIN,...header_SLEVES_TEX_BIN,...header_SEPARATOR]);

    // 8. LOCAL CLUT, 9. HEADER LOCAL CLUT 1, 10. HEADER SEPARATOR
    // Remember substract 20 bytes to the CLUT files.
    offset_position.setUint16(0,mainHeader.getUint16(4, true) - files_normalized.LOCAL_CLUT.length, true); 
    header_TEX_CLUT_1.splice(12,2,...new Uint8Array(offset_position.buffer));
    // And also slice the CLUT array from the 20th position.
    tex.push(...[...files.LOCAL_CLUT.slice(20, CLUT_FILE_SIZE),...header_TEX_CLUT_1,...header_SEPARATOR]);

    // 11. LOCAL CLUT (GK), 12. HEADER LOCAL CLUT 2, 13. HEADER SEPARATOR
    offset_position.setUint16(0,mainHeader.getUint16(16, true) - files_normalized.LOCAL_CLUT.length, true); 
    header_TEX_CLUT_2.splice(12,2,...new Uint8Array(offset_position.buffer));
    tex.push(...[...files_normalized.LOCAL_CLUT,...header_TEX_CLUT_2,...header_SEPARATOR]);

    // 14. AWAY TEX BIN, 15. HEADER AWAY TEX BIN, 16. HEADER SEPARATOR
    offset_position.setUint16(0,mainHeader.getUint16(8, true) - files.AWAY_BIN.length, true); 
    header_TEX_BIN.splice(12,2,...new Uint8Array(offset_position.buffer));
    tex.push(...[...files.AWAY_BIN,...header_TEX_BIN,...header_SEPARATOR]);

    // 17. SLEVES AWAY TEX BIN, 18. HEADER SLEVES AWAY TEX BIN, 19. HEADER SEPARATOR
    offset_position.setUint16(0,mainHeader.getUint16(40, true) - files.SLEVES_AWAY_BIN.length, true); 
    header_SLEVES_TEX_BIN.splice(12,2,...new Uint8Array(offset_position.buffer));
    tex.push(...[...files.SLEVES_AWAY_BIN,...header_SLEVES_TEX_BIN,...header_SEPARATOR]);

    // 20. AWAY CLUT, 21. HEADER AWAY CLUT 1, 22. HEADER SEPARATOR
    offset_position.setUint16(0,mainHeader.getUint16(12, true) - files_normalized.AWAY_CLUT.length, true); 
    header_TEX_CLUT_1.splice(12,2,...new Uint8Array(offset_position.buffer));
    tex.push(...[...files_normalized.AWAY_CLUT,...header_TEX_CLUT_1,...header_SEPARATOR]);

    // 23. AWAY CLUT (GK), 24. HEADER AWAY CLUT 2, 25. HEADER SEPARATOR
    offset_position.setUint16(0,mainHeader.getUint16(20, true) - files_normalized.AWAY_CLUT.length, true); 
    header_TEX_CLUT_2.splice(12,2,...new Uint8Array(offset_position.buffer));  
    tex.push(...[...files_normalized.AWAY_CLUT,...header_TEX_CLUT_2,...header_SEPARATOR]);  
    
    // 26. FLAG BIN, 27. HEADER FLAG BIN, 28. HEADER SEPARATOR
    offset_position.setUint16(0,mainHeader.getUint16(28, true) - files.FLAG_BIN.length, true); 
    header_FLAG_BIN.splice(12,2,...new Uint8Array(offset_position.buffer));
    tex.push(...[...files.FLAG_BIN,...header_FLAG_BIN,...header_SEPARATOR]);

    // 29. FLAG CLUT, 30. HEADER FLAG CLUT, 31. HEADER SEPARATOR
    offset_position.setUint16(0,mainHeader.getUint16(32, true) - files_normalized.FLAG_CLUT.length, true); 
    header_FLAG_CLUT.splice(12,2,...new Uint8Array(offset_position.buffer));    
    tex.push(...[...files_normalized.FLAG_CLUT,...header_FLAG_CLUT,...header_SEPARATOR]);

    // 32. REFEREE BIN, 33. HEADER REFEREE BIN, 34. HEADER SEPARATOR
    offset_position.setUint16(0,mainHeader.getUint16(44, true) - files.REFEREE_BIN.length, true); 
    header_REFEREE_BIN.splice(12,2,...new Uint8Array(offset_position.buffer));
    tex.push(...[...files.REFEREE_BIN, ...header_REFEREE_BIN, ...header_SEPARATOR]);
    
    console.log(tex);

    // Compare two BIN files on Windows:
    // fc.exe /b file1 file2
    return tex;
}