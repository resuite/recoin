import type { IconProps } from '@/components/icons'
import type { JSX } from 'retend/jsx-runtime'

interface ToastMessageProps {
   Icon: (props: IconProps) => JSX.Template
   message: string
}

export function ToastMessage(props: ToastMessageProps) {
   const { Icon, message } = props

   return (
      <div class='grid grid-cols-[auto_1fr] gap-x-0.5'>
         <Icon class='h-1 w-1' /> {message}
      </div>
   )
}
