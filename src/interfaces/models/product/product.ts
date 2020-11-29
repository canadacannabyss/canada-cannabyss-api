import { Document } from 'mongoose'
import { IReseller } from '../reseller/reseller'
import { IPromotion } from '../promotion/promotion'

export interface IProduct extends Document {
  _id: string
  reseller: IReseller
  // media: IProductMedia[]
  productName: string
  slug: string
  description: string
  howManyViewed: number
  howManyBought: number
  prices: {
    price: number
    compareTo: number
  }
  taxableProduct: boolean
  extraInfo: [
    {
      title: string
      description: string
    },
  ]
  inventory: {
    sku: string
    barcode: string
    quantity: number
    allowPurchaseOutOfStock: boolean
  }
  shipping: {
    physicalProduct: boolean
    weight: {
      unit: string
      amount: number
    }
  }
  variants: {
    variantsOptionNames: string[]
    values: []
  }
  seo: {
    title: string
    slug: string
    description: string
  }
  organization: {
    // categories: ICategory[]
    // tags: ITag[]
  }
  deletion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}
