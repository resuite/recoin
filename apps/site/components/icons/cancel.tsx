import type { JSX } from 'retend/jsx-runtime';

export const Cancel = (props: JSX.IntrinsicElements['svg']) => {
  return (
    <svg
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M1.89347 23.1066L12.5001 12.5M12.5001 12.5L23.1067 1.8934M12.5001 12.5L23.1067 23.1066M12.5001 12.5L1.89347 1.8934"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};
