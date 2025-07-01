import { describe, it, expect } from 'vitest'
import { 
  resetTx, 
  createTxFromChaseCSV, 
  createTxFromPlaidTx,
  organizeTxByTime,
  getScopeIndex
} from '@/util/tx'
import type { TxInDB, ChaseCSVTx } from '@/types/tx'
import type { Transaction } from 'plaid'

describe('Transaction Processing Logic', () => {
  describe('resetTx', () => {
    it('should reset transaction to default state', () => {
      const mockTx: TxInDB = {
        id: 'tx-1',
        userId: 'user-1',
        amount: 100.50,
        name: 'Test Transaction',
        plaidTx: { category: ['Food', 'Restaurant'] } as Transaction,
        splitArray: [],
        catArray: [],
        receipt: null,
        recurring: true,
        MDS: 5,
        datetime: new Date(),
        authorizedDatetime: new Date(),
        userTotal: 100,
        originTxId: 'origin-1',
        plaidId: 'plaid-1',
        accountId: 'account-1'
      }

      const result = resetTx(mockTx)

      expect(result.splitArray).toHaveLength(1)
      expect(result.splitArray[0].amount).toBe(100.50)
      expect(result.splitArray[0].userId).toBe('user-1')
      expect(result.catArray).toHaveLength(1)
      expect(result.catArray[0].amount).toBe(100.50)
      expect(result.receipt).toBeNull()
    })
  })

  describe('createTxFromChaseCSV', () => {
    it('should create transaction from Chase CSV data', () => {
      const chaseCSVTx: ChaseCSVTx = {
        PostingDate: '01/16/2024', 
        Description: 'STARBUCKS COFFEE',
        Type: 'Sale',
        Amount: '-5.67',
        Balance: '1234.56',
        CheckorSlip: '',
        Details: ''
      }

      const result = createTxFromChaseCSV(chaseCSVTx, 'user-1')

      expect(result.name).toBe('STARBUCKS COFFEE')
      expect(result.amount).toBe(-5.67)
      expect(result.userId).toBe('user-1')
      expect(result.authorizedDatetime).toEqual(new Date('01/16/2024'))
      expect(result.splitArray).toHaveLength(1)
      expect(result.splitArray[0].amount).toBe(-5.67)
      expect(result.catArray).toHaveLength(1)
      expect(result.plaidTx).toBeNull()
    })
  })

  describe('createTxFromPlaidTx', () => {
    it('should create transaction from Plaid transaction data', () => {
      const plaidTx: Transaction = {
        transaction_id: 'plaid-tx-1',
        account_id: 'account-1',
        name: 'Amazon Purchase',
        amount: 29.99,
        category: ['Shops', 'Digital Purchase'],
        authorized_date: '2024-01-15',
        datetime: '2024-01-15T10:30:00Z'
      } as Transaction

      const result = createTxFromPlaidTx('user-1', plaidTx)

      expect(result.name).toBe('Amazon Purchase')
      expect(result.amount).toBe(29.99)
      expect(result.plaidId).toBe('plaid-tx-1')
      expect(result.accountId).toBe('account-1')
      expect(result.splitArray).toHaveLength(1)
      expect(result.catArray).toHaveLength(1)
              expect(result.catArray[0].name).toBe('Digital Purchase')
    })

    it('should handle missing datetime in Plaid transaction', () => {
      const plaidTx: Transaction = {
        transaction_id: 'plaid-tx-2',
        account_id: 'account-1',
        name: 'Gas Station',
        amount: 45.00,
        category: ['Transportation', 'Gas Stations'],
        authorized_date: '2024-01-15'
        // no datetime field
      } as Transaction

      const result = createTxFromPlaidTx('user-1', plaidTx)

      expect(result.datetime).toBeNull()
      expect(result.authorizedDatetime).toEqual(new Date('2024-01-15'))
    })
  })

  describe('organizeTxByTime', () => {
    it('should organize transactions by year/month/date hierarchy', () => {
      const txArray: TxInDB[] = [
        {
          id: 'tx-1',
          authorizedDatetime: new Date('2024-01-15'),
          amount: 10,
          userId: 'user-1',
          name: 'Transaction 1'
        } as TxInDB,
        {
          id: 'tx-2', 
          authorizedDatetime: new Date('2024-01-15'),
          amount: 20,
          userId: 'user-1',
          name: 'Transaction 2'
        } as TxInDB,
        {
          id: 'tx-3',
          authorizedDatetime: new Date('2024-02-10'),
          amount: 30,
          userId: 'user-1', 
          name: 'Transaction 3'
        } as TxInDB
      ]

      const result = organizeTxByTime(txArray)

      // Should have one year
      expect(result).toHaveLength(1)
      
      // Should have two months (February first, then January due to sorting)
      expect(result[0]).toHaveLength(2)
      
      // February (index 0) should have one date with one transaction
      expect(result[0][0]).toHaveLength(1) 
      expect(result[0][0][0]).toHaveLength(1)
      
      // January (index 1) should have one date with two transactions
      expect(result[0][1]).toHaveLength(1)
      expect(result[0][1][0]).toHaveLength(2)
    })

    it('should sort transactions by most recent first', () => {
      const txArray: TxInDB[] = [
        {
          id: 'tx-old',
          authorizedDatetime: new Date('2024-01-01'),
          amount: 10,
          userId: 'user-1',
          name: 'Old Transaction'
        } as TxInDB,
        {
          id: 'tx-new',
          authorizedDatetime: new Date('2024-01-15'),
          amount: 20,
          userId: 'user-1',
          name: 'New Transaction'
        } as TxInDB
      ]

      const result = organizeTxByTime(txArray)
      
      // Most recent transaction should be first in the date array
      expect(result[0][0][0][0].id).toBe('tx-new')
      expect(result[0][0][1][0].id).toBe('tx-old')
    })
  })

  describe('getScopeIndex', () => {
    const mockTxArray: TxInDB[][][][] = [
      [ // Year 2024
        [ // January
          [ // Day 15
            { 
              authorizedDatetime: new Date('2024-01-14'), // -1 day adjustment in function
              id: 'tx-1'
            } as TxInDB
          ]
        ],
        [ // February  
          [
            {
              authorizedDatetime: new Date('2024-02-09'), // -1 day adjustment
              id: 'tx-2'
            } as TxInDB
          ]
        ]
      ]
    ]

    it('should find correct year index', () => {
      const [y, m, d] = getScopeIndex(
        mockTxArray,
        new Date('2024-06-15'),
        'year'
      )

      expect(y).toBe(0)
      expect(m).toBe(-1) // Not looking for month
      expect(d).toBe(-1) // Not looking for date
    })

    it('should find correct month index', () => {
      const [y, m, d] = getScopeIndex(
        mockTxArray,
        new Date('2024-02-15'),
        'month'
      )

      expect(y).toBe(0)
      expect(m).toBe(1) // February is index 1
      expect(d).toBe(-1) // Not looking for date
    })

    it('should return -1 for non-existent year', () => {
      const [y, m, d] = getScopeIndex(
        mockTxArray,
        new Date('2023-01-15'),
        'year'
      )

      expect(y).toBe(-1)
      expect(m).toBe(-1)
      expect(d).toBe(-1)
    })

    it('should handle empty transaction array', () => {
      const [y, m, d] = getScopeIndex([], new Date('2024-01-15'), 'month')

      expect(y).toBe(-1)
      expect(m).toBe(-1)
      expect(d).toBe(-1)
    })
  })
})