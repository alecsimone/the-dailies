import PropTypes from 'prop-types';
import styled, { ThemeContext } from 'styled-components';
import { useSelector } from 'react-redux';
import { useContext } from 'react';
import TaxMeta from './TaxMeta';
import TitleBar from './ThingParts/TitleBar';
import FeaturedImage from './ThingParts/FeaturedImage';
import Content from './ThingParts/Content/Content';
import Comments from './ThingParts/Comments';

const StyledTaxSidebar = styled.div`
   padding: 2rem;
   .content {
      padding: 0;
      .contentSectionWrapper .contentBlock.clickToShowComments {
         padding: 1rem 0 0 0;
         .contentArea {
            padding: 0 1.5rem;
         }
         .newcontentButtons {
            width: 100%;
            margin-left: 0;
            .buttonsContainer {
               .buttonWrapper {
                  &:last-child {
                     border-right: none;
                  }
               }
            }
         }
      }
   }
   .commentsSection {
      border: none;
      padding: 0;
   }
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
               &.cts {
                  .commentsWrapper {
                     width: 100%;
                     .commentsArea {
                        padding: 0;
                        width: 100%;
                        .richTextArea {
                           margin-top: 0;
                        }
                     }
                  }
               }
            }
            .newContentButtons {
               margin-left: 0;
            }
         }
      }
   }
`;

const TaxSidebar = ({ id, canEdit }) => {
   const color = useSelector(state => state.stuff[`Tag:${id}`].color);

   const { lowContrastGrey } = useContext(ThemeContext);

   const highlightColor = color != null ? color : lowContrastGrey;

   return (
      <StyledTaxSidebar
         className="taxSidebar"
         style={{ borderTop: `0.5rem solid ${highlightColor}` }}
      >
         <TitleBar canEdit={canEdit} type="Tag" id={id} showingScore={false} />
         <FeaturedImage canEdit={canEdit} id={id} type="Tag" />
         <TaxMeta id={id} key={`Tag:${id}-Meta`} canEdit={canEdit} />
         <Content
            contentType="full"
            canEdit={canEdit}
            stuffID={id}
            type="Tag"
         />
         <Comments id={id} type="Tag" />
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
