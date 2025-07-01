import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useDateRange from '@/util/useDateRange'

// Mock the store
const mockUseStore = vi.fn()
vi.mock('@/util/store', () => ({
  useStore: mockUseStore,
}))

describe('useDateRange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with current date when no initial date in store', () => {
    mockUseStore.mockReturnValue(null)
    
    const { result } = renderHook(() => useDateRange())
    
    expect(result.current.date).toBeInstanceOf(Date)
    expect(result.current.rangeFormat).toBe('month')
  })

  it('should initialize with date from store when available', () => {
    const testDate = '2023-06-15T10:30:00.000Z'
    mockUseStore.mockReturnValue(testDate)
    
    const { result } = renderHook(() => useDateRange())
    
    expect(result.current.date).toEqual(new Date(testDate))
    expect(result.current.rangeFormat).toBe('month')
  })

  it('should update date when setDate is called', () => {
    mockUseStore.mockReturnValue(null)
    
    const { result } = renderHook(() => useDateRange())
    const newDate = new Date('2023-12-25')
    
    act(() => {
      result.current.setDate(newDate)
    })
    
    expect(result.current.date).toEqual(newDate)
  })

  it('should update rangeFormat when setRangeFormat is called', () => {
    mockUseStore.mockReturnValue(null)
    
    const { result } = renderHook(() => useDateRange())
    
    act(() => {
      result.current.setRangeFormat('year')
    })
    
    expect(result.current.rangeFormat).toBe('year')
  })

  it('should support all range format options', () => {
    mockUseStore.mockReturnValue(null)
    
    const { result } = renderHook(() => useDateRange())
    
    const formats: Array<"date" | "month" | "year" | "all"> = ['date', 'month', 'year', 'all']
    
    formats.forEach(format => {
      act(() => {
        result.current.setRangeFormat(format)
      })
      expect(result.current.rangeFormat).toBe(format)
    })
  })

  it('should update date when store datetime changes', () => {
    const initialDate = '2023-01-01T00:00:00.000Z'
    const updatedDate = '2023-06-15T12:00:00.000Z'
    
    // Start with initial date
    mockUseStore.mockReturnValue(initialDate)
    
    const { result, rerender } = renderHook(() => useDateRange())
    
    expect(result.current.date).toEqual(new Date(initialDate))
    
    // Update store to return new date
    mockUseStore.mockReturnValue(updatedDate)
    
    // Rerender to trigger useEffect
    rerender()
    
    expect(result.current.date).toEqual(new Date(updatedDate))
  })

  it('should not update date when store datetime is null or undefined', () => {
    const initialDate = '2023-01-01T00:00:00.000Z'
    
    // Start with initial date
    mockUseStore.mockReturnValue(initialDate)
    
    const { result, rerender } = renderHook(() => useDateRange())
    
    const originalDate = result.current.date
    
    // Update store to return null
    mockUseStore.mockReturnValue(null)
    
    // Rerender to trigger useEffect
    rerender()
    
    // Date should remain the same
    expect(result.current.date).toEqual(originalDate)
  })

  it('should return all expected properties', () => {
    mockUseStore.mockReturnValue(null)
    
    const { result } = renderHook(() => useDateRange())
    
    expect(result.current).toHaveProperty('date')
    expect(result.current).toHaveProperty('setDate')
    expect(result.current).toHaveProperty('rangeFormat')
    expect(result.current).toHaveProperty('setRangeFormat')
    
    expect(typeof result.current.setDate).toBe('function')
    expect(typeof result.current.setRangeFormat).toBe('function')
  })

  it('should handle invalid date strings gracefully', () => {
    const invalidDate = 'invalid-date-string'
    mockUseStore.mockReturnValue(invalidDate)
    
    const { result } = renderHook(() => useDateRange())
    
    // Should create a date object, even if invalid
    expect(result.current.date).toBeInstanceOf(Date)
    // Invalid dates have NaN as time value
    expect(isNaN(result.current.date.getTime())).toBe(true)
  })
})