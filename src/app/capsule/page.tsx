"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useAccounts, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fetchCapsuleData } from "../utils/suledata"
import { depositNFTs } from "../utils/depositnft"

type CardContent = {
  name: string
  image_url: string
  text_content: string
  votes_num: string
  id: { id: string }
}

const ITEMS_PER_PAGE = 8

export default function CardSelectionAndDeposit() {
  const [capsuleData, setCapsuleData] = useState<CardContent[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [dialogContent, setDialogContent] = useState<CardContent | null>(null)
  const [isDepositing, setIsDepositing] = useState(false)
  const [account] = useAccounts()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCapsuleData()
        console.log(data)
        setCapsuleData(data)
      } catch (error) {
        console.error("Error fetching capsule data:", error)
        toast.error("Failed to load capsule data. Please try again later.")
      }
    }

    loadData()
  }, [])

  const totalPages = Math.ceil(capsuleData.length / ITEMS_PER_PAGE)
  const currentCards = capsuleData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleSelect = (id: string) => {
    setSelectedIds((prevIds) => {
      const isCurrentlySelected = prevIds.includes(id)
      if (isCurrentlySelected) {
        return prevIds.filter((prevId) => prevId !== id)
      } else if (prevIds.length < 5) {
        return [...prevIds, id]
      } else {
        toast.error("You can only select up to 5 cards!")
        return prevIds
      }
    })
  }

  const handleDeposit = async () => {
    if (!account) {
      toast.error("No account connected")
      return
    }

    if (selectedIds.length !== 5) {
      toast.error("Please select exactly 5 cards to deposit")
      return
    }

    setIsDepositing(true)

    try {
      const { success, error } = await depositNFTs(signAndExecuteTransaction, selectedIds)

      if (success) {
        toast.success("NFTs deposited successfully")
        setSelectedIds([]) // Clear selection after successful deposit
      } else {
        throw error
      }
    } catch (error) {
      console.error("Deposit error:", error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsDepositing(false)
    }
  }

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    return String(error)
  }

  const handleCardClick = (content: CardContent) => {
    setDialogContent(content)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence>
            {currentCards.map((content, index) => (
              <motion.div
                key={`${content.id.id}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-card text-card-foreground rounded-lg shadow-lg overflow-hidden relative cursor-pointer h-60 flex flex-col justify-between"
                style={{
                  backgroundImage: `url(${content.image_url || "https://via.placeholder.com/300x200"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                onClick={() => handleCardClick(content)}
              >
                <div className="absolute inset-0 bg-black bg-opacity-50 p-2 flex flex-col justify-between">
                  <div>
                    <h2 className="text-sm font-semibold mb-1 text-white line-clamp-1">{content.name}</h2>
                    <p className="text-xs text-white line-clamp-2">{content.text_content}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-xs">Votes: {content.votes_num}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelect(content.id.id)
                      }}
                      className="text-white hover:text-white hover:bg-white/20 p-1"
                      aria-label={selectedIds.includes(content.id.id) ? "Deselect card" : "Select card"}
                    >
                      {selectedIds.includes(content.id.id) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="bg-background p-4 border-t flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={handleDeposit}
          disabled={selectedIds.length !== 5 || isDepositing || !account}
          className="px-4 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
        >
          {isDepositing ? "Depositing..." : `Deposit (${selectedIds.length}/5 selected)`}
        </Button>
      </div>

      <Dialog open={!!dialogContent} onOpenChange={() => setDialogContent(null)}>
        <DialogContent className="max-w-[90vw] w-full max-h-[80vh] h-full overflow-hidden">
          <DialogHeader>
            <DialogTitle>{dialogContent?.name || "Event Details"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col md:flex-row gap-6 h-full overflow-hidden">
            {dialogContent?.image_url && (
              <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                <img
                  src={dialogContent.image_url || "https://via.placeholder.com/300x200"}
                  alt={dialogContent.name || "Event image"}
                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                />
              </div>
            )}
            <div className="flex-1 overflow-y-auto">
              {dialogContent?.text_content && (
                <p className="text-lg text-gray-700 leading-relaxed mb-4">{dialogContent.text_content}</p>
              )}
              <p className="text-sm text-gray-600 mb-4">Votes: {dialogContent?.votes_num}</p>
              <p className="text-sm text-gray-600 mb-4">Owner Address: {dialogContent?.id.id}</p>
              <Button
                onClick={() => {
                  if (dialogContent) {
                    handleSelect(dialogContent.id.id)
                    setDialogContent(null)
                  }
                }}
              >
                {selectedIds.includes(dialogContent?.id.id || "") ? "Deselect" : "Select"} This Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
