import {
  bigIntToBytes,
  bigIntToUnpaddedBytes,
  concatBytes,
  EthersProvider,
  fetchFromProvider,
  getProvider,
  toBytes,
} from '@ethereumjs/util'
import { TransactionBaseReceipt } from './baseReceipt'
import {
  LegacyTransactionReceiptValuesArray,
  Log,
  ReceiptValuesArray,
  TransactionType,
  TypedTransactionReceiptValuesArray,
} from './types'

export class BlobEIP4844TransactionReceipt extends TransactionBaseReceipt<TransactionType.BlobEIP4844> {
  async loadData(provider: string | EthersProvider): Promise<void> {
    const providerUrl = getProvider(provider)
    const response = await fetchFromProvider(providerUrl, {
      method: 'eth_getTransactionReceipt',
      params: [this.txHash],
    })
    if (response === null) {
      // return empty transaction receipt
      this.setData({
        txHash: this.txHash,
        type: 0,
        statusOrState: BigInt(response.status ? response.status : 0) > 0n,
        cumulativeGasUsed: BigInt(0),
        logs: [],
        logsBloom: new Uint8Array(),
      })
    }
    this.setData({
      txHash: this.txHash,
      type: response.type,
      statusOrState: BigInt(response.status ? response.status : 0) > 0n,
      cumulativeGasUsed: BigInt(response.cumulativeGasUsed),
      logs: response.logs,
      logsBloom: response.logsBloom,
    })
  }
  raw(): ReceiptValuesArray[TransactionType.BlobEIP4844] {
    return [
      bigIntToUnpaddedBytes(this.statusOrState ? 1n : 0n),
      bigIntToUnpaddedBytes(this.cumulativeGasUsed),
      this.logsBloom,
      this.rawLogs(),
    ]
  }
}
