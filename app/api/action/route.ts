import { NextRequest } from 'next/server'
import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ActionError, ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from "@solana/actions"
import { Transaction, TransactionInstruction, PublicKey, ComputeBudgetProgram, Connection, clusterApiUrl, SystemProgram, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js"
import axios from 'axios'

const ADDRESS = new PublicKey("2dnncUgyjGMJhKLMjE9ddm2rvcFW47WfKz37inF61zXr")

export const GET = async (req: Request) => {

  const payload: ActionGetResponse = {
    icon: `https://blue-magnetic-wallaby-228.mypinata.cloud/ipfs/QmWqVwNn2REZ5rUV848LtcNiSFsLZq17fvbn7C9wd6hFga`,
    label: "send",
    title: "Sonic Minimal blink",
    description: "\ntransfer sonic devnet sol to another address",
    disabled: false
  }

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS
  })
}

export const OPTIONS = GET

export const POST = async (req: NextRequest) => {
  try {
    const body: ActionPostRequest = await req.json()

    let account: PublicKey

    try { 
      account = new PublicKey(body.account)
    } catch (err) {
      return new Response('Invalid account provided', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS
      })
    }

    console.log("Address:", account.toBase58())

    // const connection = new Connection(clusterApiUrl("mainnet-beta"))
    const connection = new Connection(`https://api.testnet.sonic.game`)
    const transaction = new Transaction()

    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000
      }),
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: ADDRESS,
        lamports: 0.1 * LAMPORTS_PER_SOL
      }),
      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: Buffer.from("sonic on blinks", "utf-8"),
        keys: []
      })
    )

    transaction.feePayer = account
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `sent it`,
        type: "transaction"
      }
    })

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS })
  } catch (err) {
    console.error(err)
    return Response.json("An unknown error occured", { status: 500 })
  }
}
