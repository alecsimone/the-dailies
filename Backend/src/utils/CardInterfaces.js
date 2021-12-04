const commentFields = `
   __typename
   id
   author {
      __typename
      id
      displayName
      avatar
      rep
      friends {
         __typename
         id
      }
   }
   comment
   replies {
      __typename
      id
      author {
         __typename
         id
         displayName
         avatar
         rep
         friends {
            __typename
            id
         }
      }
      comment
      votes {
         __typename
         id
         voter {
            __typename
            id
            displayName
            rep
            avatar
         }
         value
      }
      createdAt
      updatedAt
   }
   replyTo {
      __typename
      id
      author {
         __typename
         id
         displayName
         avatar
         rep
         friends {
            __typename
            id
         }
      }
      comment
      votes {
         __typename
         id
         voter {
            __typename
            id
            displayName
            rep
            avatar
         }
         value
      }
      createdAt
      updatedAt
   }
   votes {
      __typename
      id
      voter {
         __typename
         id
         displayName
         rep
         avatar
      }
      value
   }
   onContentPiece {
      __typename
      id
      onThing {
         __typename
         id
         title
         author {
            id
            friends {
               id
               friends {
                  id
               }
            }
         }
      }
   }
   onThing {
      __typename
      id
      title
      author {
         id
         friends {
            id
            friends {
               id
            }
         }
      }
   }
   onTag {
      __typename
      id
      title
      author {
         id
         friends {
            id
            friends {
               id
            }
         }
      }
   }
   score
   createdAt
   updatedAt
`;
exports.commentFields = commentFields;

const contentPieceFields = `
   __typename
   id
   content
   unsavedNewContent
   comments {
      ${commentFields}
   }
   onThing {
      __typename
      id
      title
      privacy
      author {
         id
         friends {
            id
            friends {
               id
            }
         }
      }
   }
   onTag {
      __typename
      id
      title
      author {
         id
         friends {
            id
            friends {
               id
            }
         }
      }
   }
   copiedToThings {
      __typename
      id
      title
   }
   votes {
      __typename
      id
      value
      voter {
         __typename
         id
         displayName
         rep
         avatar
      }
   }
   privacy
   individualViewPermissions {
      __typename
      id
      displayName
      avatar
   }
`;
exports.contentPieceFields = contentPieceFields;

// smallThingCardFields need to have author friend and friend of friend info so we can check if they can be seen. It doesn't show up on the frontend as far as I know, but when we make a request to the backend with it we're going to need it
const smallThingCardFields = `
   __typename
   id
   title
   author {
      __typename
      id
      displayName
      rep
      avatar
      friends {
         __typename
         id
         friends {
            __typename
            id
         }
      }
   }
   featuredImage
   privacy
   color
   manualUpdatedAt
   updatedAt
   createdAt
`;
exports.smallThingCardFields = smallThingCardFields;

const fullThingFields = `
   __typename
   id
   title
   author {
      __typename
      id
      avatar
      displayName
      friends {
         __typename
         id
         friends {
            __typename
            id
         }
      }
      rep
   }
   featuredImage
   link
   content {
      ${contentPieceFields}
   }
   unsavedNewContent
   copiedInContent {
      ${contentPieceFields}
   }
   summary
   contentOrder
   partOfTags {
      __typename
      id
      title
      author {
         __typename
         id
         displayName
         avatar
         rep
      }
   }
   color
   comments {
      ${commentFields}
   }
   votes {
      __typename
      id
      value
      voter {
         __typename
         id
         displayName
         rep
         avatar
      }
   }
   score
   privacy
   individualViewPermissions {
      __typename
      id
      displayName
      avatar
   }
   manualUpdatedAt
   subjectConnections {
      id
      subject {
         id
      }
      object {
         id
      }
      relationship
      strength
      createdAt
   }
   objectConnections {
      id
      subject {
         id
      }
      object {
         id
      }
      relationship
      strength
      createdAt
   }
   createdAt
   updatedAt
`;
exports.fullThingFields = fullThingFields;

const tagFields = `
   __typename
   id
   title
   featuredImage
   author {
      __typename
      id
      displayName
      avatar
   }
   color
   content {
      ${contentPieceFields}
   }
   contentOrder
   summary
   connectedThings {
      ${fullThingFields}
   }
   comments {
      ${commentFields}
   }
   createdAt
`;
exports.tagFields = tagFields;

const collectionGroupFields = `
   __typename
   id
   title
   things {
      ${smallThingCardFields}
   }
   order
   createdAt
   updatedAt
`;
exports.collectionGroupFields = collectionGroupFields;

const fullCollectionFields = `
   __typename
   id
   title
   author {
      __typename
      id
      displayName
   }
   filterString
   hiddenThings {
      __typename
      id
   }
   groupByTag
   hiddenTags {
      __typename
      id
      author {
         __typename
         id
         displayName
      }
   }
   hiddenGroups {
      ${collectionGroupFields}
   }
   userGroups {
      ${collectionGroupFields}
   }
   tagOrders {
      __typename
      id
      tag {
         __typename
         id
      }
      order
   }
   ungroupedThingsOrder
   expandedCards
   columnOrders {
      __typename
      id
      order
   }
   tagColumnOrders {
      __typename
      id
      order
   }
   thingQueryCursor
   createdAt
   updatedAt
`;
exports.fullCollectionFields = fullCollectionFields;

const fullMemberFields = `
   __typename
   id
   displayName
   name
   avatar
   rep
   points
   giveableRep
   friends {
      __typename
      id
      displayName
      avatar
      rep
      role
      createdThings {
         ${smallThingCardFields}
      }
      friends {
         __typename
         id
         displayName
         avatar
         rep
         createdThings {
            ${smallThingCardFields}
         }
      }
   }
   friendRequests {
      __typename
      id
      displayName
      avatar
      rep
      role
   }
   ignoredFriendRequests {
      __typename
      id
      displayName
      avatar
      rep
      role
   }
   notifications {
      __typename
      id
      kind
      initiator {
         __typename
         id
         avatar
         rep
         displayName
         role
         friends {
            __typename
            id
         }
      }
      unread
      linkQuery
   }
   twitchName
   email
   votes {
      __typename
      id
      onThing {
         ${smallThingCardFields}
      }
      value
      createdAt
   }
   createdThings {
      ${smallThingCardFields}
   }
   defaultPrivacy
   defaultExpansion
   broadcastView
   lastActiveCollection {
      ${fullCollectionFields}
   }
   collections {
      __typename
      id
      title
   }
   comments {
      __typename
      id
      author {
         __typename
         id
         displayName
         avatar
         rep
      }
      comment
      createdAt
      updatedAt
      onThing {
         __typename
         id
         title
      }
      onTag {
         __typename
         id
         title
      }
   }
   role
   twitterUserName
   createdAt
`;
exports.fullMemberFields = fullMemberFields;
