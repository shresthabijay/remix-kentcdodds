import * as React from 'react'
import clsx from 'clsx'
import type {ChangeEventHandler} from 'react'
import {CustomCheckboxContainer, CustomCheckboxInput} from '@reach/checkbox'

interface TagProps {
  tag: string
  selected: boolean
  onClick?: ChangeEventHandler<HTMLInputElement>
  disabled?: boolean
}

function Tag({tag, selected, onClick, disabled}: TagProps) {
  return (
    <CustomCheckboxContainer
      as="label"
      checked={selected}
      onChange={onClick}
      className={clsx(
        'relative block mb-4 mr-4 px-6 py-3 w-auto h-auto rounded-full transition',
        {
          'text-primary bg-secondary': !selected,
          'text-inverse bg-inverse': selected,
          'focus-ring opacity-100': !disabled,
          'opacity-25': disabled,
        },
      )}
      disabled={disabled}
    >
      <CustomCheckboxInput checked={selected} value={tag} className="sr-only" />
      <span>{tag}</span>
    </CustomCheckboxContainer>
  )
}

export {Tag}
