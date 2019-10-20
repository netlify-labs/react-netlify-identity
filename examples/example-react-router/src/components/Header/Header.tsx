import React from 'react';

import { FixedBar, Title } from './Header.styles';
import { Container } from '../../components';

interface Props {
  name?: string;
}

export const Header: React.FunctionComponent<Props> = (props: Props) => {
  if (props.name) {
    return (
      <FixedBar>
        <Container row between>
          <Title>{props.name}</Title>
        </Container>
      </FixedBar>
    );
  } else {
    return (
      <FixedBar>
        <Container row between>
          <Title>Home</Title>
        </Container>
      </FixedBar>
    );
  }
};
