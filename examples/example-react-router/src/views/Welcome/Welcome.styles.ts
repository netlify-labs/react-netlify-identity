import styled from 'styled-components';

import { BREAKPOINT } from '../../constants/constants';

export const Intro = styled.h1`
  font-weight: 700;
  font-size: var(--font-size-xxl);
  margin-bottom: 2vh;
  text-align: center;

  @media (max-width: ${BREAKPOINT}px) {
    font-size: var(--font-size-xl);
  }
`;

export const Layout = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;
