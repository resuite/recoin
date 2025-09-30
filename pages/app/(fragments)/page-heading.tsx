import { BackButton } from '@/pages/app/(fragments)/back-btn'

interface PageHeadingProps {
   title: string
}

export function PageHeading(props: PageHeadingProps) {
   const { title } = props

   return (
      <>
         <BackButton class='mx-1 mt-1' />
         <h1 class='text-header mx-1 pt-1 pb-0.5'>{title}</h1>
      </>
   )
}
