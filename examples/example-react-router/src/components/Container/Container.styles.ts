import styled from 'styled-components';

import { PAGE_WIDTH } from '../../constants/constants';

interface Props {
  between?: boolean;
  paddingBottom?: string;
  partial?: boolean;
  row?: boolean;
}

export const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: ${(props: Props): string => (props.row ? 'row' : 'column')};
  justify-content: ${(props: Props): string =>
    props.between ? 'space-between' : 'center'};
  height: ${(props: Props): string => (props.partial ? '80vh' : '100%')};
  margin-left: auto;
  margin-right: auto;
  max-width: ${PAGE_WIDTH}px;
  padding-bottom: ${(props: Props): string => {
    switch (props.paddingBottom) {
      case 'large':
        return '200px';
      case 'medium':
        return '120px';
      default:
        return 'auto';
    }
  }};
  padding-left: var(--padding);
  padding-right: var(--padding);
  width: 100%;
`;
