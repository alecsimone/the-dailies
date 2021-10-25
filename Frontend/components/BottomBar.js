import styled from 'styled-components';
import { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import Link from 'next/link';
import Router from 'next/router';
import { useContext } from 'react';
import { setAlpha, setLightness } from '../styles/functions';
import { SET_TITLE_MUTATION } from './ThingParts/TitleBar';
import HomeIcon from './Icons/Home';
import SearchIcon from './Icons/Search';
import X from './Icons/X';
import { ModalContext } from './ModalProvider';
import { myThingsQueryCount, MY_THINGS_QUERY } from './Archives/MyThings';

const StyledBottomBar = styled.section`
   position: fixed;
   bottom: 0;
   left: 0;
   right: 0;
   width: 100%;
   border-top: 2px solid
      ${props => setLightness(props.theme.lowContrastGrey, 10)};
   display: flex;
   justify-content: stretch;
   ${props => props.theme.mobileBreakpoint} {
      display: none;
   }
   z-index: 99;
   .inputWrapper {
      width: 100%;
      position: absolute;
      height: 8rem;
      max-height: 8rem;
      top: calc(-8rem - 2px);
      left: 0;
      padding: 0 1.5rem;
      background: ${props => props.theme.midBlack};
      transition: all 0.1s;
      z-index: 2;
      &.hidden {
         max-height: 0;
         top: 0;
         overflow: hidden;
      }
      input {
         width: 100%;
         margin-top: 1.75rem;
         padding: 0 1.5rem;
         height: 4.5rem;
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
         border-radius: 0;
         font-size: 3rem;
         z-index: 2;
      }
   }
   .bottomBarButton {
      padding: 1.75rem 0;
      flex-grow: 1;
      text-align: center;
      font-weight: 700;
      font-size: ${props => props.theme.bigText};
      background: ${props => props.theme.deepBlack};
      line-height: 1;
      cursor: pointer;
      border-right: 2px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      z-index: 3;
      &:last-child {
         border-right: none;
      }
      svg {
         height: ${props => props.theme.bigText};
         &.x {
            transform: rotate(45deg);
         }
      }
   }
`;

const BottomBar = () => {
   const plusPlaceholder = 'Thing Title';
   const searchPlaceholder = 'Search';
   const [inputPlaceholder, setInputPlaceholder] = useState(false);
   const [inputContent, setInputContent] = useState('');

   const { setThingsSidebarIsOpen } = useContext(ModalContext);

   const [setStuffTitle] = useMutation(SET_TITLE_MUTATION, {
      variables: {
         title: inputContent,
         id: 'new',
         type: 'Thing'
      },
      onCompleted: data => {
         Router.push({
            pathname: '/thing',
            query: {
               id: data.setStuffTitle.id
            }
         });
         setInputPlaceholder(false);
      },
      onError: err => alert(err.message),
      refetchQueries: [
         { query: MY_THINGS_QUERY, variables: { count: myThingsQueryCount } }
      ]
   });

   return (
      <StyledBottomBar className="bottomBar">
         <div
            className={`inputWrapper${
               inputPlaceholder == false ? ' hidden' : ''
            }`}
         >
            <form
               onSubmit={e => {
                  e.preventDefault();
                  if (inputPlaceholder === searchPlaceholder) {
                     Router.push({
                        pathname: '/search',
                        query: {
                           s: inputContent
                        }
                     });
                     setInputPlaceholder(false);
                     setInputContent('');
                  } else if (inputPlaceholder === plusPlaceholder) {
                     setStuffTitle();
                     setInputPlaceholder('Creating Thing...');
                     setInputContent('');
                  }
               }}
            >
               <input
                  type="text"
                  id="bottomBarInput"
                  placeholder={inputPlaceholder || ''}
                  value={inputContent}
                  onChange={e => setInputContent(e.target.value)}
               />
            </form>
         </div>
         <div
            className="bottomBarButton"
            onClick={() => {
               if (
                  inputPlaceholder !== searchPlaceholder &&
                  inputPlaceholder !== false
               ) {
                  setInputContent('');
               }
               setInputPlaceholder(
                  inputPlaceholder === searchPlaceholder
                     ? false
                     : searchPlaceholder
               );
               const bottomBarInput = document.querySelector('#bottomBarInput');
               if (inputPlaceholder === searchPlaceholder) {
                  bottomBarInput.blur();
               } else {
                  bottomBarInput.focus();
               }
            }}
         >
            <SearchIcon color="mainText" />
         </div>
         <Link href="/">
            <div className="bottomBarButton">
               <HomeIcon onClick={() => setThingsSidebarIsOpen(false)} />
            </div>
         </Link>
         <div
            className="bottomBarButton"
            onClick={() => {
               if (
                  inputPlaceholder !== plusPlaceholder &&
                  inputPlaceholder !== false
               ) {
                  setInputContent('');
               } else {
               }
               setInputPlaceholder(
                  inputPlaceholder === plusPlaceholder ? false : plusPlaceholder
               );
               const bottomBarInput = document.querySelector('#bottomBarInput');
               if (inputPlaceholder === plusPlaceholder) {
                  bottomBarInput.blur();
               } else {
                  bottomBarInput.focus();
               }
            }}
         >
            <X color="mainText" rotation={45} />
         </div>
      </StyledBottomBar>
   );
};
export default BottomBar;
