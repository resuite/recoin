import type { IconProps } from "../icon";
import { Cell } from "retend";
import { useDerivedValue } from "retend-utils/hooks";
import type { JSX } from "retend/jsx-runtime";

export type ArrowDirection =
   | "top-left"
   | "top-right"
   | "bottom-left"
   | "bottom-right";
export interface ArrowProps extends IconProps {
   direction?: JSX.ValueOrCell<ArrowDirection>;
}

export default function Arrows(props: ArrowProps) {
   const { direction: directionProp, ...rest } = props;
   const direction = useDerivedValue(directionProp);
   const arrowDirection = Cell.derived(() => {
      const directionValue = direction.get();
      switch (directionValue) {
         case "top-left":
            return "rotate-90";
         case "top-right":
            return "rotate-180";
         case "bottom-right":
            return "rotate-270";
      }
   });

   return (
      <svg
         {...rest}
         class={[arrowDirection, rest.class]}
         viewBox="0 0 11 11"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <title xmlns="http://www.w3.org/2000/svg">Arrow icon.</title>
         <path
            xmlns="http://www.w3.org/2000/svg"
            d="M6.62985 8.30001H2.38721V4.05737"
            stroke="currentColor"
            stroke-width="0.85"
            stroke-linecap="round"
            stroke-linejoin="round"
         />
         <path
            xmlns="http://www.w3.org/2000/svg"
            d="M2.89648 7.79102L7.98765 2.69985"
            stroke="currentColor"
            stroke-width="0.85"
            stroke-linecap="round"
         />
      </svg>
   );
}
