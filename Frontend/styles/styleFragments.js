import { css } from 'styled-components';

const fullSizedLoadMoreButton = css`
   button.loadMore {
      display: block;
      padding: 1rem;
      font-size: ${props => props.theme.bigText};
      margin: 2rem auto;
   }
   div.loadMore {
      font-size: ${props => props.theme.smallHead};
      text-align: center;
      margin: 1rem 0 4rem;
      font-weight: bold;
   }
`;

export { fullSizedLoadMoreButton };
