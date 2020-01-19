import styled from 'styled-components';
import { setAlpha } from './functions';

const StyledMemberPage = styled.div`
   display: flex;
   .sidebar {
      flex-basis: 100%;
      flex-wrap: wrap;
      @media screen and (min-width: 800px) {
         flex-basis: 25%;
      }
   }
   .myStuffContainer {
      flex-basis: 75%;
      flex-grow: 1;
      position: relative;
      max-height: 100%;
      ${props => props.theme.scroll};
      padding: 2rem;
      .stuffWrapper {
         position: absolute;
         top: 3rem;
         left: 3%;
         width: 94%;
         max-height: 100%;
         .stuffSelector {
            display: flex;
            justify-content: space-between;
            border: 3px solid ${props => props.theme.lowContrastGrey};
            margin-bottom: 3rem;
            .tab {
               border-right: 3px solid ${props => props.theme.lowContrastGrey};
               display: block;
               flex-grow: 1;
               text-align: center;
               padding: 0.25rem 0;
               cursor: pointer;
               &:last-child {
                  border-right: none;
               }
               &.selected {
                  background: ${props =>
                     setAlpha(props.theme.lowContrastGrey, 0.4)};
                  &:hover {
                     background: ${props =>
                        setAlpha(props.theme.lowContrastGrey, 0.4)};
                  }
               }
               &:hover {
                  background: ${props =>
                     setAlpha(props.theme.lowContrastGrey, 0.25)};
               }
            }
         }
         .friends {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(30rem, 35rem));
            grid-gap: 4rem;
            align-items: stretch;
         }
      }
   }
`;
export default StyledMemberPage;
