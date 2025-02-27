"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccounts } from "@mysten/dapp-kit"
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client"
import Image from "next/image"
import { DepositNFT } from "../utils/nftdata"
import { packid } from "../config/packid"

type CapsuleContent = {
  name: string
  image_url: string
  text_content: string
  id: {
    id: string
  }
}

type Library = {
  fields: {
    name: string
    image_url: string
    text_content: string
    votes_num: string
    owner_address: string
    id: {
      id: string
    }
  }
}

export default function NFTPage() {
  const [nfts, setNfts] = useState<CapsuleContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [account] = useAccounts()

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!account) {
        setError("No account connected")
        setLoading(false)
        return
      }

      const client = new SuiClient({ url: getFullnodeUrl("testnet") })

      try {
        const objectListResponse = await client.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${packid}::futurebox::FutureBox`,
          },
        })

        const objectIds = objectListResponse.data
          .map((item) => item.data?.objectId)
          .filter((id): id is string => id !== undefined)

        const detailsPromises = objectIds.map(async (objectId) => {
          const objectDetails = await client.getObject({
            id: objectId,
            options: {
              showContent: true,
            },
          })
          console.log(objectId)
          if (objectDetails.data?.content?.dataType !== "moveObject") {
            throw new Error(`Unexpected data type for object ${objectId}`)
          }

          const content = objectDetails.data.content as unknown as Library
          return content.fields
        })

        const objectDetailsArray = await Promise.all(detailsPromises)
        setNfts(objectDetailsArray)
      } catch (error) {
        console.error("Error fetching NFT details:", error)
        setError("Failed to fetch NFTs. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [account])

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8">Error: {error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">我的NFT</h1>
      {nfts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {nfts.map((nft, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{nft.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Image
                  src={nft.image_url && nft.image_url.startsWith("http") ? nft.image_url : "/placeholder.svg"}
                  alt={nft.name}
                  width={300}
                  height={300}
                  className="mb-4 rounded-lg object-cover"
                />
                <p className="text-sm text-gray-600 mb-4">{nft.text_content}</p>
                <DepositNFT id={nft.id.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-lg">您还没有NFT。提示：存入内容即可获得NFT</p>
      )}
    </div>
  )
}

