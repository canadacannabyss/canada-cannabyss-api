import { Document } from 'mongoose'
import { IReseller } from '../reseller/reseller'
import { IPromotion } from '../promotion/promotion'

export interface IBundle extends Document {
  _id: string
  reseller: IReseller
  bannerName: string
  slug: string
  description: string
  howManyViewed: number
  promotions: IPromotion[]
  featured: boolean
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
