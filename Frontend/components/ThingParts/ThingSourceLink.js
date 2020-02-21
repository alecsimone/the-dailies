import gql from 'graphql-tag';
import { useContext, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { ThingContext } from '../../pages/thing';
import { MemberContext } from '../Account/MemberProvider';
import ShortLink from './ShortLink';
import { setFullThingToLoading } from './FullThing';
import {
   checkForNewThingRedirect,
   disabledCodewords
} from '../../lib/ThingHandling';
import { urlFinder } from '../../lib/UrlHandling';
import EditThis from '../Icons/EditThis';

const EDIT_LINK_MUTATION = gql`
   mutation EDIT_LINK_MUTATION($link: String!, $id: ID!) {
      editLink(link: $link, id: $id) {
         __typename
         id
         link
      }
   }
`;

const ThingSourceLink = ({ canEdit }) => {
   const { id, author, link } = useContext(ThingContext);
   const { me } = useContext(MemberContext);

   const [editable, setEditable] = useState(false);
   const [currentLink, setCurrentLink] = useState(link);

   const [editLink, { loading: editLinkLoading }] = useMutation(
      EDIT_LINK_MUTATION,
      {
         onCompleted: data => checkForNewThingRedirect(id, 'editLink', data)
      }
   );

   const sendNewLink = async () => {
      const url = currentLink.match(urlFinder);
      if (url == null && !disabledCodewords.includes(currentLink)) {
         window.alert("That's not a valid link, sorry");
         return;
      }
      setFullThingToLoading(id);
      await editLink({
         variables: {
            link: currentLink,
            id
         }
      });
      setEditable(false);
   };

   let content;
   if (editable || link === '' || link == null) {
      let size = 50;
      if (currentLink) {
         size = currentLink.length > 100 ? 100 : currentLink.length;
      }
      content = (
         <form
            onSubmit={e => {
               e.preventDefault();
               sendNewLink();
            }}
         >
            <input
               type="text"
               size={size}
               value={currentLink == null ? '' : currentLink}
               aria-disabled={editLinkLoading}
               onChange={e => setCurrentLink(e.target.value)}
            />
         </form>
      );
   } else if (link == null || disabledCodewords.includes(link)) {
      content = '';
   } else {
      content = <ShortLink link={link} limit={100} />;
   }

   return (
      <div className="link">
         re: {content}
         {canEdit && <EditThis onClick={() => setEditable(!editable)} />}
      </div>
   );
};

export default ThingSourceLink;
