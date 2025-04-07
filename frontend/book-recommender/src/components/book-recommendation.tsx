"use client"

import type { Book } from "@/components/book-recommendation-app"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface BookRecommendationProps {
  book: Book
  onViewDetails: (book: Book) => void
}

export function BookRecommendation({ book, onViewDetails }: BookRecommendationProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative aspect-[2/3] w-full bg-slate-100">
        {book.coverImage && book.coverImage !== "/placeholder.jpg" && !imageError ? (
          <Image
            src={book.coverImage || "/placeholder.svg"}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-slate-600">
            {book.title}
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-semibold text-lg line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-sm text-slate-500 mb-2">by {book.author}</p>
        <p className="text-sm text-slate-700 line-clamp-3 mb-3">{book.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full" size="sm" onClick={() => onViewDetails(book)}>
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}

