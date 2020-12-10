import styled from 'styled-components';
import CommentIcon from '../Icons/CommentIcon';
import { setLightness } from '../../styles/functions';

const StyledCommentsButton = styled.div`
   position: relative;
   width: ${props => props.theme.smallText};
   height: ${props => props.theme.smallText};
   margin-bottom: 1rem;
   .commentButton {
      position: absolute;
      right: 0;
      bottom: 0;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      span.commentCount {
         position: relative;
         font-size: ${props => props.theme.tinyText};
         font-weight: bold;
         z-index: 2;
         line-height: 1;
         margin-bottom: 0.4rem;
         ${props => props.theme.desktopBreakpoint} {
            margin-bottom: 0.6rem;
         }
      }
      .commentIcon {
         position: absolute;
         left: 0;
         top: 0;
         width: 100%;
         height: 100%;
         z-index: 1;
      }
      &:hover {
         rect,
         polygon {
            fill: ${props => setLightness(props.theme.lowContrastGrey, 40)};
         }
      }
   }
`;

const CommentsButton = ({ onClick, count }) => (
   <StyledCommentsButton className="commentButtonWrapper" onClick={onClick}>
      <div className="commentButton">
         <span className="commentCount">{count < 100 ? count : '+'}</span>
         <CommentIcon />
      </div>
   </StyledCommentsButton>
);

export default CommentsButton;
