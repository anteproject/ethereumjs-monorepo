import {
  bigIntToUnpaddedBytes,
  EthersProvider,
  fetchFromProvider,
  getProvider,
  toBytes,
} from '@ethereumjs/util'
import { TransactionBaseReceipt } from './baseReceipt.js'
import { ReceiptValuesArray, TransactionType } from './types.js'

export class DepositL2TransactionReceipt extends TransactionBaseReceipt<TransactionType.DepositL2> {
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
      depositNonce: response.depositNonce !== undefined ? BigInt(response.depositNonce) : undefined,
    })
  }
  raw(): ReceiptValuesArray[TransactionType.DepositL2] {
    return [
      bigIntToUnpaddedBytes(this.statusOrState ? 1n : 0n),
      bigIntToUnpaddedBytes(this.cumulativeGasUsed),
      this.logsBloom,
      this.rawLogs(),
      toBytes(
        this.depositNonce !== undefined && this.depositNonce > 0n
          ? this.depositNonce
          : new Uint8Array()
      ),
      toBytes(this.depositNonce !== undefined ? 1 : 0),
    ]
  }
}
