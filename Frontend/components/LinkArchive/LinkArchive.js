import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { fullPersonalLinkFields } from '../../lib/CardInterfaces';
import { getRandomString } from '../../lib/TextHandling';
import { setAlpha } from '../../styles/functions';
import useMe from '../Account/useMe';
import AddLinkInput from './AddLinkInput';
import PersonalLinkCard from './PersonalLinkCard';

const ADD_LINK_MUTATION = gql`
   mutation ADD_LINK_MUTATION($url: String!, $tags: String) {
      addLinkToArchive(url: $url, tags: $tags) {
         __typename
         id
         ownedLinks {
            ${fullPersonalLinkFields}
         }
      }
   }
`;

const StyledLinkArchive = styled.div`
   padding: 0 3rem;
   .addLinkWrapper {
      text-align: center;
      margin-top: 2rem;
      input {
         font-size: ${props => props.theme.bigText};
         text-align: center;
         background: ${props => setAlpha(props.theme.lightBlack, 0.6)};
         border-radius: 3px;
         width: 60rem;
         max-width: 90%;
      }
   }
   .links {
      margin-top: 2rem;
      .personalLinkCard {
         width: 60rem;
         padding: 1rem;
         background: ${props => props.theme.lightBlack};
         margin: 1rem 0;
         ${props => props.theme.thingColors};
         border-radius: 0.4rem;
         &:first-child {
            margin-top: 0;
         }
         &:last-child {
            margin-bottom: 0;
         }
         h3.personalLinkTitle {
            margin: 0;
            font-weight: 500;
            font-size: ${props => props.theme.bigText};
         }
         .description {
            font-weight: 300;
         }
         .personalLinkWrapper {
            .linkCard {
            }
            a.shortlink {
            }
            img,
            video {
               max-height: 58rem;
               max-width: 58rem;
               object-fit: contain;
               display: block;
               margin: auto;
            }
         }
         .tagList {
            font-size: ${props => props.theme.miniText};
            width: 100%;
            text-align: left;
            span.tagMarker {
               color: ${props => props.theme.primaryAccent};
               font-weight: bold;
               margin-right: 0.5rem;
            }
         }
         input.addTag {
            width: 100%;
            font-size: ${props => props.theme.miniText};
            margin-top: 0;
         }
      }
   }
`;

const LinkArchive = ({ links }) => {
   const [addLink] = useMutation(ADD_LINK_MUTATION, {
      onError: err => alert(err.message)
   });

   const { loggedInUserID } = useMe();

   const addLinkHandler = (url, tags) => {
      const variables = {
         url
      };

      if (tags != null) {
         variables.tags = tags;
      }

      const now = new Date();

      const ownedLinks = JSON.parse(JSON.stringify(links));

      const newLink = {
         __typename: 'PersonalLink',
         id: `temporary-${getRandomString(12)}`,
         url,
         owner: {
            __typename: 'Member',
            id: loggedInUserID
         },
         title: 'Checking for link data...',
         description: null,
         partOfTags: [],
         createdAt: now.toISOString(),
         updatedAt: now.toISOString()
      };

      if (tags != null) {
         newLink.partOfTags.push({ __typename: 'LinkTag', id: tags });
      }

      ownedLinks.push(newLink);

      addLink({
         variables,
         optimisticResponse: {
            __typename: 'Mutation',
            addLinkToArchive: {
               __typename: 'Member',
               id: loggedInUserID,
               ownedLinks
            }
         }
      });
   };

   const sortedLinks = JSON.parse(JSON.stringify(links));
   sortedLinks.sort((a, b) => {
      const aDate = new Date(a.createdAt);
      const bDate = new Date(b.createdAt);

      const aTimestamp = aDate.getTime();
      const bTimestamp = bDate.getTime();

      return bTimestamp - aTimestamp;
   });

   const linkElements = sortedLinks.map(link => (
      <PersonalLinkCard linkData={link} />
   ));
   return (
      <StyledLinkArchive>
         <div className="addLinkWrapper">
            <AddLinkInput addLinkHandler={addLinkHandler} />
         </div>
         <div className="links">{linkElements}</div>
      </StyledLinkArchive>
   );
};

export default LinkArchive;
