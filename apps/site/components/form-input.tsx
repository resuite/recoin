import { If } from 'retend';
import type { JSX } from 'retend/jsx-runtime';
import './form-input.scss';
import { useRouter } from 'retend/router';

type IntrinsicButtonProps = JSX.IntrinsicElements['button'];
type IntrinsicAnchorProps = JSX.IntrinsicElements['a'];

type BaseButtonProps = {
  width?: JSX.ValueOrCell<string>;
  inlinePadding?: JSX.ValueOrCell<string>;
  squeezeX?: JSX.ValueOrCell<number>;
  alignmentX?: JSX.ValueOrCell<boolean>;
  Icon?: JSX.ValueOrCell<() => JSX.Template>;
  href?: string;
};

export type ButtonProps = IntrinsicButtonProps &
  IntrinsicAnchorProps &
  BaseButtonProps;

export const Button = (props: ButtonProps) => {
  const router = useRouter();
  const {
    width = '300px',
    inlinePadding = 'var(--Spacing)',
    squeezeX = 1,
    alignmentX = 'left',
    Icon,
    ...rest
  } = props;

  const buttonStyle: JSX.StyleValue = {
    '--ButtonWidth': width,
    '--ButtonInlinePadding': inlinePadding,
    '--ButtonSqueezeX': squeezeX,
  };

  if (rest.style) {
    Object.assign(buttonStyle, rest.style);
  }

  if (props.href) {
    const { href, ...anchorProps } = props;
    return (
      <router.Link
        {...anchorProps}
        href={href}
        data-align-x={alignmentX}
        class={['Button', rest.class]}
        style={buttonStyle}
      >
        <div class="ButtonContentContainer">
          <div class="ButtonIconContainer">
            {If(Icon, (IconValue) => (
              <IconValue />
            ))}
          </div>
          {props.children}
        </div>
      </router.Link>
    );
  }

  return (
    <button
      {...rest}
      data-align-x={alignmentX}
      class={['Button', rest.class]}
      style={buttonStyle}
    >
      <div class="ButtonContentContainer">
        <div class="ButtonIconContainer">
          {If(Icon, (IconValue) => (
            <IconValue />
          ))}
        </div>
        {props.children}
      </div>
    </button>
  );
};

type IntrinsicInputProps = JSX.IntrinsicElements['input'];
export interface InputProps extends IntrinsicInputProps {
  'container:class'?: unknown;
}

export const Input = (props: InputProps) => {
  const { 'container:class': containerClass, ...rest } = props;
  return (
    <div class={['InputContainer', containerClass]}>
      <input {...rest} class={['Input', rest.class]} />
    </div>
  );
};
