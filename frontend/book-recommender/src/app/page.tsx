import { BookRecommendationApp } from "@/components/book-recommendation-app"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-slate-800">Pic-a-Book</h1>
        <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
          Upload an image and discover books related to what&apos;s in your picture. Our AI analyzes your image and
          recommends relevant books.
        </p>
        <BookRecommendationApp />
      </div>
    </main>
  )
}

