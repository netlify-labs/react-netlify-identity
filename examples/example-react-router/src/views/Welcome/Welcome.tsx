import React from 'react';
import { Link } from 'react-router-dom';

import { Intro, Layout } from './Welcome.styles';
import { Button, Container } from '../../components';

export const Welcome: React.FunctionComponent = () => {
  return (
    <>
      <Container between partial>
        <Intro>React Netlify Identity Example</Intro>
        <p>
          This is made with: TypeScript, React, React Router, Netlify Identity,
          and styled-components.
        </p>
        <Layout>
          <Link to="/login">
            <Button>Log in</Button>
          </Link>
        </Layout>
        <Layout>
          <Link to="/createaccount">
            <Button secondary>Create account</Button>
          </Link>
        </Layout>
      </Container>
    </>
  );
};
