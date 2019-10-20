import styled from 'styled-components';

export const Input = styled.input`
  background-color: white;
  border: 3px solid transparent;
  border-radius: var(--radius-m);
  height: 50px;
  margin: 0 auto 15px auto;
  padding: 0px 20px;

  :focus {
    border: 3px solid var(--color-accent-light);
    transition: border 0.2s ease-in;
  }
`;
