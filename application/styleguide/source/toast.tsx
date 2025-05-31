import { useToast } from "@recoin/components/ui";

const Toast = () => {
   const { showToast, ToastContainer } = useToast();

   const handleShowSuccessToast = () => {
      showToast({ content: <p>Operation successful!</p>, duration: 3000 });
   };

   const handleShowErrorToast = () => {
      showToast({ content: <strong>Error: Something went wrong.</strong> });
   };

   return (
      <div class="h-screen grid place-items-center place-content-center">
         <ToastContainer />
         <button type="button" onClick={handleShowSuccessToast}>
            Show Success
         </button>
         <button type="button" onClick={handleShowErrorToast}>
            Show Persistent Error
         </button>
      </div>
   );
};

export default Toast;
