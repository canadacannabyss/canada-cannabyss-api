import { Document } from 'mongoose'
import { IAdmin } from '../admin/admin'

export interface IAcceptedPaymentMethod extends Document {
  _id: string
  admin: IAdmin
  type: string
  cryptocurrency: {
    logo: string
    symbol: string
    name: string
    address: string
    discount: {
      type: string
      amount: number
    }
  }
  eTransfer: {
    recipient: string
  }
  deletion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}
