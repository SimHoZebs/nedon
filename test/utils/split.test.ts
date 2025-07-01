import { describe, it, expect } from 'vitest'
import { createNewSplit } from '@/util/split'

describe('createNewSplit', () => {
  it('should create a split with all parameters provided', () => {
    const userId = 'user123'
    const amount = 50.25
    const txId = 'tx456'

    const split = createNewSplit(userId, amount, txId)

    expect(split).toEqual({
      userId: 'user123',
      txId: 'tx456',
      amount: 50.25,
    })
  })

  it('should create a split without txId', () => {
    const userId = 'user123'
    const amount = 75.5

    const split = createNewSplit(userId, amount)

    expect(split).toEqual({
      userId: 'user123',
      txId: null,
      amount: 75.5,
    })
  })

  it('should set txId to null when explicitly passed as undefined', () => {
    const userId = 'user123'
    const amount = 100
    const txId = undefined

    const split = createNewSplit(userId, amount, txId)

    expect(split).toEqual({
      userId: 'user123',
      txId: null,
      amount: 100,
    })
  })

  it('should handle zero amount', () => {
    const userId = 'user123'
    const amount = 0
    const txId = 'tx789'

    const split = createNewSplit(userId, amount, txId)

    expect(split).toEqual({
      userId: 'user123',
      txId: 'tx789',
      amount: 0,
    })
  })

  it('should handle negative amount', () => {
    const userId = 'user123'
    const amount = -25.75
    const txId = 'tx789'

    const split = createNewSplit(userId, amount, txId)

    expect(split).toEqual({
      userId: 'user123',
      txId: 'tx789',
      amount: -25.75,
    })
  })

  it('should handle empty string userId', () => {
    const userId = ''
    const amount = 10.5
    const txId = 'tx789'

    const split = createNewSplit(userId, amount, txId)

    expect(split).toEqual({
      userId: '',
      txId: 'tx789',
      amount: 10.5,
    })
  })

  it('should handle empty string txId', () => {
    const userId = 'user123'
    const amount = 10.5
    const txId = ''

    const split = createNewSplit(userId, amount, txId)

    expect(split).toEqual({
      userId: 'user123',
      txId: null,
      amount: 10.5,
    })
  })
})