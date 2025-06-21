export const CUSTOMERC_ABI = [
    {
        type: "enum",
        name: "core::bool",
        variants: [
            { name: "False", type: "()" },
            { name: "True", type: "()" },
        ],
    },
    {
        type: "function",
        name: "transfer_with_signature",
        inputs: [
            {
                name: "owner",
                type: "core::starknet::contract_address::ContractAddress",
            },
            { name: "txt", type: "core::felt252" },
            { name: "num", type: "core::integer::u128" },
            { name: "message_hash", type: "core::felt252" },
        ],
        outputs: [{ type: "core::bool" }],
        state_mutability: "view",
    },
    {
        type: "event",
        name: "snip12::CustomERC20::Event",
        kind: "enum",
        variants: [],
    },
];
