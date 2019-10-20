import styled from 'styled-components';

import { BREAKPOINT } from '../../constants/constants';

export const Label = styled.label`
  color: var(--color-text-lighter);
  font-size: var(--font-size-s);
  margin-bottom: 3px;

  @media (max-width: ${BREAKPOINT}px) {
    font-size: var(--font-size-xs);
  }
`;
