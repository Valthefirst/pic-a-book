import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

interface ImageAnalysisSectionProps {
  analysis: string
}

export function ImageAnalysisSection({ analysis }: ImageAnalysisSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-800">Image Analysis</h2>
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-start">
            <div className="hidden sm:block mt-1">
              <div className="p-2 bg-slate-100 rounded-full">
                <BookOpen className="h-5 w-5 text-slate-500" />
              </div>
            </div>
            <div>
              <p className="text-slate-700">{analysis}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

