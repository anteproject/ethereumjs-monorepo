import { bytesToBigInt, concatBytes, EthersProvider, toBytes } from '@ethereumjs/util'
import { TransactionType, ReceiptData, ReceiptValuesArray, Log, LogsBytes } from './types'
import { RLP } from '@ethereumjs/rlp'
import { txTypeBytes } from './util'

export function getEmptyReceiptData(txHash?: string): ReceiptData {
  return {
    txHash: txHash === undefined ? '' : txHash,
    type: new Uint8Array(0),
    statusOrState: false,
    cumulativeGasUsed: new Uint8Array(0),
    logs: [],
    logsBloom: new Uint8Array(0),
  }
}

export abstract class TransactionBaseReceipt<T extends TransactionType = TransactionType> {
  txHash: string
  type: TransactionType
  statusOrState: boolean
  cumulativeGasUsed: bigint
  logs: Log[]
  logsBloom: Uint8Array
  depositNonce?: bigint
  constructor(receiptData: ReceiptData) {
    this.txHash = receiptData.txHash
    this.type = Number(bytesToBigInt(toBytes(receiptData.type)))
    this.statusOrState = receiptData.statusOrState
    this.cumulativeGasUsed = bytesToBigInt(toBytes(receiptData.cumulativeGasUsed))
    this.logs = receiptData.logs
    this.logsBloom = toBytes(receiptData.logsBloom)
    this.depositNonce =
      receiptData.depositNonce !== undefined
        ? bytesToBigInt(toBytes(receiptData.depositNonce))
        : undefined
  }

  hasData(): boolean {
    return (
      this.cumulativeGasUsed !== BigInt(0) || this.logs.length !== 0 || this.logsBloom.length !== 0
    )
  }

  setTxHash(txHash: string): void {
    this.txHash = txHash
    // initialize with empty values
    this.type = 0
    this.statusOrState = false
    this.cumulativeGasUsed = BigInt(0)
    this.logs = []
    this.logsBloom = new Uint8Array(0)
  }

  abstract loadData(provider: EthersProvider | string): Promise<void>
  // {
  //  if (this.txHash === undefined) throw new Error('Transaction hash is undefined');
  //  const receiptFromProvider = await TransactionBaseReceipt.fromRpcProvider(this.txHash, provider);
  //  this.setData(receiptFromProvider);
  // }

  setData(receiptData: ReceiptData): void {
    this.type = Number(bytesToBigInt(toBytes(receiptData.type)))
    this.statusOrState = receiptData.statusOrState
    this.cumulativeGasUsed = bytesToBigInt(toBytes(receiptData.cumulativeGasUsed))
    this.logs = receiptData.logs
    this.logsBloom = toBytes(receiptData.logsBloom)
    this.depositNonce =
      receiptData.depositNonce !== undefined
        ? bytesToBigInt(toBytes(receiptData.depositNonce))
        : undefined
  }

  abstract raw(): ReceiptValuesArray[T]

  rawLogs(): LogsBytes {
    const logs: LogsBytes = this.logs.map((log: Log) => {
      return [toBytes(log.address), log.topics.map((topic) => toBytes(topic)), toBytes(log.data)]
    })
    return logs
  }

  serialize(): Uint8Array {
    return concatBytes(txTypeBytes(this.type), RLP.encode(this.raw()))
  }
}
