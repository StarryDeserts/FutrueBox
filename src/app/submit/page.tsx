"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Check, Circle, ImageIcon } from "lucide-react"

import { useAccounts, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { packid } from "../config/packid"

export default function UploadComponent() {
  const [account] = useAccounts()
  const [title, setTitle] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string>("")
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!account) {
      toast.error("No account connected")
      return
    }

    if (!title.trim()) {
      toast.error("请输入标题")
      return
    }

    if (title.trim() && content.trim() && !imageUrl.trim()) {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packid}::futurebox::create_single_box`,
        arguments: [
          tx.pure.string(title),
          tx.pure.u8(0),
          tx.pure.string(content),
        ],
      });
      signAndExecuteTransaction({
        transaction: tx,
      })
      
    } else if (title.trim() && !content.trim() && imageUrl.trim()) {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packid}::futurebox:: create_single_box`,
        arguments: [
          tx.pure.string(title),
          tx.pure.u8(1),
          tx.pure.string(imageUrl),
        ],
      });
      signAndExecuteTransaction({
        transaction: tx,
      })

    } else if (title.trim() && content.trim() && imageUrl.trim()) {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packid}::futurebox:: create_single_box`,
        arguments: [
          tx.pure.string(title),
          tx.pure.u8(2),
          tx.pure.string(content),
          tx.pure.string(imageUrl),
        ],
      });
      signAndExecuteTransaction({
        transaction: tx,
      })

    } else {
      toast.error("请输入有效的内容")
      return
    }

    console.log("Title:", title)
    console.log("Content:", content)
    console.log("Image URL:", imageUrl)

    setTitle("")
    setContent("")
    setImageUrl("")
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入标题..."
          className="text-lg font-bold"
        />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="输入内容..."
          className="min-h-[200px]"
        />
        <div className="relative">
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="输入图片地址..."
            className="pr-10"
          />
          <ImageIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Preview"
              className="max-h-40 rounded object-cover"
              onError={() => toast.error("图片加载失败")}
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              {imageUrl ? <Check className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
              <span>图片地址</span>
            </div>
            <div className="flex items-center space-x-2">
              {content ? <Check className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
              <span>文本</span>
            </div>
          </div>
          <Button type="submit" className="px-6 py-2 text-lg">
            上传
          </Button>
        </div>
      </form>
    </div>
  )
}

