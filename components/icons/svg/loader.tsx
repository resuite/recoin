import type { IconProps } from '../index'

export default function Loader(props: IconProps) {
   return (
      <svg
         {...props}
         class={['animate-spin', props.class]}
         viewBox='0 0 14 15'
         fill='none'
         xmlns='http://www.w3.org/2000/svg'
      >
         <title xmlns='http://www.w3.org/2000/svg'>Loading...</title>
         <rect
            x='5.24793'
            y='1.62746'
            width='8.66667'
            height='8.66667'
            transform='rotate(28.3883 5.24793 1.62746)'
            stroke='currentColor'
            stroke-width='1.33333'
         />
      </svg>
   )
}
