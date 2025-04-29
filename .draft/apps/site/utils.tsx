import type { JSX } from 'retend/jsx-runtime';

export const sty = (text: string) => {
  const words = text.split('o');
  const transformed: JSX.Template[] = [];

  for (const [index, word] of words.entries()) {
    transformed.push(word);
    if (index < words.length - 1) {
      transformed.push(<i>o</i>);
    }
  }

  return transformed;
};
