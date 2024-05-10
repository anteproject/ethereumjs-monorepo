import {
  bigIntToUnpaddedBytes,
  EthersProvider,
  fetchFromProvider,
  getProvider,
} from '@ethereumjs/util'
import { TransactionBaseReceipt } from './baseReceipt'
import { ReceiptValuesArray, TransactionType } from './types'

export class FeeMarketEIP1559TransactionReceipt extends TransactionBaseReceipt<TransactionType.FeeMarketEIP1559> {
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
        statusOrState: false,
        cumulativeGasUsed: BigInt(0),
        logs: [],
        logsBloom: new Uint8Array(0),
      })
    }

    this.setData({
      txHash: this.txHash,
      type: response.type,
      statusOrState: BigInt(response.status !== undefined ? response.status : 0) > 0n,
      cumulativeGasUsed: BigInt(response.cumulativeGasUsed),
      logs: response.logs,
      logsBloom: response.logsBloom,
    })
  }
  raw(): ReceiptValuesArray[TransactionType.FeeMarketEIP1559] {
    return [
      bigIntToUnpaddedBytes(this.statusOrState ? 1n : 0n),
      bigIntToUnpaddedBytes(this.cumulativeGasUsed),
      this.logsBloom,
      this.rawLogs(),
    ]
  }
}
