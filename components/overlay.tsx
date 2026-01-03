import type { JSX } from 'retend/jsx-runtime'
import styles from './overlay.module.css'

interface OverlayProps extends JSX.BaseContainerProps {
   isDimmed: JSX.ValueOrCell<boolean>
}

export function Overlay(props: OverlayProps) {
   const { isDimmed, ...rest } = props

   return <div class={[styles.overlay, { [styles.dimmed]: isDimmed }, rest.class]} {...rest} />
}
