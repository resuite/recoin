import { useTextContentLength } from '@/utilities/composables/use-text-content-length'
import { Cell } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import styles from './fit-text.module.css'

type DivProps = JSX.IntrinsicElements['div']

interface FitTextProps extends DivProps {
   /**
    * The scaling factor to apply to the font size.
    * @default 1
    */
   scalingFactor?: JSX.ValueOrCell<number>
   /**
    * The maximum font size to apply.
    * @default '100cqw'
    */
   maxFontSize?: JSX.ValueOrCell<string>
   /**
    * A ref to the HTML element to measure text content length from.
    */
   ref?: Cell<HTMLElement | null>
}

/**
 * A component that automatically adjusts the font size of its children
 * to fit within its container.
 *
 * @example
 * ```tsx
 * import { FitText } from './fit-text'
 *
 * function MyComponent() {
 *   return (
 *     <div style={{ width: '200px', height: '100px' }}>
 *       <FitText>This text will scale to fit.</FitText>
 *     </div>
 *   )
 * }
 * ```
 * @param props - The props for the FitText component.
 */
export function FitText(props: FitTextProps) {
   const {
      ref = Cell.source(null),
      scalingFactor = 1,
      maxFontSize = '100cqw',
      children,
      ...rest
   } = props
   const charCount = useTextContentLength(ref)
   const style = {
      '--fit-text-char-count': charCount,
      '--fit-text-max-font-size': maxFontSize,
      '--fit-text-scaling-factor': scalingFactor
   }

   if (rest.style && typeof rest.style === 'object') {
      Object.assign(style, rest.style)
   }

   return (
      <div {...rest} style={style} ref={ref} class={[rest.class, styles.fitText]}>
         <div class={styles.content}>{children}</div>
      </div>
   )
}
