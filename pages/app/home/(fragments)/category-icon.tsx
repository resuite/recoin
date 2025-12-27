import type { JSX } from 'retend/jsx-runtime'
import type { IconName } from '@/components/icons'
import { AsyncMaskIcon } from '@/components/icons/icon-mask'

type DivProps = JSX.IntrinsicElements['div']
interface CategoryIconProps extends DivProps {
   icon: IconName
}

export const CategoryIcon = (props: CategoryIconProps) => {
   const { icon, ...rest } = props

   return (
      <AsyncMaskIcon
         {...rest}
         name={icon}
         class={['rounded-full border-2 grid place-items-center bg-current', rest.class]}
         style={{ maskSize: '60%' }}
      />
   )
}
