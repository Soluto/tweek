import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import React, { ComponentProps } from 'react';

const spin = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const Svg = styled.svg`
  width: 50px;
  height: 50px;
  animation: ${spin} 2s linear infinite;
`;

const dash = keyframes`
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
`;

const Circle = styled.circle`
  stroke: #009fda;
  stroke-linecap: round;
  animation: ${dash} 1.5s ease-in-out infinite;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Loader = (props: ComponentProps<'svg'>) => (
  <Container>
    <Svg viewBox="0 0 50 50" {...props}>
      <Circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
    </Svg>
  </Container>
);

export default Loader;
