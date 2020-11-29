import { Document } from 'mongoose'
import { IReseller } from '../reseller/reseller'
import { IBundle } from '../bundle/bundle'
import { IProduct } from '../product/product'

export interface IPromotion extends Document {
  _id: string
  reseller: IReseller
  media: IPromotionMedia
  promotionName: string
  slug: string
  description: string
  howManyViewed: number
  products: IProduct[]
  bundles: IBundle[]
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

export interface IPromotionMedia extends Document {
  _id: string
  name: string
  size: number
  key: string
  url: string
  deleteion: {
    isDeleted: boolean
    when: Date | null
  }
  createdAt: Date
  updatedAt: Date | null
}
