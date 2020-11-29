import { slugifyString } from '../strings/slug'

import Category from '../../models/category/Category'

export async function getCategory(category: string): Promise<any> {
  console.log('getCategory:', category)
  try {
    const categoryObj = await Category.findOne({
      categoryName: category,
    })
    if (categoryObj === null) {
      return {}
    }
    return categoryObj._id
  } catch (err) {
    console.log(err)
    return {}
  }
}

export async function createCategory(
  category: string,
  reseller: string,
): Promise<any> {
  const slug = slugifyString(category)
  const newCategory = new Category({
    reseller,
    categoryName: category,
    slug,
    howManyViewed: 0,
    description: 'Description',
    seo: {
      title: category,
      slug,
      description: 'Seo Description',
    },
  })
  const newCategoryCreated = await newCategory.save()
  return newCategoryCreated._id
}
