import { AllIcons, Icon } from '@/components/icons'
import { useRouter } from 'retend/router'

const Styleguide = () => {
   const { Link } = useRouter()

   return (
      <div class='grid-lines'>
         <div class='grid mx-auto pt-2 max-w-40'>
            <h1 class='text-large px-1'>recoin Styleguide.</h1>
            <div class='pb-2 px-1'>
               <p class='py-0.5'>
                  This document serves as a comprehensive style guide and
                  component showcase for recoin, ensuring consistency,
                  usability, and a strong brand identity across all
                  touch-points. It outlines the core design principles, visual
                  elements, and UI components that constitute the application's
                  interface.
               </p>
            </div>
            {/* Typography */}
            <div class='pb-2 px-1'>
               <h2 class='text-title'>Typography</h2>
               <p>
                  These are the variations of preferred typographies to be used.
                  <ul>
                     <li class='text-logo'>
                        The quick brown fox jumps over the lazy dog.
                     </li>
                     <li class='text-large'>
                        The quick brown fox jumps over the lazy dog.
                     </li>
                     <li class='text-title'>
                        The quick brown fox jumps over the lazy dog.
                     </li>
                     <li class='text-bigger'>
                        The quick brown fox jumps over the lazy dog.
                     </li>
                     <li class='text-header'>
                        The quick brown fox jumps over the lazy dog.
                     </li>
                     <li class='text-big'>
                        The quick brown fox jumps over the lazy dog.
                     </li>
                  </ul>
               </p>
            </div>
            {/* Components */}
            <h2 class='text-title px-1'>Components</h2>
            {/* Buttons */}
            <h3 class='text-header px-1'>Buttons</h3>
            <div class='grid grid-cols-2 gap-0.5 py-1 px-1'>
               <button type='button'>Click Me!</button>
               <button type='button' class='btn-danger'>
                  Don't click me!
               </button>
               <button type='button' class='btn-outline'>
                  Click Me
               </button>
               <button type='button' class='btn-danger-outline'>
                  Don't click me either!
               </button>
               <button type='button'>
                  <Icon name='suitcase' class='btn-icon' />
                  Button with icon
               </button>
            </div>
            {/* Icons */}
            <h2 class='text-header px-1'>Icons</h2>
            <div class='flex flex-wrap px-1 gap-0.5 py-1 [&>*]:w-1.5 [&>*]:h-1.5'>
               <AllIcons />
            </div>
            {/* Links */}
            <div class='py-1 px-1 w-full'>
               <h2 class='text-header'>Links</h2>
               <Link href='/styleguide'>Click me.</Link>
               <Link href='/styleguide'>
                  <Icon name='safe' class='link-icon' />
                  Link with icon.
               </Link>
            </div>
            {/* Inputs */}
            <div class='py-1 px-1 w-full'>
               <h2 class='text-header'>Inputs</h2>
               <div class='grid grid-cols-1 gap-0.5 py-1'>
                  <input type='text' placeholder='Text input' />
                  <input type='date' />
                  <input type='time' />
                  <select>
                     <option>Option 1</option>
                     <option>Option 2</option>
                     <option>Option 3</option>
                  </select>
                  <input type='range' />
                  <label>
                     Toggle
                     <input type='checkbox' />
                  </label>
               </div>
            </div>
            {/* Other pages */}
            <div class='py-1 px-1 w-full'>
               <Link href='/styleguide/nav-stack'>Go to nav stack page</Link>
               <Link href='/styleguide/tabs'>Go to tabs page</Link>
               <Link href='/styleguide/pull-zone'>Go to pull zone page</Link>
               <Link href='/styleguide/toast'>Go to toast page</Link>
               <Link href='/styleguide/floating-button'>Go to FAB page</Link>
               <Link href='/styleguide/sidebar'>Go to sidebar page</Link>
               <Link href='/styleguide/keyboard-avoidance'>
                  Go to keyboard avoidance page
               </Link>
               <Link href='/styleguide/drawer'>Go to drawer page.</Link>
               <Link href='/styleguide/popover'>Go to popover page</Link>
            </div>
         </div>
      </div>
   )
}

export default Styleguide
