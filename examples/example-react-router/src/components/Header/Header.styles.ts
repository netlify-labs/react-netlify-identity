import styled from 'styled-components';

import { BREAKPOINT } from '../../constants/constants';

export const FixedBar = styled.div`
  background-color: var(--color-light-translucent);
  backdrop-filter: blur(2px);
  height: 60px;
  left: 0;
  padding: 10px 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 2;
`;

export const Title = styled.h1`
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-top: -5px;

  @media (max-width: ${BREAKPOINT}px) {
    font-size: var(--font-size-l);
  }
`;
