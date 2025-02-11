import * as React from 'react'
import {useParams} from 'react-router-dom'
import type {KCDLoader} from 'types'
import {useCallKentEpisodes} from '../../utils/providers'
import {getEpisodes} from '../../utils/transistor.server'
import {Themed} from '../../utils/theme-provider'

export const loader: KCDLoader<{
  slug: string
}> = async ({params, request}) => {
  const episodes = await getEpisodes(request)
  const episode = episodes.find(e => e.slug === params.slug)
  if (!episode) {
    // TODO: 404
    throw new Error(`oh no. no call kent episode for ${params.slug}`)
  }
  // we already load all the episodes in the parent route so it would be
  // wasteful to send it here. The parent sticks all the episodes in context
  // so we just use it in the component.
  // This loader is only here for the 404 case we need to handle.
  return null
}

export default function Screen() {
  const params = useParams() as {slug: string}
  const episodes = useCallKentEpisodes()
  const episode = episodes.find(e => e.slug === params.slug)

  if (!episode) {
    return <div>Oh no... No episode found with this slug: {params.slug}</div>
  }

  return (
    <Themed
      dark={
        <div
          dangerouslySetInnerHTML={{
            __html: episode.embedHtmlDark,
          }}
        />
      }
      light={
        <div
          dangerouslySetInnerHTML={{
            __html: episode.embedHtml,
          }}
        />
      }
    />
  )
}
