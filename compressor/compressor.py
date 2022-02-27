from ctypes import c_uint8 as uint8, c_uint16 as uint16
import argparse

TOKEN_TYPE = {
    'UNASSIGNED': -1,
    'RAW': 3,
    'SHORT': 2,
    'LONG': 0
}

defaultToken = {
    'data': None,
    'length': 0,
    'offset': 0,
    'type': TOKEN_TYPE['UNASSIGNED']
}

def findMatch(lowindex, offsetIndex, length, matchMinLength, matchMaxLength):
   
    bestOffset = -1
    bestLength = matchMinLength
    
    for idx in range(max(0, lowindex), offsetIndex):
        matchLength = 0
        matchIdx = 0
        
        while (matchIdx < matchMaxLength and matchIdx < length
               and offsetIndex + matchIdx < length):
            if buffer_slice[idx + matchIdx] != buffer_slice[offsetIndex + matchIdx]:
                break

            matchLength = matchLength + 1
            
            matchIdx = matchIdx + 1
    
        if matchLength >= bestLength:
            bestOffset = idx
            bestLength = matchLength
    
    return {
        'offset' : bestOffset,
        'length' : 0 if bestOffset < 0 else bestLength
    }

def getTokens():
    SIZE = len(buffer_slice)
    offset = 0
    
    tokens = []
    token = defaultToken.copy()
    
    while offset < SIZE:
        shortMatch = findMatch(offset - 0x10, offset, SIZE, 2, 5)
        longMatch = findMatch(offset - 0x3FF, offset, SIZE, 3, 34)
        
        
        useShortMatch = shortMatch['offset'] >= 0 and shortMatch['length'] > 0 \
            and shortMatch['length'] >= longMatch['length']
        
        useLongMatch = longMatch['offset'] >= 0 and longMatch['length'] > 0 \
            and longMatch['length'] > shortMatch['length']
        
        
        if useShortMatch:
            if token['type'] != TOKEN_TYPE['UNASSIGNED']:
                tokens.append(token)
            
            token = defaultToken.copy()
            
            tokens.append({
                'data': None,
                'length': shortMatch['length'],
                'offset': offset - shortMatch['offset'],
                'type': TOKEN_TYPE['SHORT']
            })
            
            offset = offset + shortMatch['length']
        
        elif useLongMatch:
            if token['type'] != TOKEN_TYPE['UNASSIGNED']:
                tokens.append(token)
            
            token = defaultToken.copy()
            
            tokens.append({
                'data': None,
                'length': longMatch['length'],
                'offset': offset - longMatch['offset'],
                'type': TOKEN_TYPE['LONG']
            })
            
            offset = offset + longMatch['length']
        
        else:
            if token['type'] == TOKEN_TYPE['UNASSIGNED']:
                token['type'] = TOKEN_TYPE['RAW']
                token['data'] = []
                
            token['data'].append(buffer_slice[offset])
            offset = offset + 1
            
            #Maximun block length 0x46
            if len(token['data']) == 70:
                tokens.append(token)
                token = defaultToken.copy()
    
    if token['type'] != TOKEN_TYPE['UNASSIGNED']:
        tokens.append(token)
        
    return tokens

def writeCommandBit(writer, flag, bytes):
    writer['control'] = writer['control'] >> 1
    
    if flag:
        writer['control'] = writer['control'] | 0x80
        
    writer['buffer'].extend(bytes)
    
    writer['bits'] = writer['bits'] - 1
    if writer['bits'] != 0:
        return
    
    writer['bits'] = 8
    writer['output'].append(writer['control'])
    writer['output'].extend(writer['buffer'])
    writer['buffer'] = []
    writer['control'] = 0
    
def encodeTokens(tokens):
    global writer
    writer = {
        'output': [],
        'control': 0,
        'bits': 8,
        'buffer': []
    }
    
    for token in tokens:
        if token['type'] == TOKEN_TYPE['SHORT']:

            length = (token['length'] - 2) << 4
            distance = token['offset'] - 1
            writeCommandBit(writer, True, [0x80 | length | distance])
                    
        elif token['type'] == TOKEN_TYPE['LONG']:
            length = (token['length'] - 3) << 10
            distance = token['offset']
            composite = length | distance
            writeCommandBit(writer, True, [composite >> 8, composite])

        
        elif token['type'] == TOKEN_TYPE['RAW']:
            if len(token['data']) < 8:
                for data in token['data']:
                    writeCommandBit(writer, False, [data])
            else:
                writeCommandBit(writer, True, [0xB8 + len(token['data']), 
                                               *token['data']])
        else:
            raise Exception('Tokenizer Error')
    
    
    writeCommandBit(writer, True, [0xFF])
    
    while writer['bits'] != 8:
        writeCommandBit(writer, True, [])
    
    return writer['output']




def saveFile(data):
    archivo = open ('compress.bin', 'wb')
    
    for byte in data:
        archivo.write(bytes((byte,)))
    archivo.close()


if __name__ == "__main__":
    
    global buffer
    global buffer_slice
    #Reads file

    ap = argparse.ArgumentParser()
    ap.add_argument("-f", "--file", required=True,
        help="path to file")

    args = vars(ap.parse_args())

    file= open(args['file'], 'rb')

    buffer = list(file.read())
    file.close()

    #Read 2 bytes from buffer, cast them to hex, concatenates them
    #and casts back to int
    #i.e buffer[8] = 0C and buffer[9] = 02, so result is 0C02
    #0C02 = 3074
    clut_bytes = int("%02X%02X"%(buffer[8], buffer[9]), 16)
    
    #cast int to uint16, and save the values to bytes on little endian
    clut_bytes = uint16(clut_bytes).value.to_bytes(2, 'little')
    
    #reads the bytes as big endian
    clut_bytes = int.from_bytes(clut_bytes,'big')
    CLUT_SIZE = clut_bytes + 12
    
    buffer_slice = buffer[8 + CLUT_SIZE:]

    tokens = getTokens()
    
    #list with int values
    encoding = encodeTokens(tokens)
    
    #print(*encoding)
    
    encoding_uint8 = list(map(uint8, encoding))
    
    encoding_uint8 = [i.value for i in encoding_uint8]
    
    #print(*encoding_uint8)   
    saveFile(encoding_uint8)
    