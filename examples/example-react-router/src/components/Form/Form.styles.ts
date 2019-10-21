import styled from 'styled-components';

import { BREAKPOINT } from '../../constants/constants';

interface Props {
  narrow?: boolean;
}

export const Form = styled.form`
  backdrop-filter: blur(2px);
  background-color: var(--color-background-translucent);
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: ${(props: Props): string => (props.narrow ? '60%' : '100%')};

  @media (max-width: ${BREAKPOINT}px) {
    width: 100%;
  }
`;
