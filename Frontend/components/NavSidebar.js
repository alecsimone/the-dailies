import styled from 'styled-components';
import Link from 'next/link';
import { setAlpha } from '../styles/functions';
import Home from './Icons/Home';
import SidebarHeaderIcon from './Icons/SidebarHeaderIcon';
import Search from './Icons/Search';
import X from './Icons/X';
import DefaultAvatar from './Icons/DefaultAvatar';

const StyledNavSidebar = styled.section`
   background: ${props => props.theme.midBlack};
   border-right: 3px solid
      ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   text-align: center;
   a {
      &:hover {
         text-decoration: none;
      }
   }
   padding-top: 1rem;
   .navLine {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 2rem 1.5rem;
      transition: all 0.2s;
      &:hover {
         background: hsla(0, 0%, 100%, 0.05);
         svg {
            &.homeIcon {
               fill: ${props => props.theme.majorColor};
            }
            &.You,
            &.Friends {
               stroke: ${props => props.theme.majorColor};
            }
            &.searchIcon {
               circle {
                  stroke: ${props => props.theme.majorColor};
               }
               path {
                  fill: ${props => props.theme.majorColor};
               }
            }
            &.Tweets {
               path {
                  fill: ${props => props.theme.majorColor};
               }
            }
            &.x {
               rect {
                  fill: ${props => props.theme.majorColor};
               }
            }
            &.defaultAvatar {
               path,
               circle {
                  fill: ${props => props.theme.majorColor};
               }
            }
         }
         .navLabel {
            color: ${props => props.theme.majorColor};
         }
      }
      .navIcon {
         width: 8rem;
         height: ${props => props.theme.bigText};
         display: inline-flex;
         align-items: center;
         justify-content: center;
      }
      .navLabel {
         justify-self: start;
         color: ${props => props.theme.mainText};
         font-size: ${props => props.theme.bigText};
         margin-left: 2rem;
         transition: all 0.2s;
         line-height: 1;
         &:hover {
            text-decoration: none;
         }
      }
      svg {
         width: ${props => props.theme.bigText};
         justify-self: center;
         &.wide {
            width: auto;
            height: ${props => props.theme.bigText};
         }
         &.homeIcon {
            fill: ${props => props.theme.lowContrastGrey};
         }
         &.newPost {
            transform: rotate(45deg);
            &.loading {
               ${props => props.theme.spin};
            }
         }
         &.defaultAvatar {
            rect {
               fill: none;
            }
            path,
            circle {
               fill: ${props => props.theme.lowContrastGrey};
            }
         }
      }
   }
`;

const NavSidebar = ({ showing }) => (
   <StyledNavSidebar
      className={showing ? 'navSidebar visible' : 'navSidebar hidden'}
   >
      <Link href="/">
         <a>
            <div className="navLine">
               <span className="navIcon">
                  <Home />
               </span>
               <span className="navLabel">Home</span>
            </div>
         </a>
      </Link>
      <a>
         <div className="navLine">
            <span className="navIcon">
               <SidebarHeaderIcon icon="You" className="wide" />
            </span>
            <span className="navLabel">My Things</span>
         </div>
      </a>
      <a>
         <div className="navLine">
            <span className="navIcon">
               <SidebarHeaderIcon icon="Friends" className="wide" />
            </span>
            <span className="navLabel">Friends</span>
         </div>
      </a>
      <a>
         <div className="navLine">
            <span className="navIcon">
               <Search />
            </span>
            <span className="navLabel">Search</span>
         </div>
      </a>
      <Link href="/twitter">
         <a>
            <div className="navLine">
               <span className="navIcon">
                  <SidebarHeaderIcon icon="Tweets" className="wide" />
               </span>
               <span className="navLabel">Twitter</span>
            </div>
         </a>
      </Link>
      <a>
         <div className="navLine">
            <span className="navIcon">
               <X color="lowContrastGrey" className="newPost" />
            </span>
            <span className="navLabel">New Thing</span>
         </div>
      </a>
      <a>
         <div className="navLine">
            <span className="navIcon">
               <DefaultAvatar />
            </span>
            <span className="navLabel">Profile</span>
         </div>
      </a>
      <a>
         <div className="navLine">
            <span className="navIcon">
               <X color="lowContrastGrey" />
            </span>
            <span className="navLabel">Logout</span>
         </div>
      </a>
   </StyledNavSidebar>
);

export default NavSidebar;
