import { css } from 'styled-components';
import { setAlpha, setLightness } from './functions';

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

const StyledThingsPage = css`
   .things .flexibleThingCard {
      margin: 0 auto 2rem;
      max-width: 100%;
      ${props => props.theme.mobileBreakpoint} {
         max-width: min(1200px, calc(100% - 1rem));
         margin-bottom: 4rem;
      }
      header.flexibleThingHeader .headerTop .headerRight .titleWrapper {
         a,
         a:visited {
            font-size: ${props => props.theme.bigText};
         }
      }
      .contentSectionWrapper .locked .contentBlock.clickToShowComments {
         .newcontentButtons.showingComments {
            ${props => props.theme.mobileBreakpoint} {
               margin-left: -3rem;
            }
         }
         .flexibleThingCard
            .contentSectionWrapper
            .locked
            .contentBlock.clickToShowComments
            .newcontentButtons.showingComments {
            margin-left: 0; /* For things within things, we don't want to give the newcontent buttons a negative margin left when showing comments */
         }
      }
      .flexibleThingCard {
         margin: 2rem 0;
      }
   }
`;
export { StyledThingsPage };
