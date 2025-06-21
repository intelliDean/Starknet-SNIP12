"use client";

import React, { useState, useEffect } from "react";
import {
  AccountInterface,
  Contract,
  ProviderInterface,
  RpcProvider,
} from "starknet";
import { connect, disconnect } from "starknetkit";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getTypedDataHash,
  SimpleStruct,
  getTypedData,
} from "../resources/structType";

export default function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ProviderInterface | null>(null);
  const [account, setAccount] = useState<AccountInterface | null>(null);
  const [txt, setTxt] = useState<string>("");
  const [num, setNum] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const PROVIDER = new RpcProvider({
    nodeUrl: process.env.NEXT_PUBLIC_SEPOLIA_URL,
  });

  useEffect(() => {
    // Auto-connect wallet on load
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (address) {
      await disconnect();
      setProvider(null);
      setAccount(null);
      setAddress(null);
      toast.success("Wallet disconnected");
      return;
    }
    try {
      const { wallet } = await connect({ provider: PROVIDER });
      if (wallet && wallet.isConnected) {
        console.log(`Wallet is connected: ${wallet.isConnected}`);
        setProvider(wallet.provider);
        setAccount(wallet.account);
        setAddress(wallet.selectedAddress);

        toast.success(`Connected: ${wallet.selectedAddress.slice(0, 10)}...`);
      } else {
        toast.error("Failed to connect wallet");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const checkConnection = (addr: string | null): boolean => {
    if (!addr) {
      toast.error("Connect wallet!");
      return false;
    }
    return true;
  };

  const verifyMessageHash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkConnection(address)) {
      return;
    }
    if (!txt || !num) {
      toast.error("All fields are required");
      return;
    }

    if (Number(num) < 0 || Number(num) >= 2 ** 128) {
      toast.error("Number must be between 0 and 2^128 - 1");
      return;
    }

    try {
      const { abi } = await provider!.getClassAt(
        process.env.NEXT_PUBLIC_CUSTOMERC20_ADDRESS!
      );
      if (!abi) {
        throw new Error("No ABI found for the contract.");
      }

      const contract = new Contract(
        abi,
        process.env.NEXT_PUBLIC_CUSTOMERC20_ADDRESS!,
        provider!
      );

      const simpleStruct: SimpleStruct = {
        txt,
        num,
      };

      console.log("Simple Struct:", simpleStruct);

      console.log(`Account: ${account}`);
      console.log(`Provider: ${provider}`);
      console.log(`Address: ${address}`);

      const msgHash = getTypedDataHash(simpleStruct, address!);
      console.log("Message Hash:", msgHash);

      //TODO: THIS IS UNNECESSARY AND WILL REMOVE IT LATER
      const signature = await account.signMessage(certTypedData);
      console.log("Signature:", signature);
      
      const hashedMsg: string = await account.hashMessage(certTypedData);
      
      const isValid: boolean = await provider!.verifyMessageInStarknet(
          hashedMsg,
          signature,
          address
      );
      console.log("Off-chain verification: ", isValid);
      //TODO============================================================

      const result = await contract.transfer_with_signature(
        address,
        txt,
        num,
        msgHash
      );

      console.log("Result:", result);
      toast.success(`Message hash valid: ${result ? "True" : "False"}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 flex flex-col">
      <header className="p-4 bg-blue-600 text-white shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Starknet CustomERC20</h1>
          <button
            onClick={connectWallet}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105"
            aria-label={address ? "Disconnect Wallet" : "Connect Wallet"}
          >
            {address ? `${address.slice(0, 10)}...` : "Connect Wallet"}
          </button>
        </div>
      </header>

      <main className="container mx-auto p-6 flex-grow">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 flex justify-between items-center"
          >
            <span>Verify Message Hash</span>
          </button>
          <div
            className={`transition-all duration-300 ${
              isFormOpen ? "max-h-screen mt-4" : "max-h-0 overflow-hidden"
            }`}
          >
            <form onSubmit={verifyMessageHash} className="space-y-4">
              <input
                type="text"
                placeholder="Txt"
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
                className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Num"
                value={num}
                onChange={(e) => setNum(e.target.value)}
                className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
}
