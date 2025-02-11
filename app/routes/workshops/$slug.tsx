import * as React from 'react'
import {useRouteData, json} from 'remix'
import type {MdxPage, KCDLoader, MdxListItem} from 'types'
import formatDate from 'date-fns/format'
import {getMdxPage, mdxPageMeta} from '../../utils/mdx'
import {getScheduledEvents} from '../../utils/workshop-tickets.server'
import type {WorkshopEvent} from '../../utils/workshop-tickets.server'
import {Grid} from '../../components/grid'
import {H2, H5, H6, Paragraph} from '../../components/typography'
import {Button} from '../../components/button'
import {ArrowButton, BackLink} from '../../components/arrow-button'
import {WorkshopCard} from '../../components/workshop-card'
import {NumberedPanel} from '../../components/numbered-panel'
import {TestimonialSection} from '../../components/sections/testimonial-section'
import {FourOhFour} from '../../components/errors'
import {getBlogRecommendations} from '../../utils/blog.server'

type LoaderData = {
  page: MdxPage | null
  workshop?: WorkshopEvent
  blogRecommendations: Array<MdxListItem>
}

export const loader: KCDLoader<{slug: string}> = async ({params, request}) => {
  const page = await getMdxPage(
    {contentDir: 'workshops', slug: params.slug},
    {request},
  )
  const events = await getScheduledEvents()
  const workshop = events.find(
    ({metadata}) => metadata.workshopSlug === params.slug,
  )
  const data: LoaderData = {
    page,
    workshop,
    blogRecommendations: await getBlogRecommendations(request),
  }
  if (page) {
    return json(data)
  } else {
    return json(data, {status: 404})
  }
}

export const meta = mdxPageMeta

export default function MdxScreenBase() {
  const data = useRouteData<LoaderData>()

  if (data.page)
    return <MdxScreen mdxPage={data.page} workshop={data.workshop} />
  else return <FourOhFour articles={data.blogRecommendations} />
}

interface TopicRowProps {
  number: number
  topic: string
}

function TopicRow({number, topic}: TopicRowProps) {
  return (
    <div className="bg-secondary pb-14 pt-12 px-10 rounded-lg lg:pl-36 lg:pr-56 lg:py-12">
      <H5 className="relative">
        <span className="lg:absolute lg:-left-24 lg:block">
          {number.toString().padStart(2, '0')}.
        </span>{' '}
        {topic}
      </H5>
    </div>
  )
}

interface RegistrationPanelProps {
  workshop?: string
  totalSeats: number
  availableSeats: number
}

function RegistrationPanel({
  workshop = 'to be announced',
  availableSeats,
  totalSeats,
}: RegistrationPanelProps) {
  return (
    <div className="bg-secondary flex flex-col items-stretch pb-10 pt-12 px-10 w-full rounded-lg lg:flex-row-reverse lg:items-center lg:justify-end lg:py-8">
      <div className="mb-10 lg:mb-0 lg:ml-16">
        <div className="inline-flex items-baseline mb-10 lg:mb-2">
          <div className="block flex-none w-3 h-3 bg-green-600 rounded-full" />
          <H6 as="p" className="pl-4">
            {`${availableSeats} of ${totalSeats} spots left`}
          </H6>
        </div>
        {/* note: this heading doesn't scale on narrow screens */}
        <h5 className="text-black dark:text-white text-2xl font-medium">
          {workshop}
        </h5>
      </div>

      <Button className="flex-none">Register here</Button>
    </div>
  )
}

const testimonials = Array.from({length: 9}).map((_, idx) => ({
  imageUrl: `https://randomuser.me/api/portraits/lego/${idx}.jpg`,
  imageAlt: 'profile photo of person',
  author: `Person ${idx + 1}`,
  company: 'Freelance Figurine',
  testimonial:
    'Mauris auctor nulla at felis placerat, ut elementum urna commodo. Aenean et rutrum quam. Etiam odio massa.',
}))

function MdxScreen({mdxPage}: {mdxPage: MdxPage; workshop?: WorkshopEvent}) {
  const {frontmatter} = mdxPage
  const date = new Date()

  return (
    <>
      <Grid as="header" className="mb-24 mt-20 lg:mb-80 lg:mt-24">
        <div className="col-span-full lg:col-span-8">
          <BackLink to="/workshops" className="mb-10 lg:mb-24">
            Back to overview
          </BackLink>
          <H2 className="mb-2">{`Learn ${frontmatter.title} in this workshop with Kent C. Dodds.`}</H2>

          <H6 as="p" className="mb-16 lowercase lg:mb-44">
            {`${formatDate(date, 'PPP')} — starts ${formatDate(
              date,
              'h:mmaaa z',
            )}`}
          </H6>

          <RegistrationPanel
            workshop={frontmatter.title}
            totalSeats={150}
            availableSeats={87}
          />
        </div>
        <div className="hidden col-span-1 col-start-12 items-end justify-center lg:flex">
          <ArrowButton direction="down" />
        </div>
      </Grid>

      <Grid as="main" className="mb-48">
        <div className="col-span-full mb-12 lg:col-span-4 lg:mb-0">
          <H6>The problem statement</H6>
        </div>
        <div className="col-span-full mb-8 lg:col-span-8 lg:mb-20">
          <H2 className="mb-8">
            Making React components and hooks that can be used in multiple
            places is not hard. What is hard is when the use cases differ ipsum
            doler sit amet.
          </H2>
          <H2 variant="secondary" as="p">
            Without the right patterns, you can find yourself with a complex
            component or custom hook that requires configuration props and way
            too many if statements.
          </H2>
        </div>
        <Paragraph className="lg:mb:0 col-span-full mb-4 lg:col-span-4 lg:col-start-5 lg:mr-12">
          Mauris auctor nulla at felis placerat, ut elementum urna commodo.
          Aenean et rutrum quam. Etiam odio massa, congue in orci nec, ornare
          suscipit sem aenean turpis.
        </Paragraph>
        <Paragraph className="col-span-full lg:col-span-4 lg:col-start-9 lg:mr-12">
          With this workshop, you&apos;ll not only learn great patterns you can
          use but also the strengths and weaknesses of each, so you know which
          to reach for to provide your custom hooks and components the
          flexibility and power you need.
        </Paragraph>
      </Grid>

      <div className="mb-24 px-5vw w-full lg:mb-48">
        <div className="bg-secondary py-24 w-full rounded-lg lg:pb-40 lg:pt-36">
          <div className="-mx-5vw">
            <Grid>
              <div className="flex flex-col col-span-full items-stretch mb-40 lg:col-span-5 lg:items-start lg:mb-0">
                <H2 className="mb-8">
                  At the end of this workshop you’ll be able to do all of these
                  things yourself.
                </H2>
                <H2 className="mb-16" variant="secondary" as="p">
                  Here’s why you should register for the workshop.
                </H2>
                <Button>Register here</Button>
              </div>

              <div className="col-span-full lg:col-span-5 lg:col-start-8 lg:mr-12">
                <ol className="space-y-24 lg:space-y-16">
                  {Array.from({length: 3}).map((_, idx) => (
                    <NumberedPanel
                      key={idx}
                      number={idx + 1}
                      caption="Here will a random long title that doesn't fit on one line."
                      description="Praesent eu lacus odio. Pellentesque vitae lectus tortor. Donec elit
        nunc, dictum quis condimentum in, imper diet at arcu."
                    />
                  ))}
                </ol>
              </div>
            </Grid>
          </div>
        </div>
      </div>

      <Grid className="mb-48 lg:mb-64">
        <div className="col-span-8 mb-8 lg:mb-16">
          <H2 className="mb-4 lg:mb-2">The topics we will be covering.</H2>
          <H2 variant="secondary">This is what we will talk about.</H2>
        </div>

        <div className="flex flex-col col-span-full items-stretch justify-end mb-16 lg:col-span-4 lg:items-end lg:justify-center">
          <Button>register here</Button>
        </div>

        <ol className="col-span-full mb-16 space-y-4 lg:mb-20">
          {Array.from({length: 4}).map((_, idx) => (
            <TopicRow
              key={idx}
              number={idx + 1}
              topic="Use the Compound Components Pattern to write React components
        that implicitly share state while giving rendering flexibility
        to the user."
            />
          ))}
        </ol>

        <div className="col-span-full lg:col-span-5">
          <H6 className="mb-4">Required experience</H6>
          <Paragraph>
            Attend my Advanced React Hooks Workshop or have the equivalent
            experience. You should be experienced with useContext and useReducer
            (experience with useMemo and useCallback is a bonus).
          </Paragraph>
        </div>
      </Grid>

      <TestimonialSection
        testimonials={testimonials}
        className="mb-10 lg:mb-64"
      />

      <Grid className="mb-24 lg:hidden">
        <div className="flex col-span-full items-center justify-between">
          <p className="text-black dark:text-white text-2xl">1 — 4</p>
          <div className="flex space-x-3">
            <ArrowButton direction="left" />
            <ArrowButton direction="right" />
          </div>
        </div>
      </Grid>

      <Grid className="mb-24 lg:mb-64">
        <div className="col-span-full lg:col-span-8 lg:col-start-3">
          <H2 className="mb-6 text-center">
            {`Ready to learn more about ${frontmatter.title} in this workshop`}
          </H2>
          <H2 className="mb-20 text-center" variant="secondary">
            You can register by using the button bellow, can’t wait to see you.
          </H2>
          <RegistrationPanel
            workshop={frontmatter.title}
            totalSeats={150}
            availableSeats={87}
          />
        </div>
      </Grid>

      <Grid>
        <div className="col-span-full mb-16">
          <H2 className="mb-2">Have a look at my other workshops.</H2>

          <H2 variant="secondary" as="p">
            Learn more in these workshops.
          </H2>
        </div>

        {Array.from({length: 3}).map((_, idx) => (
          <div key={idx} className="col-span-full mb-4 md:col-span-4 lg:mb-6">
            <WorkshopCard
              frontmatter={{
                title: 'another course',
                description:
                  'Donec posuere orci turpis, amet condimentum libero porttitor at in ultrices.',
                tech: 'javascript',
                date: formatDate(new Date(), 'yyyy-MM-ii'),
              }}
              open={idx === 1}
              slug="/workshops/advanced-react-hooks"
            />
          </div>
        ))}
      </Grid>
    </>
  )
}
