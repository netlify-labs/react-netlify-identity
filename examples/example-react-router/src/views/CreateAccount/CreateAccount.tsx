import React, { useEffect, useRef, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useIdentityContext } from 'react-netlify-identity';

import { PasswordTip } from './CreateAccount.styles';
import {
  AuthOption,
  AuthText,
  Button,
  ButtonGoogle,
  Container,
  Form,
  Input,
  Label,
  Header,
  TextError,
} from '../../components';

export const CreateAccount: React.FunctionComponent = () => {
  const { loginUser, signupUser } = useIdentityContext();
  const [error, setError] = useState(false);
  const emailInput = useRef<HTMLInputElement>(null!);
  const passwordInput = useRef<HTMLInputElement>(null!);
  const signUpButton = useRef<HTMLButtonElement>(null!);

  useEffect(() => {
    signUpButton.current.disabled = true;
  }, [emailInput, passwordInput]);

  const passwordPattern = /^.{6,}$/;

  const handleChange = (): void => {
    const email = emailInput.current.value;
    const password = passwordInput.current.value;
    if (email && passwordPattern.test(password)) {
      signUpButton.current.disabled = false;
    } else {
      signUpButton.current.disabled = true;
    }
  };

  const signUp = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const email = emailInput.current.value;
    const password = passwordInput.current.value;
    signupUser(email, password, {})
      .then(() => {
        loginUser(email, password, true);
        <Redirect to="/home" />;
      })
      .catch((error) => {
        setError(true);
        console.log(error);
      });
  };

  return (
    <>
      <Header name={'Create account'} />
      <Container>
        <AuthOption>
          <AuthText>Sign up with email:</AuthText>
          <Form narrow onSubmit={signUp}>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              ref={emailInput}
              onChange={handleChange}
            />
            <Label htmlFor="password">
              Password <PasswordTip>(min. 6 characters)</PasswordTip>
            </Label>
            <Input
              type="password"
              id="password"
              ref={passwordInput}
              onChange={handleChange}
            />
            {error ? (
              <TextError>
                The email and/or password seems to be incorrect. Please check it
                and try again.
              </TextError>
            ) : null}
            <Button type="submit" ref={signUpButton}>
              Create account
            </Button>
          </Form>
        </AuthOption>
        <AuthOption>
          <AuthText>Or sign up with Google:</AuthText>
          <ButtonGoogle>Sign up with Google</ButtonGoogle>
        </AuthOption>
      </Container>
    </>
  );
};
