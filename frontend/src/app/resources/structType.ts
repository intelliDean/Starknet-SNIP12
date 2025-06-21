import {constants, shortString, StarknetDomain, TypedData, typedData, TypedDataRevision} from "starknet";

const types = {
    StarknetDomain: [
        { name: "name", type: "shortstring" },
        { name: "version", type: "shortstring" },
        { name: "chainId", type: "shortstring" },
        { name: "revision", type: "shortstring" },
    ],
    // In V1 we privilege user friendly names
    SimpleStruct: [
        { name: "txt", type: "felt" },
        { name: "num", type: "u128" },
    ],
};

export interface SimpleStruct {
    txt: string;
    num: string;
}

function getDomain(): StarknetDomain {
    return {
        name: "CustomERC20",
        version: shortString.encodeShortString("1"),
        chainId: constants.StarknetChainId.SN_SEPOLIA,
        revision: TypedDataRevision.ACTIVE,
    };
}

export function getTypedDataHash(myStruct: SimpleStruct, owner: bigint): string {
    return typedData.getMessageHash(getTypedData(myStruct), owner);
}

// Needed to reproduce the same structure as:
// https://github.com/0xs34n/starknet.js/blob/1a63522ef71eed2ff70f82a886e503adc32d4df9/__mocks__/typedDataStructArrayExample.json
function getTypedData(myStruct: SimpleStruct): TypedData {
    return {
        types,
        primaryType: "SimpleStruct",
        domain: getDomain(),
        message: { txt: myStruct.txt, num: myStruct.num },
    };
}
//
// const simpleStruct: SimpleStruct = {
//     someFelt252: "712",
//     someU128: "42",
// };
//
// console.log(`test test_valid_hash ${getTypedDataHash(simpleStruct, "0", 420n)};`);