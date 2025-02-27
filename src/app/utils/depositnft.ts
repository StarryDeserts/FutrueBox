'use client'
import { Transaction } from '@mysten/sui/transactions';
import { packid, poorid } from '../config/packid'

export async function depositNFTs(
  signAndExecuteTransaction: any,
  selectedIds: string[]
) {
  const tx = new Transaction();

  // Add a moveCall for each selected ID
  tx.moveCall({
    target: `${packid}::futurebox::vote_box`,
    arguments: [
      tx.pure.vector('id',selectedIds),
      tx.object(poorid),
    ],
  });

  try {
    // Adding timeout to handle slow responses
    const result = await Promise.race([
      signAndExecuteTransaction({
        transaction: tx,
        chain: "sui:testnet",
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Transaction timed out')), 5000)
      ),
    ]);

    console.log('Transaction result:', result);
    return { success: true, result };
  } catch (error) {
    console.error("Transaction error:", error);
    return { success: false, error: error };
  }
}
