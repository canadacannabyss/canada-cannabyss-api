import { slugifyString } from '../strings/slug'
import Tag from '../../models/tag/Tag'

export async function getTag(tag: string): Promise<any> {
  try {
    const tagObj = await Tag.findOne({
      tagName: tag,
    })
    console.log('tagObj:', tagObj)
    if (tagObj === null) {
      return {}
    }
    return tagObj._id
  } catch (err) {
    console.log(err)
    return {}
  }
}

export async function createTag(tag: string) {
  const slug = slugifyString(tag)
  const newTag = new Tag({
    tagName: tag,
    slug,
    howManyViewed: 0,
    description: 'Description',
    seo: {
      title: tag,
      slug,
      description: 'Seo Description',
    },
  })
  const newTagCreated = await newTag.save()
  return newTagCreated._id
}
