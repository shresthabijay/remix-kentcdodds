import * as React from 'react'
import {images} from '../../images'
import {H2} from '../typography'
import {ArrowLink} from '../arrow-button'
import {Grid} from '../grid'
import {DiscordLogo} from '../icons/discord-logo'

function DiscordSection() {
  return (
    <Grid>
      <div className="flex flex-col col-span-full justify-center mt-12 lg:col-span-5 lg:mt-0">
        <div className="text-black dark:text-white">
          <DiscordLogo />
        </div>

        <H2 className="mt-12">
          Do you want to meet like minded people that face the same challenges?
        </H2>
        <H2 variant="secondary" className="mt-8" as="p">
          Join the discord and learn to get better at react together.
        </H2>

        <ArrowLink to="/discord" direction="right" className="mt-20">
          Learn more about the discord
        </ArrowLink>
      </div>

      <div className="relative hidden lg:block lg:col-span-6 lg:col-start-7">
        <div className="aspect-w-3 aspect-h-4 w-full h-full">
          <img
            className="w-full h-full rounded-lg object-cover"
            src={images.kentCodingWithKody()}
            alt={images.kentCodingWithKody.alt}
          />
        </div>
        <div className="absolute -left-12 -top-6 flex flex-col space-y-1">
          <div className="self-start px-12 py-6 text-blue-500 text-lg bg-blue-100 rounded-full">
            Want to learn react together?
          </div>
          <div className="self-start px-12 py-6 text-blue-500 text-lg bg-blue-100 rounded-full">
            Let me know{' '}
            <span role="img" aria-label="victory hand emoji">
              ✌️
            </span>
          </div>
        </div>

        <div className="absolute -bottom-6 -right-12 flex flex-col text-right space-y-1">
          <div className="self-end px-12 py-6 text-green-500 text-lg bg-green-100 rounded-full">
            Sure thing man, let’s do it!
          </div>
          <div className="self-end px-12 py-6 text-green-500 text-lg bg-green-100 rounded-full">
            Found some cool articles on the blog{' '}
            <span role="img" aria-label="technologist emoji">
              🧑‍💻
            </span>
          </div>
        </div>
      </div>
    </Grid>
  )
}

export {DiscordSection}
