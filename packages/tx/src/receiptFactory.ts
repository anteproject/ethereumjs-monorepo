import { getEmptyReceiptData, TransactionBaseReceipt } from './baseReceipt'
import { BaseTransaction } from './baseTransaction.js'
import { DepositL2TransactionReceipt } from './depositL2TransactionReceipt'
import { FeeMarketEIP1559TransactionReceipt } from './eip1559TransactionReceipt'
import { AccessListEIP2930TransactionReceipt } from './eip2930TransactionReceipt'
import { BlobEIP4844TransactionReceipt } from './eip4844TransactionReceipt'
import { LegacyTransactionReceipt } from './legacyTransactionReceipt'
import { Receipt, TransactionType } from './types'

export function createEmptyReceipt<T extends TransactionType>(
  type: TransactionType,
  txHash: string
): Receipt[T] {
  if (type === TransactionType.Legacy) {
    return new LegacyTransactionReceipt(getEmptyReceiptData(txHash)) as Receipt[T]
  } else if (type === TransactionType.DepositL2) {
    return new DepositL2TransactionReceipt(getEmptyReceiptData(txHash)) as Receipt[T]
  } else if (type === TransactionType.AccessListEIP2930) {
    return new AccessListEIP2930TransactionReceipt(getEmptyReceiptData(txHash)) as Receipt[T]
  } else if (type === TransactionType.BlobEIP4844) {
    return new BlobEIP4844TransactionReceipt(getEmptyReceiptData(txHash)) as Receipt[T]
  } else if (type === TransactionType.FeeMarketEIP1559) {
    return new FeeMarketEIP1559TransactionReceipt(getEmptyReceiptData(txHash)) as Receipt[T]
  } else {
    throw new Error(`Unsupported transaction type ${type}`)
  }
}
