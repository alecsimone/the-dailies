import gql from 'graphql-tag';
import {
   basicMemberFields,
   collectionGroupFields,
   fullCollectionFields,
   fullThingFields,
   thingCardFields
} from '../../lib/CardInterfaces';

const COLLECTIONS_PAGE_QUERY = gql`
   query COLLECTIONS_PAGE_QUERY {
      getCollections {
         __typename
         id
         lastActiveCollection {
            ${fullCollectionFields}
         }
         collections {
            __typename
            id
            title
         }
      }
   }
`;
export { COLLECTIONS_PAGE_QUERY };

const SPECIFIC_COLLECTION_QUERY = gql`
   query SPECIFIC_COLLECTION_QUERY($id: ID!) {
      getCollection(id: $id) {
         ${fullCollectionFields}
      }
   }
`;
export { SPECIFIC_COLLECTION_QUERY };

const MY_BIG_THINGS_QUERY = gql`
   query MY_THINGS_QUERY($cursor: String, $forCollection: ID) {
      myThings(cursor: $cursor, forCollection: $forCollection) {
         ${fullThingFields}
      }
   }
`;
export { MY_BIG_THINGS_QUERY };

const ADD_COLLECTION_MUTATION = gql`
   mutation ADD_COLLECTION_MUTATION {
      addCollection {
         ${basicMemberFields}
      }
   }
`;
export { ADD_COLLECTION_MUTATION };

const DELETE_COLLECTION_MUTATION = gql`
   mutation DELETE_COLLECTION_MUTATION($collectionID: ID!) {
      deleteCollection(collectionID: $collectionID) {
         ${basicMemberFields}
      }
   }
`;
export { DELETE_COLLECTION_MUTATION };

const SET_ACTIVE_COLLECTION_MUTATION = gql`
   mutation SET_ACTIVE_COLLECTION_MUTATION($collectionID: ID!) {
      setActiveCollection(collectionID: $collectionID) {
         __typename
         id
         lastActiveCollection {
            ${fullCollectionFields}
         }
      }
   }
`;
export { SET_ACTIVE_COLLECTION_MUTATION };

const RENAME_COLLECTION_MUTATION = gql`
   mutation RENAME_COLLECTION_MUTATION($collectionID: ID!, $newTitle: String!) {
      renameCollection(collectionID: $collectionID, newTitle: $newTitle) {
         __typename
         id
         title
      }
   }
`;
export { RENAME_COLLECTION_MUTATION };

const ADD_GROUP_TO_COLLECTION_MUTATION = gql`
   mutation ADD_GROUP_TO_COLLECTION_MUTATION(
      $collectionID: ID!
      $newGroupID: String!
      $columnID: String!
   ) {
      addGroupToCollection(
         collectionID: $collectionID
         newGroupID: $newGroupID
         columnID: $columnID
      ) {
         __typename
         id
         userGroups {
            ${collectionGroupFields}
         }
         columnOrders {
            __typename
            id
            order
         }
      }
   }
`;
export { ADD_GROUP_TO_COLLECTION_MUTATION };

const DELETE_GROUP_FROM_COLLECTION_MUTATION = gql`
   mutation DELETE_GROUP_FROM_COLLECTION_MUTATION(
      $collectionID: ID!
      $groupID: String!
   ) {
      deleteGroupFromCollection(
         collectionID: $collectionID
         groupID: $groupID
      ) {
         __typename
         id
         userGroups {
            ${collectionGroupFields}
         }
      }
   }
`;
export { DELETE_GROUP_FROM_COLLECTION_MUTATION };

const RENAME_GROUP_MUTATION = gql`
   mutation RENAME_GROUP_MUTATION($collectionID: ID!, $groupID: String!, $newTitle: String!) {
      renameGroupOnCollection(collectionID: $collectionID, groupID: $groupID, newTitle: $newTitle) {
         __typename
         id
         userGroups {
            ${collectionGroupFields}
         }
      }
   }
`;
export { RENAME_GROUP_MUTATION };

const COPY_THING_TO_GROUP_MUTATION = gql`
   mutation COPY_THING_TO_GROUP_MUTATION($collectionID: ID!, $thingID: ID!, $targetGroupID: String!) {
      copyThingToCollectionGroup(collectionID: $collectionID, thingID: $thingID, targetGroupID: $targetGroupID) {
         __typename
         id
         userGroups {
            ${collectionGroupFields}
         }
      }
   }
`;
export { COPY_THING_TO_GROUP_MUTATION };

const ADD_LINK_TO_GROUP_MUTATION = gql`
   mutation ADD_LINK_TO_GROUP_MUTATION($url: String!, $groupID: ID!, $position: Int) {
      addLinkToCollectionGroup(url: $url, groupID: $groupID, position: $position) {
         ${collectionGroupFields}
      }
   }
`;
export { ADD_LINK_TO_GROUP_MUTATION };

const REMOVE_LINK_FROM_COLLECTION_GROUP = gql`
   mutation REMOVE_LINK_FROM_COLLECTION_GROUP($linkID: ID!, $groupID: ID!) {
      removeLinkFromCollectionGroup(linkID: $linkID, groupID: $groupID) {
         ${collectionGroupFields}
      }
   }
`;
export { REMOVE_LINK_FROM_COLLECTION_GROUP };

const REORDER_GROUPS_MUTATION = gql`
   mutation REORDER_GROUPS_MUTATION(
      $groupOneID: ID
      $newOrderOne: [String!]
      $groupTwoID: ID
      $newOrderTwo: [String!]
   ) {
      reorderGroups(
         groupOneID: $groupOneID
         newOrderOne: $newOrderOne
         groupTwoID: $groupTwoID
         newOrderTwo: $newOrderTwo
      ) {
         __typename
         id
         order
      }
   }
`;
export { REORDER_GROUPS_MUTATION };

const MOVE_CARD_TO_GROUP_MUTATION = gql`
   mutation MOVE_CARD_TO_GROUP_MUTATION(
      $linkID: ID!
      $cardType: String
      $sourceGroupID: ID
      $destinationGroupID: ID
      $newPosition: Int
   ) {
      moveCardToGroup(
         linkID: $linkID
         cardType: $cardType
         sourceGroupID: $sourceGroupID
         destinationGroupID: $destinationGroupID
         newPosition: $newPosition
      ) {
         ${collectionGroupFields}
      }
   }
`;
export { MOVE_CARD_TO_GROUP_MUTATION };

const MOVE_GROUP_TO_COLUMN_MUTATION = gql`
   mutation MOVE_GROUP_TO_COLUMN_MUTATION(
      $groupID: ID!
      $sourceColumnID: ID
      $destinationColumnID: ID
      $newPosition: Int
   ) {
      moveGroupToColumn(
         groupID: $groupID
         sourceColumnID: $sourceColumnID
         destinationColumnID: $destinationColumnID
         newPosition: $newPosition
      ) {
         __typename
         id
         order
      }
   }
`;
export { MOVE_GROUP_TO_COLUMN_MUTATION };

const REORDER_GROUP_MUTATION = gql`
   mutation REORDER_GROUP_MUTATION($groupID: ID!, $linkID: ID!, $newPosition: Int!) {
      reorderGroup(groupID: $groupID, linkID: $linkID, newPosition: $newPosition) {
         ${collectionGroupFields}
      }
   }
`;
export { REORDER_GROUP_MUTATION };

const REORDER_COLUMN_MUTATION = gql`
   mutation REORDER_COLUMN_MUTATION(
      $columnID: ID!
      $groupID: ID!
      $newPosition: Int!
   ) {
      reorderColumn(
         columnID: $columnID
         groupID: $groupID
         newPosition: $newPosition
      ) {
         __typename
         id
         order
      }
   }
`;
export { REORDER_COLUMN_MUTATION };

const ADD_TAX_BY_ID_MUTATION = gql`
   mutation ADD_TAX_BY_ID_MUTATION($tax: ID!, $thingID: ID!, $personal: Boolean) {
      addTaxToThingById(tax: $tax, thingID: $thingID, personal: $personal) {
         ${thingCardFields}
      }
   }
`; // Requested fields have to be thingCardFields instead of smallThingCardFields because smallThingCardFields doesn't include partOfTags, so this won't actually tell us anything about the new tags
export { ADD_TAX_BY_ID_MUTATION };

const ADD_NOTE_MUTATION = gql`
   mutation ADD_NOTE_MUTATION($groupID: ID!, $position: Int) {
      addNoteToGroup(groupID: $groupID, position: $position) {
         ${collectionGroupFields}
      }
   }
`;
export { ADD_NOTE_MUTATION };

const DELETE_NOTE_MUTATION = gql`
   mutation DELETE_NOTE_MUTATION($noteID: ID!) {
      deleteNote(noteID: $noteID) {
         ${collectionGroupFields}
      }
   }
`;
export { DELETE_NOTE_MUTATION };

const EDIT_NOTE_MUTATION = gql`
   mutation EDIT_NOTE_MUTATION($noteID: ID!, $newContent: String!) {
      editNote(noteID: $noteID, newContent: $newContent) {
         __typename
         id
         content
      }
   }
`;
export { EDIT_NOTE_MUTATION };
