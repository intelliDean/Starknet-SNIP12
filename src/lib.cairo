mod interface;
mod with_array;

//TODO: THIS IS WORKING
// #[starknet::contract]
// mod CustomERC20 {
//     use core::hash::{HashStateExTrait, HashStateTrait};
//     use core::poseidon::PoseidonTrait;
//     use starknet::{ContractAddress, get_tx_info};
//     use crate::interface::v1::StarknetDomain;
//     use crate::interface::{IOffChainMessageHash, IStructHash};


//     const SIMPLE_STRUCT_TYPE_HASH: felt252 = selector!(
//         "\"SimpleStruct\"(\"txt\":\"felt\",\"num\":\"u128\")",
//     );

//     #[storage]
//     struct Storage {}

//     #[derive(Drop, Copy, Hash)]
//     struct SimpleStruct {
//         txt: felt252,
//         num: u128,
//     }

//     impl OffChainMessageHashSimpleStruct of IOffChainMessageHash<SimpleStruct> {
//         fn get_message_hash(self: @SimpleStruct, owner: ContractAddress) -> felt252 {
//             let domain = StarknetDomain {
//                 name: 'CustomERC20',
//                 version: '1',
//                 chain_id: get_tx_info().unbox().chain_id,
//                 revision: 1,
//             };
//             let mut state = PoseidonTrait::new();
//             state = state.update_with('StarkNet Message');
//             state = state.update_with(domain.get_struct_hash());
//             // This can be a field within the struct, it doesn't have to be get_caller_address().
//             state = state.update_with(owner);
//             state = state.update_with(self.get_struct_hash());
//             state.finalize()
//         }
//     }

//     impl StructHashSimpleStruct of IStructHash<SimpleStruct> {
//         fn get_struct_hash(self: @SimpleStruct) -> felt252 {
//             let mut state = PoseidonTrait::new();
//             state = state.update_with(SIMPLE_STRUCT_TYPE_HASH);
//             state = state.update_with(*self);
//             state.finalize()
//         }
//     }

//     #[external(v0)]
//     fn transfer_with_signature(
//         self: @ContractState,
//         owner: ContractAddress,
//         txt: felt252,
//         num: u128,
//         message_hash: felt252,
//     ) -> bool {
//         let simple_struct = SimpleStruct { txt, num };
//         let result = simple_struct.get_message_hash(owner) == message_hash;
//         assert(result, 'Invalid message hash');

//         result
//     }
// }

