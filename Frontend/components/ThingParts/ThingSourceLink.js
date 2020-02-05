import gql from 'graphql-tag';
import { useContext, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import { ThingContext } from '../../pages/thing';
import { MemberContext } from '../Account/MemberProvider';
import ShortLink from './ShortLink';
import { setFullThingToLoading } from './FullThing';
import { checkForNewThingRedirect } from '../../lib/ThingHandling';

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
   if (editable || id === 'new') {
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
               type="url"
               size={size}
               value={currentLink}
               aria-disabled={editLinkLoading}
               onChange={e => setCurrentLink(e.target.value)}
            />
         </form>
      );
   } else if (link == null) {
      content = '';
   } else {
      content = <ShortLink link={link} limit={100} />;
   }

   return (
      <div className="link">
         re: {content}
         {canEdit && (
            <img
               src="/edit-this.png"
               alt="Edit link"
               onClick={() => setEditable(!editable)}
            />
         )}
      </div>
   );
};

export default ThingSourceLink;
