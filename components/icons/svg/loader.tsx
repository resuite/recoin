import type { IconProps } from '../index'

export default function Loader(props: IconProps) {
   return (
      // @ts-expect-error: svg is not a compositable transform target.
      <div {...props} class={['animate-spin', props.class]}>
         <svg
            style={{ height: '100%', width: '100%' }}
            viewBox='0 0 68 68'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
         >
            <title xmlns='http://www.w3.org/2000/svg'>Loading...</title>
            <rect
               x='24.5808'
               y='2.71038'
               width='46'
               height='46'
               rx='9.30715'
               transform='rotate(28.3883 24.5808 2.71038)'
               stroke='currentColor'
               stroke-width='4'
            />
            <rect
               x='30.3572'
               y='22.0727'
               width='17.4248'
               height='17.4248'
               rx='5.30828'
               transform='rotate(28.3883 30.3572 22.0727)'
               stroke='currentColor'
               stroke-width='4'
            />
         </svg>
      </div>
   )
}
