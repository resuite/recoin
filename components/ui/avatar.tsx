import User from '@/components/icons/svg/user'
import { Button } from '@/components/ui/button'
import { Cell, If } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './avatar.module.css'

type IntrinsicButtonProps = JSX.IntrinsicElements['button']

interface AvatarProps extends IntrinsicButtonProps {
   src?: JSX.ValueOrCell<string | null | undefined>
   alt?: string
   size?: JSX.ValueOrCell<'small' | 'medium' | 'large'>
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
         {If(srcValue, (url) => (
            <img src={url} alt={alt} class={styles.image} onError={handleError} />
         ))}
         <User class={styles.icon} />
      </Button>
   )
}
