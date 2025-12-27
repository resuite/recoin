import {
   type __HMR_UpdatableFn,
   getActiveRenderer,
   h,
   type Renderer,
   type RendererTypes,
   setActiveRenderer
} from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import type { IconName, IconProps } from './index'

// ============================================================================
// Virtual DOM Types for SVG Serialization
// ============================================================================

/** Escape map for HTML content */
const HTML_ESCAPE: Record<string, string> = {
   '&': '&amp;',
   '<': '&lt;',
   '>': '&gt;',
   '"': '&quot;',
   "'": '&#39;'
}

/** Escape map for attributes */
const ATTR_ESCAPE: Record<string, string> = { '"': '&quot;', '&': '&amp;' }

type VGroup = Array<VNode | string>

interface VNode {
   t: string // tagName
   a: Array<[string, string]> // attrs
   c: VGroup // children
}

function vnode(tagName: string): VNode {
   return { t: tagName, a: [], c: [] }
}

function vnodeToString(n: VNode): string {
   let s = `<${n.t}`
   for (let i = 0; i < n.a.length; i++) {
      s += ` ${n.a[i][0]}="${n.a[i][1]}"`
   }
   s += '>'
   for (let i = 0; i < n.c.length; i++) {
      const c = n.c[i]
      s += typeof c === 'string' ? c.replace(/[&<>"']/g, (ch) => HTML_ESCAPE[ch]) : vnodeToString(c)
   }
   return `${s}</${n.t}>`
}

// ============================================================================
// SVG to Mask Renderer
// ============================================================================

interface SvgToMaskRendererTypes extends RendererTypes {
   Output: string
   Node: VNode | string
   Text: string
   Handle: unknown
   Group: VGroup
   Container: VNode
   Host: EventTarget
   SavedNodeState: unknown
}

class SvgToMaskRenderer implements Renderer<SvgToMaskRendererTypes> {
   host = new EventTarget()
   observer = null
   capabilities = {}

   onViewChange() {}

   isNode(node: unknown): node is VNode | string {
      return (typeof node === 'object' && node !== null && 't' in node) || typeof node === 'string'
   }

   isGroup(child: unknown): child is VGroup {
      return Array.isArray(child)
   }

   createGroup(input?: VGroup): VGroup {
      return input ? [...input] : []
   }

   createContainer(tagname: string): VNode {
      return vnode(tagname)
   }

   createText(text: string): string {
      return text
   }

   updateText(text: string): string {
      return text
   }

   setProperty<N extends VNode | string>(node: N, key: string, value: unknown): N {
      if (typeof node === 'object' && 't' in node && typeof value === 'string') {
         node.a.push([key, value.replace(/["&]/g, (c) => ATTR_ESCAPE[c])])
      }
      return node
   }

   handlePromise(): string {
      return ''
   }

   unwrapGroup(group: VGroup): VGroup {
      return group
   }

   append(parent: VNode | string, children: VNode | string | VGroup): VNode | string {
      if (typeof parent === 'object' && 't' in parent) {
         if (Array.isArray(children)) {
            for (const child of children) {
               parent.c.push(child)
            }
         } else {
            parent.c.push(children)
         }
      }
      return parent
   }

   isActive(): boolean {
      return false
   }

   createGroupHandle(): unknown {
      throw new Error('Not supported')
   }

   write(): void {
      throw new Error('Not supported')
   }

   reconcile(): void {
      throw new Error('Not supported')
   }

   finalize(node: VNode | string): string {
      if (typeof node === 'object' && 't' in node) {
         return `data:image/svg+xml,${encodeURIComponent(vnodeToString(node))}`
      }
      return String(node)
   }

   handleComponent(fn: __HMR_UpdatableFn, props: unknown): VNode | string | Array<VNode | string> {
      return (fn as (props: unknown) => VNode | string)(props)
   }

   selectMatchingNode(): VNode | null {
      return null
   }

   selectMatchingNodes(): Array<VNode | string> {
      return []
   }

   saveContainerState(): unknown {
      throw new Error('Not supported')
   }

   restoreContainerState(): void {
      throw new Error('Not supported')
   }
}

// ============================================================================
// MaskIcon Component
// ============================================================================

interface MaskIconProps<TProps extends IconProps = IconProps> extends JSX.BaseContainerProps {
   /** The icon component to render as a mask */
   src: (props: TProps) => JSX.Template
   /** Props to pass to the icon component */
   iconProps?: TProps
}

const renderer = new SvgToMaskRenderer()
const classCache = new WeakMap<(props: IconProps) => JSX.Template, Map<string, string>>()

let classCounter = 0
let stylesheet: CSSStyleSheet | null = null

function getStylesheet(): CSSStyleSheet {
   if (!stylesheet) {
      const el = document.createElement('style')
      el.setAttribute('data-mask-icons', '')
      document.head.appendChild(el)
      stylesheet = el.sheet as CSSStyleSheet
   }
   return stylesheet
}

function getMaskClass<TProps extends IconProps>(
   src: (props: TProps) => JSX.Template,
   iconProps: TProps
): string {
   const key = JSON.stringify(iconProps)
   let cache = classCache.get(src as (props: IconProps) => JSX.Template)
   if (!cache) {
      cache = new Map()
      classCache.set(src as (props: IconProps) => JSX.Template, cache)
   }

   let cls = cache.get(key)
   if (!cls) {
      const prev = getActiveRenderer()
      setActiveRenderer(renderer)
      try {
         const dataUrl = renderer.finalize(src(iconProps) as VNode | string)
         cls = `mask-icon-${classCounter++}`
         getStylesheet().insertRule(
            `.${cls}{mask-image:url("${dataUrl}");mask-size:contain;mask-repeat:no-repeat;mask-position:center}`
         )
         cache.set(key, cls)
      } finally {
         setActiveRenderer(prev)
      }
   }
   return cls
}

export function MaskIcon<TProps extends IconProps = IconProps>(props: MaskIconProps<TProps>) {
   const { src, style, iconProps = {} as TProps, class: existing, ...rest } = props
   const cls = getMaskClass(src, iconProps)

   return h('div', {
      ...rest,
      class: existing ? `${existing} ${cls}` : cls,
      style
   })
}

// ============================================================================
// AsyncMaskIcon Component (for IconName-based usage)
// ============================================================================

interface AsyncMaskIconProps extends JSX.BaseContainerProps {
   /** The icon name to load dynamically */
   name: IconName
   /** Props to pass to the icon component */
   iconProps?: IconProps
}

export async function AsyncMaskIcon(props: AsyncMaskIconProps) {
   const { name, style, iconProps = {}, class: existing, ...rest } = props

   const iconModule = await import(`./svg/${name}.tsx`)
   const iconFn = iconModule.default as (props: IconProps) => JSX.Template
   const cls = getMaskClass(iconFn, iconProps)

   return h('div', {
      ...rest,
      class: existing ? `${existing} ${cls}` : cls,
      style
   })
}
