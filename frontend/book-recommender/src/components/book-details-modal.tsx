"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Book } from "@/components/book-recommendation-app"
import { ExternalLink, BookOpen } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface BookDetailsModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
}

export function BookDetailsModal({ book, isOpen, onClose }: BookDetailsModalProps) {
  const [imageError, setImageError] = useState(false)

  if (!book) return null

  const handleGoodreadsSearch = () => {
    const query = encodeURIComponent(`${book.title} ${book.author}`)
    window.open(`https://www.goodreads.com/search?q=${query}`, "_blank")
  }

  const handleAmazonSearch = () => {
    const query = encodeURIComponent(`${book.title} ${book.author} book`)
    window.open(`https://www.amazon.com/s?k=${query}`, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{book.title}</DialogTitle>
          <p className="text-sm text-slate-500">by {book.author}</p>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-[150px] h-[225px] bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
              {book.coverImage && book.coverImage !== "/placeholder.jpg" && !imageError ? (
                <Image
                  src={book.coverImage || "/placeholder.svg"}
                  alt={`Cover of ${book.title}`}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  sizes="150px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-slate-600">
                  <BookOpen className="h-12 w-12 text-slate-400 mb-2" />
                  <span className="block text-xs mt-2">{book.title}</span>
                </div>
              )}
            </div>

            <div className="flex-grow">
              <h4 className="font-medium text-sm text-slate-700 mb-2">Description</h4>
              <p className="text-sm text-slate-600 mb-4">{book.description}</p>

              {book.tags && book.tags.length > 0 && (
                <>
                  <h4 className="font-medium text-sm text-slate-700 mb-2">Themes</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {book.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleGoodreadsSearch} className="w-full sm:w-auto">
            <ExternalLink className="h-4 w-4 mr-2" />
            Goodreads
          </Button>
          <Button onClick={handleAmazonSearch} className="w-full sm:w-auto">
            <ExternalLink className="h-4 w-4 mr-2" />
            Find Book
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

