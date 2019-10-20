import React from 'react';
import { useIdentityContext } from 'react-netlify-identity';

import { Logo, StyledButton } from './ButtonGoogle.styles';
import { googleLogo } from '../../assets';

interface Props {
  children: string;
}

export const ButtonGoogle: React.FunctionComponent<Props> = (props: Props) => {
  const { loginProvider } = useIdentityContext();

  const logInWithGoogle = (): void => {
    loginProvider('google');
  };

  return (
    <StyledButton onClick={logInWithGoogle}>
      <Logo src={googleLogo} />
      {props.children}
    </StyledButton>
  );
};
