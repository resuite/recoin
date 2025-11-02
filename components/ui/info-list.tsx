import type { JSX } from 'retend/jsx-runtime'

type DlProps = JSX.IntrinsicElements['dl']

interface InfoListProps extends DlProps {}

export const InfoList = (props: InfoListProps) => {
   const { children, ...rest } = props
   return (
      <dl {...rest} class={['w-full gap-y-0.5 grid grid-cols-2', rest.class]}>
         {children}
      </dl>
   )
}

interface InfoListItemProps {
   label: string
   value: string
}

export const InfoListItem = (props: InfoListItemProps) => {
   const { label, value } = props
   return (
      <>
         <dt class='justify-self-start text-left'>{label}</dt>
         <dd class='justify-self-end text-end'>{value}</dd>
      </>
   )
}
