import styled, { keyframes } from 'styled-components';

import { BREAKPOINT } from '../../constants/constants';

const animation = keyframes`
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0.9);
  }
`;

interface Props {
  secondary?: boolean;
}

export const Button = styled.button`
  align-items: center;
  background-color: ${(props: Props): string =>
    props.secondary ? 'transparent' : 'var(--color-accent)'};
  border-radius: var(--radius-l);
  color: var(--color-dark);
  display: flex;
  font-weight: 700;
  height: 52px;
  justify-content: center;
  margin: 0 auto;
  transition: 0.5s;
  width: 300px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  :active {
    animation: ${animation} 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  }

  @media (max-width: ${BREAKPOINT}px) {
    width: 280px;
  }
`;
