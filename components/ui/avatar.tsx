import { Cell, If } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { useDerivedValue } from 'retend-utils/hooks'
import User from '@/components/icons/svg/user'
import { Button } from '@/components/ui/button'
import styles from './avatar.module.css'

type IntrinsicButtonProps = JSX.IntrinsicElements['button']

interface AvatarProps extends IntrinsicButtonProps {
   src?: JSX.ValueOrCell<string | null | undefined>
   alt?: string
   size?: JSX.ValueOrCell<'small' | 'medium' | 'large'>
   ref?: Cell<HTMLButtonElement | null>
}

export function Avatar(props: AvatarProps) {
   const { src, alt = 'Avatar', size = 'medium', class: className, ...rest } = props

   const srcValue = useDerivedValue(src)
   const sizeValue = useDerivedValue(size)

   const sizeClass = Cell.derived(() => {
      return styles[sizeValue.get() ?? 'medium']
   })

   const handleError = (e: ErrorEvent) => {
      const img = e.target as HTMLImageElement
      img.style.display = 'none'
   }

   return (
      <Button {...rest} class={[styles.avatar, sizeClass, className]}>
         {If(srcValue, {
            true: (url) => (
               <img src={url as string} alt={alt} class={styles.image} onError={handleError} />
            ),
            false: () => <User class={styles.icon} />
         })}
      </Button>
   )
}
