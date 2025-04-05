import type { JSX } from 'retend/jsx-runtime';
import './loader.scss';

export interface LoaderProps {
  size: JSX.ValueOrCell<string>;
}
export const Loader = (props: LoaderProps) => {
  return <div class="Loader" style={{ '--LoaderSize': props.size }} />;
};
