// AI service for analyzing product images and barcodes
interface ProductData {
  name?: string
  category?: string
  quantity?: number
  unit?: string
  expiryDate?: string
  location?: string
  notes?: string
}

export async function analyzeProductImage(imageData: string): Promise<ProductData> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this product image or barcode and extract the following information in JSON format:
                {
                  "name": "product name",
                  "category": "one of: Fruits & Vegetables, Meat & Seafood, Dairy & Eggs, Bakery & Bread, Pantry Staples, Beverages, Frozen, Snacks, Condiments, or Other",
                  "quantity": estimated quantity as a number (default to 1 if not visible),
                  "unit": "appropriate unit: piece, kg, g, lb, oz, l, ml, cup, tbsp, tsp, package, can, or bottle",
                  "expiryDate": "expiry or best before date in YYYY-MM-DD format if visible, otherwise null",
                  "location": "suggested storage location: Fridge, Freezer, or Dry pantry",
                  "notes": "any additional relevant information like brand, flavor, etc."
                }
                
                If it's a barcode, try to identify the product. Provide your best estimate for all fields. Return ONLY valid JSON, no other text.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to analyze image')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from AI service')
    }

    // Parse the JSON response
    const parsed = JSON.parse(content)
    
    return {
      name: parsed.name || '',
      category: parsed.category || 'Other',
      quantity: parsed.quantity || 1,
      unit: parsed.unit || 'piece',
      expiryDate: parsed.expiryDate || '',
      location: parsed.location || '',
      notes: parsed.notes || '',
    }
  } catch (error) {
    console.error('Error analyzing image:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to analyze product image')
  }
}

// Convert file to base64 data URL
export async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Compress image if needed
export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions to stay under max size
        const maxDimension = 1024
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension
            width = maxDimension
          } else {
            width = (width / height) * maxDimension
            height = maxDimension
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          0.8
        )
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
