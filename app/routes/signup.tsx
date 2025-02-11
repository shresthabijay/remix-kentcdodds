import * as React from 'react'
import {
  json,
  redirect,
  useLoaderData,
  useActionData,
  Headers,
  Form,
} from 'remix'
import type {ActionFunction, LoaderFunction} from 'remix'
import type {Team} from 'types'
import clsx from 'clsx'
import {shuffle} from 'lodash'
import {getUser, getUserSessionCookieForUser} from '../utils/session.server'
import {getLoginInfoSession} from '../utils/login.server'
import {prisma, validateMagicLink} from '../utils/prisma.server'
import {getErrorStack, teams} from '../utils/misc'
import {tagKCDSiteSubscriber} from '../utils/convertkit.server'
import {useTeam} from '../utils/providers'
import {Grid} from '../components/grid'
import {H2, H6, Paragraph} from '../components/typography'
import {Field, InputError} from '../components/form-elements'
import {Button} from '../components/button'
import {CheckCircledIcon} from '../components/icons/check-circled-icon'
import {images} from '../images'
import {TEAM_MAP} from '../utils/onboarding'
import {HeaderSection} from '../components/sections/header-section'
import {handleFormSubmission} from '../utils/actions.server'

type ActionData = {
  fields: {
    firstName: string | null
    team: Team | null
  }
  errors: {
    generalError?: string
    firstName: string | null
    team: string | null
  }
}

type LoaderData = {
  email: string
  teamsInOrder: Array<Team>
}

function getErrorForFirstName(name: string | null) {
  if (!name) return `Name is required`
  if (name.length > 60) return `Name is too long`
  return null
}

function getErrorForTeam(team: string | null) {
  if (!team) return `Team is required`
  if (!teams.includes(team as Team)) return `Please choose a valid team`
  return null
}

export const action: ActionFunction = async ({request}) => {
  const loginInfoSession = await getLoginInfoSession(request)
  const magicLink = loginInfoSession.getMagicLink()
  let email: string
  try {
    if (typeof magicLink !== 'string') {
      throw new Error('email and magicLink required.')
    }

    email = await validateMagicLink(magicLink)
  } catch (error: unknown) {
    console.error(getErrorStack(error))

    loginInfoSession.clean()
    loginInfoSession.flashError(
      'Sign in link invalid. Please request a new one.',
    )
    return redirect('/login', {
      headers: {'Set-Cookie': await loginInfoSession.commit()},
    })
  }

  return handleFormSubmission<ActionData>(
    request,
    {
      firstName: getErrorForFirstName,
      team: getErrorForTeam,
    },
    async formData => {
      const {firstName, team} = formData

      try {
        const user = await prisma.user.create({data: {email, firstName, team}})

        // add user to mailing list
        const sub = await tagKCDSiteSubscriber(user)
        await prisma.user.update({
          data: {convertKitId: String(sub.id)},
          where: {id: user.id},
        })

        const sessionIdCookie = await getUserSessionCookieForUser(request, user)
        const destroyCookie = await loginInfoSession.destroy()

        const headers = new Headers()
        headers.append('Set-Cookie', destroyCookie)
        headers.append('Set-Cookie', sessionIdCookie)

        return redirect('/me', {headers})
      } catch (error: unknown) {
        console.error(getErrorStack(error))

        loginInfoSession.flashError(
          'There was a problem creating your account. Please try again.',
        )
        return redirect('/login', {
          headers: {'Set-Cookie': await loginInfoSession.commit()},
        })
      }
    },
  )
}

export const loader: LoaderFunction = async ({request}) => {
  const user = await getUser(request)
  if (user) return redirect('/me')

  const loginInfoSession = await getLoginInfoSession(request)
  const email = loginInfoSession.getEmail()
  if (!email) {
    loginInfoSession.clean()
    loginInfoSession.flashError('Invalid magic link. Try again.')
    return redirect('/login', {
      headers: {
        'Set-Cookie': await loginInfoSession.commit(),
      },
    })
  }

  const values: LoaderData = {
    email,
    // have to put this shuffle in the loader to ensure server render is the same as the client one.
    teamsInOrder: shuffle(teams),
  }
  return json(values, {
    headers: {
      'Set-Cookie': await loginInfoSession.commit(),
    },
  })
}

interface TeamOptionProps {
  team: Team
  error?: string | null
  selected: boolean
}

function TeamOption({team: value, error, selected}: TeamOptionProps) {
  const team = TEAM_MAP[value]

  return (
    <div
      className={clsx(
        'focus-ring relative col-span-full mb-3 bg-gray-100 dark:bg-gray-800 rounded-lg lg:col-span-4 lg:mb-0',
        team.focusClassName,
        {
          'ring-2': selected,
        },
      )}
    >
      {selected ? (
        <span className="absolute left-9 top-9 text-team-current">
          <CheckCircledIcon />
        </span>
      ) : null}

      <label className="block pb-12 pt-20 px-12 text-center cursor-pointer">
        <input
          className="sr-only"
          type="radio"
          name="team"
          value={value}
          aria-describedby={error ? 'team-error' : undefined}
        />
        <img className="block mb-16" src={team.image()} alt={team.image.alt} />
        <H6 as="span">{team.label}</H6>
      </label>
    </div>
  )
}

export default function NewAccount() {
  const data = useLoaderData<LoaderData>()
  const actionData = useActionData() as ActionData | undefined
  const [, setTeam] = useTeam()
  const [formValues, setFormValues] = React.useState<{
    firstName: string
    team?: Team
  }>({
    firstName: '',
    team: undefined,
  })

  const formIsValid =
    formValues.firstName.trim().length > 0 &&
    teams.includes(formValues.team as Team)

  const team = formValues.team
  React.useEffect(() => {
    if (team && teams.includes(team)) setTeam(team)
  }, [team, setTeam])

  return (
    <main className="mt-24 pt-6">
      {/*
        TODO: change this to <Form />
        when we're no longer on the experimental release of remix.
        Our current version has a bug where the root loader isn't called.
      */}
      <Form
        className="mb-64"
        method="post"
        onChange={event => {
          const form = event.currentTarget
          setFormValues({
            firstName: form.firstName.value,
            team: form.team.value,
          })
        }}
      >
        <HeaderSection
          title="Let’s start with choosing a team."
          subTitle="You can’t change this later."
          className="mb-16"
        />

        <Grid>
          {actionData?.errors.team ? (
            <div className="col-span-full mb-4 text-right">
              <InputError id="team-error">{actionData.errors.team}</InputError>
            </div>
          ) : null}

          <fieldset className="contents">
            <legend className="sr-only">Team</legend>
            {data.teamsInOrder.map(teamOption => (
              <TeamOption
                key={teamOption}
                team={teamOption}
                error={actionData?.errors.team}
                selected={formValues.team === teamOption}
              />
            ))}
          </fieldset>

          <div className="col-span-full h-20 lg:h-24" />

          <div className="col-span-full mb-12">
            <H2>Some basic info to remember you.</H2>
            <H2 variant="secondary" as="p">
              You can change these later.
            </H2>
          </div>

          <div className="col-span-full mb-12 lg:col-span-5 lg:mb-20">
            <Field
              name="firstName"
              label="First name"
              error={actionData?.errors.firstName}
              autoComplete="firstName"
              defaultValue={actionData?.fields.firstName ?? ''}
              required
            />
          </div>

          <div className="col-span-full mb-12 lg:col-span-5 lg:col-start-7 lg:mb-20">
            <Field
              name="email"
              label="Email"
              defaultValue={data.email}
              readOnly
              disabled
            />
          </div>

          <div className="col-span-full">
            <Button type="submit" disabled={!formIsValid}>
              Create account
            </Button>
          </div>
          <p className="col-span-4 mt-10 text-xs font-medium tracking-wider">
            NOTICE: By signing up for an account, your email address will be
            added to Kent&apos;s mailing list (if it&apos;s not already) and
            you&apos;ll ocassionally receive promotional emails from Kent. You
            can unsubscribe at any time.
          </p>
        </Grid>
      </Form>

      <Grid>
        <div className="col-span-full lg:col-span-5 lg:col-start-8">
          <H2 className="mb-32">You might be thinking, why pick a team?</H2>

          <H6 as="h3" className="mb-4">
            Gamify your learning.
          </H6>
          <Paragraph className="mb-12">
            Praesent eu lacus odio. Pellentesque vitae lectus tortor. Donec elit
            nunc, dictum quis condimentum in, impe rdiet at arcu.{' '}
          </Paragraph>
          <H6 as="h3" className="mb-4">
            Here will go the second title.
          </H6>
          <Paragraph className="mb-12">
            Mauris auctor nulla at felis placerat, ut elementum urna commodo.
            Aenean et rutrum quam. Etiam odio massa, congue in orci nec, ornare
            suscipit sem aenean turpis.
          </Paragraph>
          <H6 as="h3" className="mb-4">
            Here will go the third title.
          </H6>
          <Paragraph className="mb-12">
            Mauris auctor nulla at felis placerat, ut elementum urna commodo.
            Aenean et rutrum quam. Etiam odio massa, congue in orci nec, ornare
            suscipit sem aenean turpis.
          </Paragraph>
        </div>

        <div className="col-span-full lg:col-span-6 lg:col-start-1 lg:row-start-1">
          <div className="aspect-h-6 aspect-w-4">
            <img
              className="rounded-lg object-cover"
              src={images.kentPalmingSoccerBall()}
              alt={images.kentPalmingSoccerBall.alt}
            />
          </div>
        </div>
      </Grid>
    </main>
  )
}
