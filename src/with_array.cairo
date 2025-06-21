#[starknet::contract]
mod CustomERC20 {
    use core::hash::{HashStateExTrait, HashStateTrait, LegacyHash};
    use core::poseidon::PoseidonTrait;
    use starknet::{ContractAddress, get_tx_info};
    use crate::interface::v1::StarknetDomain;
    use crate::interface::{IOffChainMessageHash, IStructHash};

    const STRUCT_WITH_ARRAY_TYPE_HASH: felt252 = selector!(
        "\"Certificate\"(\"name\":\"felt\",\"id\":\"felt\",\"serial\":\"felt\",\"date\":\"u128\",\"owner\":\"ContractAddress\",\"metadata\":\"felt*\")",
    );

    #[derive(Copy, Drop, Serde, Clone, PartialEq)]
    struct Certificate {
        name: felt252,
        id: felt252,
        serial: felt252,
        date: u128,
        owner: ContractAddress,
        metadata: Span<felt252>,
    }


    #[storage]
    struct Storage {}


    impl OffChainMessageHashStructWithArray of IOffChainMessageHash<Certificate> {
        fn get_message_hash(self: @Certificate, owner: ContractAddress) -> felt252 {
            let domain = StarknetDomain {
                name: 'CustomERC20',
                version: '1',
                chain_id: get_tx_info().unbox().chain_id,
                revision: 1,
            };
            let mut state = PoseidonTrait::new();
            state = state.update_with('StarkNet Message');
            state = state.update_with(domain.get_struct_hash());
            // This can be a field within the struct, it doesn't have to be get_caller_address().
            state = state.update_with(owner);
            state = state.update_with(self.get_struct_hash());
            state.finalize()
        }
    }

    impl StructHashStructWithArray of IStructHash<Certificate> {
        fn get_struct_hash(self: @Certificate) -> felt252 {
            let mut state = PoseidonTrait::new();
            state = state.update_with(STRUCT_WITH_ARRAY_TYPE_HASH);
            state = state.update_with(*self.name);
            state = state.update_with(*self.id);
            state = state.update_with(*self.serial);
            state = state.update_with(*self.date);
            state = state.update_with(*self.owner);
            state = state.update_with(self.metadata.get_struct_hash());
            state.finalize()
        }
    }

    impl StructHashSpanFelt252 of IStructHash<Span<felt252>> {
        fn get_struct_hash(self: @Span<felt252>) -> felt252 {
            let mut state = PoseidonTrait::new();
            for el in (*self) {
                state = state.update_with(*el);
            }
            state.finalize()
        }
    }

    impl LegacyHashSpanFelt252 of LegacyHash<Span<felt252>> {
        fn hash(mut state: felt252, mut value: Span<felt252>) -> felt252 {
            loop {
                match value.pop_front() {
                    Option::Some(item) => { state = LegacyHash::hash(state, *item); },
                    Option::None(_) => { break state; },
                };
            }
        }
    }

    #[external(v0)]
    fn transfer_with_signature(
        self: @ContractState, certificate: Certificate, message_hash: felt252,
    ) -> bool {

        let result = certificate.get_message_hash(certificate.owner) == message_hash;

        assert(result, 'Invalid message hash');

        result
    }
}
