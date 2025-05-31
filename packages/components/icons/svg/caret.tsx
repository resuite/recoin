import type { IconProps } from "../../icon";
import { Cell } from "retend";
import { useDerivedValue } from "retend-utils/hooks";
import type { JSX } from "retend/jsx-runtime";

export interface CaretProps extends IconProps {
   direction?: JSX.ValueOrCell<"right" | "left" | "top" | "bottom">;
}

export default function Caret(props: CaretProps) {
   const { direction, ...rest } = props;
   const dir = useDerivedValue(direction);
   const caretDirection = Cell.derived(() => {
      const value = dir.get();
      switch (value) {
         case "left":
            return "rotate-90";
         case "top":
            return "rotate-180";
         case "right":
            return "rotate-270";
      }
   });

   return (
      <svg
         {...rest}
         class={[caretDirection, rest.class]}
         viewBox="0 0 25 25"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <title xmlns="http://www.w3.org/2000/svg">Caret</title>
         <path
            d="M21 8.25L12.5 16.75L4 8.25"
            stroke="currentColor"
            stroke-width="2.25"
            stroke-linecap="round"
            stroke-linejoin="round"
         />
      </svg>
   );
}
