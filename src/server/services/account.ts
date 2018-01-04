import * as utils from "ethereumjs-util"

import { Account } from "../db"

class AccountService {
  create(id, email, nickname, sig): Promise<any> {
    if (id === this.getAddressFromSignature(sig)) {
      return Account.findOne({ where: { id } })
        .then((account) => {
          if (account) {
            return false
          }

          return Account.count({ where: { nickname } })
            .then((count) =>
              Account.create({ id, email, nickname, nicknameOccurrence: (count + 1) })
            )
        })
    }

    return Promise.resolve(false)
  }

  login(id, sig): Promise<any> {
    if (id === this.getAddressFromSignature(sig)) {
      return Account.findOne({ where: { id } })
        .then((account) => account ? account : false)
    }

    return Promise.resolve(false)
  }

  getById(id): Promise<any> {
    return Account.findById(id)
  }

  private getAddressFromSignature(sig): string {
    let recoveredAddress

    try {
      const res = utils.fromRpcSig(sig)

      const msg = utils.hashPersonalMessage(utils.toBuffer("ETH.gallery"))

      const pub = utils.ecrecover(msg, res.v, res.r, res.s)

      recoveredAddress = '0x' + utils.pubToAddress(pub).toString('hex')
    }
    catch (err) {
      console.error(err)
    }

    return recoveredAddress
  }
}

export const accountService = new AccountService()
