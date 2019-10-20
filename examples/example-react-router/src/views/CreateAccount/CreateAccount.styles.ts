import styled from 'styled-components';

import { BREAKPOINT } from '../../constants/constants';

export const PasswordTip = styled.span`
  color: var(--color-dark-lighter);
  font-size: var(--font-size-xs);

  @media (max-width: ${BREAKPOINT}px) {
    font-size: var(--font-size-xxs);
  }
`;
