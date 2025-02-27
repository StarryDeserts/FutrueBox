'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useAccounts, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { Button } from '@/components/ui/button'
import { packid, poorid } from '../config/packid'

type DepositNFTProps = {
  id: string;
}

export function DepositNFT({ id }: DepositNFTProps) {
  const [isDepositing, setIsDepositing] = useState(false)
  const [account] = useAccounts()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  const handleDeposit = async () => {
    if (!account) {
      toast.error("No account connected")
      return
    }

    setIsDepositing(true)

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packid}::futurebox::deposit_box`,
        arguments: [
          tx.object(poorid),
          tx.object(id),
        ],
      });

      const result = signAndExecuteTransaction({
        transaction: tx.serialize(),
        chain: "sui:testnet",
      })

      console.log('Transaction result:', result)
      toast.success("NFT deposited successfully")
    } catch (error) {
      console.error("Transaction error:", error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsDepositing(false)
    }
  }

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    return String(error)
  }

  return (
    <Button 
      onClick={handleDeposit} 
      disabled={isDepositing || !account}
    >
      {isDepositing ? 'Depositing...' : 'Deposit NFT'}
    </Button>
  )
}

