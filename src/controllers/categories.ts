import { Request, Response } from 'express'

import Category from '../models/category/Category'
import CategoryMedia from '../models/category/CategoryMedia'

export async function index(req: Request, res: Response) {
  const categoriesList = []
  Category.find()
    .populate({
      path: 'media',
      model: CategoryMedia,
    })
    .then((categories) => {
      categories.map((category) => {
        console.log('category:', category)
        let categoryMediaUrl = ''
        if (category.media === null || category.media === undefined) {
          categoryMediaUrl = ''
        } else {
          categoryMediaUrl = category.media.url
        }
        categoriesList.push({
          id: category._id,
          categoryName: category.categoryName,
          slug: category.slug,
          media: {
            url: categoryMediaUrl,
          },
        })
      })
      return res.json(categoriesList)
    })
    .catch((err) => {
      console.log(err)
    })
}
