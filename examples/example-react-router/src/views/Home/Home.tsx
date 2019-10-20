import React from 'react';
import { useIdentityContext } from 'react-netlify-identity';
import { Redirect } from 'react-router-dom';

import { Container, Header } from '../../components';
import { LogOutButton } from './Home.styles';

export const Home: React.FunctionComponent = () => {
  const { user, logoutUser } = useIdentityContext();

  const logOut = (): void => {
    logoutUser();
    <Redirect to="/" />;
  };

  return (
    <>
      <Header />
      <Container paddingBottom={'medium'}>
        <h1 style={{ marginTop: '10vh' }}>
          Hello {JSON.stringify(user!.email)}
        </h1>
        <LogOutButton secondary onClick={logOut}>
          Log out
        </LogOutButton>
      </Container>
    </>
  );
};
