// TODO: SignMessage
// import { verify } from '@noble/ed25519';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useEffect, useState } from 'react';
// import { FC, useCallback, useEffect, useState } from 'react';
// import { notify } from "../utils/notifications";
import { Program, AnchorProvider, web3, utils, BN, setProvider } from '@coral-xyz/anchor';
import idl from './solanapdas.json';
import { Solanapdas } from './solanapdas';
import { PublicKey } from '@solana/web3.js';

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programId = new PublicKey(idl.address);

export const Bank: FC = () => {
    // const { publicKey, signMessage } = useWallet();
    const ourWallet = useWallet();
    const {connection} = useConnection();
    const [banks, setBanks] = useState([]);
    const [bankName, setBankName] = useState('');
    

    const getProvider = () => {
        const provider = new AnchorProvider(connection,  ourWallet, AnchorProvider.defaultOptions());
        setProvider(provider);
        return provider;
    }

    const createBank = async () => {
        try {

            if(bankName) {

                const anchorProvider = getProvider();
                const program = new Program<Solanapdas>(idl_object, anchorProvider);

                await program.methods.create(bankName).accounts({
                user: anchorProvider.publicKey
            }).rpc();

            console.log("Bank created successfully!");
            // const anchorProvider = getProvider();
            // const program = new Program<Solanapdas>(idl_object, anchorProvider);

            
            
            
            // const [bank] = PublicKey.findProgramAddressSync([
                //     utils.bytes.utf8.encode("bankaccount"),
            //     anchorProvider.publicKey.toBuffer(),
            // ], program.programId);
            
            // console.log("Creating bank with name:", bankName);
            // console.log("Bank address:", bank.toBase58());
            // console.log("User address:", anchorProvider.publicKey.toBase58());

        
            // await program.methods.create(bankName).accountsStrict({
                //     bank,
                //     user: anchorProvider.publicKey,
                //     systemProgram: web3.SystemProgram.programId,
            // }).rpc();

            // console.log("Bank created successfully!");
            setBankName("");
            getBanks();
            
        }
            
        } catch (error) {
            console.log(error)
            console.error("Error while creating a bank: " + error);
        }
    }

    const getBanks = async () => {
        try {
            const anchorProvider = getProvider();
            const program = new Program<Solanapdas>(idl_object, anchorProvider);

            Promise.all((await connection.getParsedProgramAccounts(programId)).map(async bank => ({
                ...(await program.account.bank.fetch(bank.pubkey)),
                pubkey: bank.pubkey
            }))).then(banks => {
                console.log("Fetched banks: ", banks);
                setBanks(banks);
                // notify({ type:'success', message: 'Fetched banks successfully!', data: banks });
            })
          
        } catch (error) {
            console.error("Error while fetching banks: " + error);
        }
    }

    const deposit = async (pubkey: string) => {
        try {
            const anchorProvider = getProvider();
            const program = new Program<Solanapdas>(idl_object, anchorProvider);

            await program.methods.deposit(new BN(0.1 * web3.LAMPORTS_PER_SOL)).accounts({
                bank: pubkey,
                user: anchorProvider.publicKey
            }).rpc();

            console.log("Deposited successfully!");
            getBanks();
        } catch (error) {
            console.error("Error while fetching banks: " + error);
        }
    }

    useEffect(() => {
        getBanks();
    }, []);


    return (
       <div>
        {banks.map((bank, i )=> {
            return (
                <div className='md:hero-content flex flex-col' key={i}>
                    <h1>{bank.name.toString()}</h1>
                    <span>{Number(bank.balance.toString())/ web3.LAMPORTS_PER_SOL} SOL</span>
                    <button
                    className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                    onClick={() => deposit(bank.pubkey)}>
                        <span>
                        Deposit 0.1
                        </span>                
                    </button>
                </div>
            )
        })}

                <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter bank name"
                className="input input-bordered w-full max-w-xs"/>
       <div className="flex flex-row justify-center">
            <div className="relative group items-center">
          
                <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
               
                <button
                    className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                    onClick={createBank} disabled={!ourWallet.publicKey}
                >
                    <div className="hidden group-disabled:block">
                        Wallet not connected
                    </div>
                    <span className="block group-disabled:hidden" > 
                        Create Bank
                    </span>
                </button>

                <button
                    className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                    onClick={getBanks} disabled={!ourWallet.publicKey}
                >
                    <div className="hidden group-disabled:block">
                        Wallet not connected
                    </div>
                    <span className="block group-disabled:hidden" > 
                        Fetch Banks
                    </span>
                </button>
            </div>
        </div>
    </div>
    );
};
