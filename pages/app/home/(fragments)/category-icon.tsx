import { Icon, type IconName } from '@/components/icons'
import type { JSX } from 'retend/jsx-runtime'

type DivProps = JSX.IntrinsicElements['div']
interface CategoryIconProps extends DivProps {
   icon: IconName
}

export const CategoryIcon = (props: CategoryIconProps) => {
   const { icon, ...rest } = props

   return (
      <div {...rest} class={['rounded-full border-2 grid place-items-center', rest.class]}>
         <Icon name={icon} class='h-[50%] w-[50%]' />
      </div>
   )
}
