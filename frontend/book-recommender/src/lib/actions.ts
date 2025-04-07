"use server"

import type { Book } from "@/components/book-recommendation-app"

// Function to send image to external API and get book recommendations
export async function getBookRecommendations(imageDataUrl: string): Promise<{
  books: Book[]
  analysis: string | null
}> {
  try {
    // Convert base64 data URL to blob
    const base64Data = imageDataUrl.split(",")[1]
    const binaryData = Buffer.from(base64Data, "base64")

    // Create form data
    const formData = new FormData()
    const blob = new Blob([binaryData], { type: "image/jpeg" })
    formData.append("image", blob, "image.jpg")

    console.log("Sending image to API...")
    // Send request to the API
    const response = await fetch("https://valthefirst.pythonanywhere.com/image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    // Parse the response text
    const responseText = await response.text()
    console.log("API Response:", responseText)

    // Extract analysis from the response
    const analysis = extractImageAnalysis(responseText)

    // Parse the response into book recommendations
    let books: Book[] = []
    try {
      books = await parseApiResponse(responseText)
      console.log("Parsed books with covers:", books.length)
    } catch (parseError) {
      console.error("Error parsing book recommendations:", parseError)
      // Ensure we have a valid books array even if parsing fails
      books = []
    }

    // Ensure we always return a valid books array
    return { 
      books: Array.isArray(books) ? books : [], 
      analysis 
    }
  } catch (error) {
    console.error("Error analyzing image:", error)
    return { books: [], analysis: null } // Return empty results
  }
}

// Function to extract image analysis from the API response
function extractImageAnalysis(responseText: string): string | null {
  try {
    // Look for the analysis paragraph before book recommendations
    // This pattern matches text between the beginning of the response and the first book recommendation
    const analysisMatch = responseText.match(/^([\s\S]*?)(?=\* \*|$)/)

    if (analysisMatch && analysisMatch[1]) {
      // Clean up the analysis text
      let analysis = analysisMatch[1]
        .replace(/\\n/g, "\n") // Replace escaped newlines
        .replace(/^"/, "") // Remove leading quote if present
        .trim()

      // Remove common prefixes with more flexible regex patterns
      analysis = analysis
        // Remove "Here's an analysis of the image and book recommendations:" or similar phrases
        .replace(/^Here's an analysis of the image(?: and book recommendations)?:?\s*/i, "")
        // Remove any remaining "and book recommendations" phrase
        .replace(/and book recommendations:?\s*/i, "")
        .trim()

      return analysis
    }

    return null
  } catch (error) {
    console.error("Error extracting image analysis:", error)
    return null
  }
}

// Function to generate a unique ID
function generateUniqueId(prefix: string, index: number, title: string): string {
  // Create a unique ID based on the prefix, index, and a hash of the title
  const titleHash = title.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)

  return `${prefix}-${index}-${titleHash}`
}

// Function to parse the API response text into book objects
async function parseApiResponse(responseText: string): Promise<Book[]> {
  try {
    // Extract themes from the response
    const themesMatch = responseText.match(
      /\*\*Themes and Emotional Tone:\*\*\n([\s\S]*?)(?=\n\n\*\*Book Suggestions:|$)/,
    )
    const themes = themesMatch
      ? themesMatch[1]
          .split("\n")
          .map((line) => line.replace(/^\*\s+/, "").trim())
          .filter(Boolean)
      : []

    // Updated regex to handle escaped newlines and proper book separation
    const regex = /\\* \*([^*]+)\* by \*([^*]+)\*: ([^]*?)(?=\\n\* \*|$)/g
    let match
    let index = 0
    const bookData = []

    // First, extract all book data
    while ((match = regex.exec(responseText)) !== null) {
      const title = match[1].trim()
      const author = match[2].trim()

      // Clean up description by removing trailing book entries, escaped characters, and any trailing quotes
      let description = match[3]
        .replace(/\\n\* \*/g, "")
        .replace(/\\n/g, "\n")
        .trim()

      // Remove any trailing quote marks (both single and double quotes)
      description = description.replace(/['"]+$/, "")

      bookData.push({
        index: index++,
        title,
        author,
        description,
      })
    }

    // If no books were found, return an empty array
    if (bookData.length === 0) {
      console.warn("No book data found in the API response")
      return []
    }

    // Then create promises to fetch book covers
    const bookPromises = bookData.map(({ index, title, author, description }) => {
      return fetchBookCover(title, author).then((coverUrl) => {
        return {
          id: generateUniqueId("book", index, title),
          title,
          author,
          coverImage: coverUrl,
          description,
          tags: themes,
        }
      })
    })

    // Wait for all book cover fetches to complete
    const resolvedBooks = await Promise.all(bookPromises)
    return resolvedBooks
  } catch (error) {
    console.error("Error parsing API response:", error)
    return [] // Return empty array on error
  }
}

// Function to fetch book cover from Google Books API
async function fetchBookCover(title: string, author: string): Promise<string> {
  try {
    // Create a search query for Google Books API
    const query = encodeURIComponent(`intitle:${title} inauthor:${author}`)
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`

    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`Google Books API responded with status: ${response.status} for "${title}"`)
      // Try Open Library as a fallback
      return fetchOpenLibraryCover(title, author)
    }

    const data = await response.json()

    // Check if we got any results
    if (data.totalItems > 0 && data.items && data.items[0].volumeInfo.imageLinks) {
      // Get the thumbnail image URL
      let imageUrl = data.items[0].volumeInfo.imageLinks.thumbnail || data.items[0].volumeInfo.imageLinks.smallThumbnail

      // Replace http with https if needed
      if (imageUrl && imageUrl.startsWith("http:")) {
        imageUrl = imageUrl.replace("http:", "https:")
      }

      // Return the image URL or a placeholder if not found
      return imageUrl || "/placeholder.jpg"
    }

    // If no image found, try Open Library as a fallback
    return fetchOpenLibraryCover(title, author)
  } catch (error) {
    console.error(`Error fetching cover for "${title}":`, error)
    // Try Open Library as a fallback
    return fetchOpenLibraryCover(title, author)
  }
}

// Fallback function to fetch book cover from Open Library
async function fetchOpenLibraryCover(title: string, author: string): Promise<string> {
  try {
    // Create a search query for Open Library
    const query = encodeURIComponent(`title:${title} author:${author}`)
    const url = `https://openlibrary.org/search.json?q=${query}&limit=1`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Open Library API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Check if we got any results
    if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
      const coverId = data.docs[0].cover_i
      // Use the cover ID to construct the image URL (large size)
      return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    }

    // If still no image found, return placeholder
    return "/placeholder.jpg"
  } catch (error) {
    console.error(`Error fetching Open Library cover for "${title}":`, error)
    return "/placeholder.jpg"
  }
}

