import gql from 'graphql-tag';
import {
   collectionGroupFields,
   fullCollectionFields,
   fullMemberFields,
   fullThingFields,
   smallThingCardFields,
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
         ${fullMemberFields}
      }
   }
`;
export { ADD_COLLECTION_MUTATION };

const DELETE_COLLECTION_MUTATION = gql`
   mutation DELETE_COLLECTION_MUTATION($collectionID: ID!) {
      deleteCollection(collectionID: $collectionID) {
         ${fullMemberFields}
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

const HIDE_GROUP_ON_COLLECTION_MUTATION = gql`
   mutation HIDE_GROUP_ON_COLLECTION_MUTATION(
      $collectionID: ID!
      $groupID: String!
   ) {
      hideGroupOnCollection(
         collectionID: $collectionID
         groupID: $groupID
      ) {
         __typename
         id
         hiddenGroups {
            ${collectionGroupFields}
         }
      }
   }
`;
export { HIDE_GROUP_ON_COLLECTION_MUTATION };

const SHOW_HIDDEN_GROUPS_ON_COLLECTION_MUTATION = gql`
   mutation SHOW_HIDDEN_GROUPS_ON_COLLECTION_MUTATION(
      $collectionID: ID!
   ) {
      showHiddenGroupsOnCollection(
         collectionID: $collectionID
      ) {
         __typename
         id
         hiddenGroups {
            ${collectionGroupFields}
         }
      }
   }
`;
export { SHOW_HIDDEN_GROUPS_ON_COLLECTION_MUTATION };

const HIDE_TAG_ON_COLLECTION_MUTATION = gql`
   mutation HIDE_TAG_ON_COLLECTION_MUTATION(
      $collectionID: ID!
      $tagID: String!
   ) {
      hideTagOnCollection(collectionID: $collectionID, tagID: $tagID) {
         __typename
         id
         hiddenTags {
            __typename
            id
            author {
               __typename
               id
               displayName
            }
         }
      }
   }
`;
export { HIDE_TAG_ON_COLLECTION_MUTATION };

const SHOW_HIDDEN_TAGS_ON_COLLECTION_MUTATION = gql`
   mutation SHOW_HIDDEN_TAGS_ON_COLLECTION_MUTATION($collectionID: ID!) {
      showHiddenTagsOnCollection(collectionID: $collectionID) {
         __typename
         id
         hiddenTags {
            __typename
            id
            author {
               __typename
               id
               displayName
            }
         }
      }
   }
`;
export { SHOW_HIDDEN_TAGS_ON_COLLECTION_MUTATION };

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
   mutation ADD_LINK_TO_GROUP_MUTATION($url: String!, $groupID: ID!) {
      addLinkToCollectionGroup(url: $url, groupID: $groupID) {
         ${collectionGroupFields}
      }
   }
`;
export { ADD_LINK_TO_GROUP_MUTATION };

const REMOVE_THING_FROM_GROUP_MUTATION = gql`
   mutation REMOVE_THING_FROM_GROUP_MUTATION($collectionID: ID!, $thingID: ID!, $groupID: String!) {
      removeThingFromCollectionGroup(collectionID: $collectionID, thingID: $thingID, groupID: $groupID) {
         __typename
         id
         userGroups {
            ${collectionGroupFields}
         }
      }
   }
`;
export { REMOVE_THING_FROM_GROUP_MUTATION };

const HIDE_THING_ON_COLLECTION_MUTATION = gql`
   mutation HIDE_THING_ON_COLLECTION_MUTATION(
      $collectionID: ID!
      $thingID: ID!
   ) {
      hideThingOnCollection(collectionID: $collectionID, thingID: $thingID) {
         __typename
         id
         hiddenThings {
            __typename
            id
         }
      }
   }
`;
export { HIDE_THING_ON_COLLECTION_MUTATION };

const SHOW_HIDDEN_THINGS_ON_COLLECTION_MUTATION = gql`
   mutation SHOW_HIDDEN_THINGS_ON_COLLECTION_MUTATION($collectionID: ID!) {
      showHiddenThingsOnCollection(collectionID: $collectionID) {
         __typename
         id
         hiddenThings {
            __typename
            id
         }
      }
   }
`;
export { SHOW_HIDDEN_THINGS_ON_COLLECTION_MUTATION };

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

const REORDER_TAGS_MUTATION = gql`
   mutation REORDER_TAGS_MUTATION(
      $groupOneID: String
      $tagOneID: ID
      $newOrderOne: [String!]
      $groupTwoID: String
      $tagTwoID: ID
      $newOrderTwo: [String!]
      $collectionID: ID!
   ) {
      reorderTags(
         groupOneID: $groupOneID
         tagOneID: $tagOneID
         newOrderOne: $newOrderOne
         groupTwoID: $groupTwoID
         tagTwoID: $tagTwoID
         newOrderTwo: $newOrderTwo
         collectionID: $collectionID
      ) {
         __typename
         id
         order
      }
   }
`;
export { REORDER_TAGS_MUTATION };

const REORDER_UNGROUPED_THINGS_MUTATION = gql`
   mutation REORDER_UNGROUPED_THINGS_MUTATION(
      $collectionID: ID!
      $newOrder: [String!]!
   ) {
      reorderUngroupedThings(collectionID: $collectionID, newOrder: $newOrder) {
         __typename
         id
         ungroupedThingsOrder
      }
   }
`;
export { REORDER_UNGROUPED_THINGS_MUTATION };

const MOVE_CARD_TO_GROUP_MUTATION = gql`
   mutation MOVE_CARD_TO_GROUP_MUTATION(
      $thingID: ID!
      $fromGroupID: ID
      $toGroupID: ID
   ) {
      moveCardToGroup(
         thingID: $thingID
         fromGroupID: $fromGroupID
         toGroupID: $toGroupID
      ) {
         __typename
         id
         things {
            ${smallThingCardFields}
         }
      }
   }
`;
export { MOVE_CARD_TO_GROUP_MUTATION };

const ADD_TAX_BY_ID_MUTATION = gql`
   mutation ADD_TAX_BY_ID_MUTATION($tax: ID!, $thingID: ID!, $personal: Boolean) {
      addTaxToThingById(tax: $tax, thingID: $thingID, personal: $personal) {
         ${thingCardFields}
      }
   }
`; // Requested fields have to be thingCardFields instead of smallThingCardFields because smallThingCardFields doesn't include partOfTags, so this won't actually tell us anything about the new tags
export { ADD_TAX_BY_ID_MUTATION };

const SET_COLUMN_ORDER_MUTATION = gql`
   mutation SET_COLUMN_ORDER_MUTATION(
      $columnIDs: [String!]!
      $newOrders: [[String!]]!
      $collectionID: String!
      $isTagOrder: Boolean!
   ) {
      setColumnOrder(
         columnIDs: $columnIDs
         newOrders: $newOrders
         collectionID: $collectionID
         isTagOrder: $isTagOrder
      ) {
         __typename
         id
         columnOrders @skip(if: $isTagOrder) {
            __typename
            id
            order
         }
         tagColumnOrders @include(if: $isTagOrder) {
            __typename
            id
            order
         }
      }
   }
`;
export { SET_COLUMN_ORDER_MUTATION };

const HANDLE_CARD_EXPANSION_MUTATION = gql`
   mutation HANDLE_CARD_EXPANSION_MUTATION(
      $thingID: ID!
      $collectionID: ID!
      $newValue: Boolean!
   ) {
      handleCardExpansion(
         thingID: $thingID
         collectionID: $collectionID
         newValue: $newValue
      ) {
         __typename
         id
         expandedCards
      }
   }
`;
export { HANDLE_CARD_EXPANSION_MUTATION };
