import { useApolloClient, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useState } from 'react';
import { collectionGroupFields } from '../../lib/CardInterfaces';
import { ADD_LINK_TO_GROUP_MUTATION } from './queriesAndMutations';

const CopyCardInterface = ({ cardData, collectionID }) => {
   const { id: cardID, url } = cardData;

   const client = useApolloClient();

   const [addLinkToCollectionGroup] = useMutation(ADD_LINK_TO_GROUP_MUTATION, {
      onError: err => alert(err.message)
   });

   const [showingCopyTargets, setShowingCopyTargets] = useState(false);

   const { userGroups } = client.readFragment({
      id: `Collection:${collectionID}`,
      fragment: gql`
         fragment CollectionForCopyInterface on Collection {
            userGroups {
               ${collectionGroupFields}
            }
         }
      `
   });

   // First we need to figure out if there are any groups that don't have this card in them already and make an array of the groups that don't.
   let filteredGroups = [];
   if (userGroups != null && userGroups.length > 0) {
      filteredGroups = userGroups.filter(groupObj => {
         let groupHasThisCardAlready = false;
         groupObj.includedLinks.forEach(linkObj => {
            if (groupHasThisCardAlready) return;
            if (linkObj.id === cardID) {
               groupHasThisCardAlready = true;
            }
         });
         return !groupHasThisCardAlready;
      });
   }

   if (filteredGroups.length === 0) return null;

   // Then we need to make an option element for each remaining group
   const copyToGroupOptions = filteredGroups.map(groupObj => (
      <option value={groupObj.id} key={groupObj.id}>
         {groupObj.title}
      </option>
   ));

   copyToGroupOptions.unshift(
      <option value="prompt" key="selectGroup">
         Select Group
      </option>
   );

   return (
      <div className="copyInterface">
         <button onClick={() => setShowingCopyTargets(!showingCopyTargets)}>
            {showingCopyTargets ? 'close' : 'copy'}
         </button>
         {showingCopyTargets && (
            <select
               value="prompt"
               onChange={e => {
                  if (
                     e.target.value != null &&
                     e.target.value !== '' &&
                     e.target.value !== 'prompt'
                  ) {
                     const newUserGroups = [...userGroups];
                     const targetGroup = newUserGroups.find(
                        targetGroupObj => targetGroupObj.id === e.target.value
                     );
                     targetGroup.includedLinks.push(cardData);
                     targetGroup.order.push(cardData.id);

                     addLinkToCollectionGroup({
                        variables: {
                           url,
                           groupID: e.target.value
                        },
                        optimisticResponse: {
                           __typename: 'Mutation',
                           addLinkToCollectionGroup: targetGroup
                        }
                     });
                     setShowingCopyTargets(false);
                  }
               }}
            >
               {copyToGroupOptions}
            </select>
         )}
      </div>
   );
};

export default CopyCardInterface;
