import type { JSX } from 'retend/jsx-runtime';

export const Checkmark = (props: JSX.IntrinsicElements['svg']) => {
  return (
    <svg
      viewBox="0 0 40 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M1.97803 17.0426L12.3975 27.4619C12.6151 27.6792 12.9678 27.6796 13.1856 27.4619L38.022 2.625"
        stroke="currentColor"
        stroke-width="3.6044"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};
