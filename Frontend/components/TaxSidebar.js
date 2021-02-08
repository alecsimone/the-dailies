import { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import FeaturedImage from './ThingParts/FeaturedImage';
import StuffSummary from './ThingParts/StuffSummary';
import Content from './ThingParts/Content';
import TaxMeta from './TaxMeta';
import Comments from './ThingParts/Comments';

const StyledTaxSidebar = styled.div`
   padding: 2rem;
   ${props => props.theme.midScreenBreakpoint} {
      .contentSectionWrapper {
         .contentBlock {
            padding: 1rem 1.5rem;
            .contentArea
               .contentPiece
               .overflowWrapper
               .contentAndCommentContainer {
               .contentWrapper {
                  max-width: 100%;
                  min-width: 100%;
                  border-right: none;
                  &.doesNotGiveSize {
                     max-width: 0;
                     min-width: 0;
                     .theActualContent,
                     .votebar {
                        display: none;
                     }
                  }
               }
               .commentsWrapper {
                  width: 100%;
                  .commentsArea {
                     padding: 0;
                  }
               }
            }
         }
      }
   }
`;

const TaxSidebar = ({ context, canEdit }) => {
   const { title, id, summary } = useContext(context);

   return (
      <StyledTaxSidebar>
         <FeaturedImage
            context={context}
            key={`${title}-FeaturedImage`}
            canEdit={canEdit}
         />
         <TaxMeta context={context} key={`${title}-Meta`} canEdit={canEdit} />
         <StuffSummary
            summary={summary}
            stuffID={id}
            key={`${id}-Summary`}
            canEdit={canEdit}
            type="Tag"
         />
         <Content
            context={context}
            key={`${title}-Content`}
            canEdit={canEdit}
         />
         <Comments context={context} key={`${title}-Comments`} />
      </StyledTaxSidebar>
   );
};
TaxSidebar.propTypes = {
   context: PropTypes.shape({
      Consumer: PropTypes.object.isRequired,
      Provider: PropTypes.object.isRequired
   }).isRequired,
   canEdit: PropTypes.bool
};

export default TaxSidebar;
