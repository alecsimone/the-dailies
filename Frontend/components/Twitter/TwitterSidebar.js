import styled from 'styled-components';
import { setAlpha } from '../../styles/functions';

const StyledTwitterSidebar = styled.div`
   padding: 0 2rem;
   h5 {
      font-size: ${props => props.theme.bigText};
      position: relative;
      margin: 1rem 0;
      a.twitterName {
         color: ${props => props.theme.secondaryAccent};
      }
   }
   .listLink {
      padding: 0.6rem 1rem;
      border-radius: 3px;
      line-height: 1;
      &.selected {
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      }
      &.loading {
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.5)};
      }
      cursor: pointer;
      span {
         color: ${props => props.theme.lowContrastGrey};
         margin-left: 0.5rem;
         font-weight: 300;
      }
   }
   .updateLists {
      font-size: ${props => props.theme.tinyText};
      color: ${props => props.theme.lowContrastGrey};
      margin-top: 2rem;
      display: flex;
      align-items: center;
      svg {
         margin-left: 1rem;
         width: ${props => props.theme.smallText};
         opacity: 0.25;
         cursor: pointer;
         &:hover {
            opacity: 0.6;
         }
         &.loading {
            ${props => props.theme.spinBackward};
         }
      }
   }
`;

const TwitterSidebar = ({ listElements }) => (
   <StyledTwitterSidebar className="twitterSidebar">
      {listElements}
   </StyledTwitterSidebar>
);
export default TwitterSidebar;
