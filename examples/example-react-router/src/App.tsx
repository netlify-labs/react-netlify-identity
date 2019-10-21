import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import {
  IdentityContextProvider,
  useIdentityContext,
} from 'react-netlify-identity';

import { GlobalStyles } from './components';
import { CreateAccount, Home, LogIn, Welcome } from './views';

interface Props {
  component: React.FunctionComponent;
  exact?: boolean;
  path: string;
}

const PublicRoute: React.FunctionComponent<Props> = (props: Props) => {
  const { isLoggedIn } = useIdentityContext();
  return isLoggedIn ? <Redirect to="/home" /> : <Route {...props} />;
};

const PrivateRoute: React.FunctionComponent<Props> = (props: Props) => {
  const { isLoggedIn } = useIdentityContext();
  return isLoggedIn ? <Route {...props} /> : <Redirect to="/welcome" />;
};

export const App: React.FunctionComponent = () => {
  const url = 'https://react-netlify-identity-example.netlify.com';

  return (
    <>
      <GlobalStyles />
      <IdentityContextProvider url={url}>
        <BrowserRouter>
          <Switch>
            <PublicRoute exact path="/" component={Welcome} />
            <PublicRoute path="/welcome" component={Welcome} />
            <PublicRoute path="/createaccount" component={CreateAccount} />
            <PublicRoute path="/login" component={LogIn} />
            <PrivateRoute path="/home" component={Home} />
          </Switch>
        </BrowserRouter>
      </IdentityContextProvider>
    </>
  );
};
