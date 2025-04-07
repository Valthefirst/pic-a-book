"use client"

import { useState } from "react"
import Image from "next/image"
import { X, Loader2, BookOpen, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookRecommendation } from "@/components/book-recommendation"
import { BookDetailsModal } from "@/components/book-details-modal"
import { ImageUploader } from "@/components/image-uploader"
import { ImageAnalysisSection } from "@/components/image-analysis-section"
import { getBookRecommendations } from "@/lib/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function BookRecommendationApp() {
  const [image, setImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendations, setRecommendations] = useState<Book[]>([])
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleImageUpload = (imageDataUrl: string) => {
    setImage(imageDataUrl)
    setRecommendations([])
    setImageAnalysis(null)
    setError(null)
  }

  const handleClearImage = () => {
    setImage(null)
    setRecommendations([])
    setImageAnalysis(null)
    setError(null)
  }

  const analyzeImage = async () => {
    if (!image) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await getBookRecommendations(image)
      console.log("Books received from API:", result.books)
      console.log("Analysis received from API:", result.analysis)

      setRecommendations(result.books)
      setImageAnalysis(result.analysis)
    } catch (err) {
      console.error("Error analyzing image:", err)
      setError("Failed to analyze the image. Please try again or try a different image.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleViewDetails = (book: Book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="grid gap-8">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {!image ? (
            <ImageUploader onImageUpload={handleImageUpload} />
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                  <Image src={image || "/placeholder.svg"} alt="Uploaded image" fill className="object-contain" />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                  onClick={handleClearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center">
                <Button onClick={analyzeImage} disabled={isAnalyzing} className="w-full sm:w-auto">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Get Book Recommendations
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {imageAnalysis && <ImageAnalysisSection analysis={imageAnalysis} />}

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-800">Recommended Books</h2>
          <p className="text-slate-600">Based on your image, we think you might enjoy these books:</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((book) => (
              <BookRecommendation key={book.id} book={book} onViewDetails={handleViewDetails} />
            ))}
          </div>
        </div>
      )}

      <BookDetailsModal book={selectedBook} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}

export interface Book {
  id: string
  title: string
  author: string
  coverImage: string
  description: string
  tags?: string[]
}

