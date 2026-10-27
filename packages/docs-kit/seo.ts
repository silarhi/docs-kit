/** Size of the social image of every page, the one Open Graph recommends. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 }

/**
 * Path of the social image of a docs entry, served by the `og/[...route]` route.
 *
 * The home page has the empty id: it gets `index`, since a route parameter cannot be empty.
 */
export const ogImagePath = (id: string) => `/og/${id === '' ? 'index' : id}.png`
