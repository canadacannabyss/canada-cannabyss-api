import slugify from 'slugify'
import uuid from 'uuid'

export function slugifyString(string: string) {
  return slugify(string).toLowerCase()
}

export async function generateRandomSlug(slug: string) {
  const id = uuid.v4()
  const generatedNewSlug = `${slug}-${id}`
  return generatedNewSlug
}
