import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('bg-red-500', 'text-white')
    expect(result).toContain('bg-red-500')
    expect(result).toContain('text-white')
  })

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden')
    expect(result).toContain('base')
    expect(result).toContain('conditional')
    expect(result).not.toContain('hidden')
  })

  it('should override conflicting tailwind classes', () => {
    const result = cn('p-4', 'p-2')
    expect(result).toContain('p-2')
  })

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'active')
    expect(result).toContain('base')
    expect(result).toContain('active')
  })

  it('should handle empty strings', () => {
    const result = cn('base', '', 'active')
    expect(result).toContain('base')
    expect(result).toContain('active')
  })
})
