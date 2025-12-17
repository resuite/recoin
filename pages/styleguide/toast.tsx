import { Button } from '@/components/ui/button'
import { ToastProvider, useToast } from '@/components/ui/toast'

const Toast = () => {
   return (
      <ToastProvider>
         {() => {
            const { showToast } = useToast()

            const handleShowSuccessToast = () => {
               showToast({
                  content: <p>Operation successful!</p>,
                  duration: 3000
               })
            }

            const handleShowErrorToast = () => {
               showToast({
                  content: <strong>Error: Something went wrong.</strong>
               })
            }

            return (
               <div class='h-screen grid place-items-center place-content-center'>
                  <Button type='button' onClick={handleShowSuccessToast}>
                     Show Success
                  </Button>
                  <Button type='button' onClick={handleShowErrorToast}>
                     Show Persistent Error
                  </Button>
               </div>
            )
         }}
      </ToastProvider>
   )
}

export default Toast
