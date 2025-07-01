import { describe, it, expect } from 'vitest'
import { parseMoney } from '@/util/parseMoney'

describe('parseMoney', () => {
  it('should parse money values with proper precision', () => {
    expect(parseMoney(10.5)).toBe(10.5)
    expect(parseMoney(10.55)).toBe(10.55)
    expect(parseMoney(10.555)).toBe(10.55)  // toFixed rounds 10.555 to 10.55
    expect(parseMoney(10.554)).toBe(10.55)
  })

  it('should handle whole numbers', () => {
    expect(parseMoney(10)).toBe(10)
    expect(parseMoney(0)).toBe(0)
    expect(parseMoney(100)).toBe(100)
  })

  it('should handle negative values', () => {
    expect(parseMoney(-10.5)).toBe(-10.5)
    expect(parseMoney(-10.555)).toBe(-10.55)  // toFixed rounds -10.555 to -10.55
    expect(parseMoney(-0.001)).toBe(-0)  // JavaScript -0 vs 0 distinction
  })

  it('should handle very small values', () => {
    expect(parseMoney(0.001)).toBe(0)
    expect(parseMoney(0.004)).toBe(0)
    expect(parseMoney(0.005)).toBe(0.01)
    expect(parseMoney(0.009)).toBe(0.01)
  })

  it('should handle floating point precision issues', () => {
    expect(parseMoney(0.1 + 0.2)).toBe(0.3)
    expect(parseMoney(1.005)).toBe(1)      // toFixed rounds 1.005 to 1.00
    expect(parseMoney(2.675)).toBe(2.67)   // toFixed rounds 2.675 to 2.67
  })

  it('should handle large numbers', () => {
    expect(parseMoney(999999.999)).toBe(1000000)
    expect(parseMoney(123456.789)).toBe(123456.79)
  })
})