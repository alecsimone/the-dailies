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
   score
   createdAt
   updatedAt
`;
export { commentFields };

const contentPieceFields = `
   __typename
   id
   content
   comments {
      ${commentFields}
   }
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
`;
export { contentPieceFields };

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
   updatedAt
   createdAt
`;
export { smallThingCardFields };

const thingCardFields = `
   __typename
   id
   title
   featuredImage
   author {
      __typename
      id
      displayName
      avatar
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
   content {
      ${contentPieceFields}
   }
   copiedInContent {
      ${contentPieceFields}
   }
   contentOrder
   summary
   partOfTags {
      __typename
      id
      title
   }
   color
   privacy
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
   createdAt
   updatedAt
`;
export { thingCardFields };

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
   createdAt
   updatedAt
`;
export { fullThingFields };

const taxFields = `
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
      ${thingCardFields}
   }
   comments {
      ${commentFields}
   }
   createdAt
`;
export { taxFields };

const basicMemberFields = `
   __typename
   id
   displayName
   avatar
   rep
   friends {
      __typename
      id
   }
   broadcastView
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
   friendRequests {
      __typename
      id
   }
   ignoredFriendRequests {
      __typename
      id
   }
   defaultExpansion
   defaultPrivacy
   role
   twitterUserName
`;
export { basicMemberFields };

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
      }
   }
   friendRequests {
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
   ignoredFriendRequests {
      __typename
      id
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
         ${thingCardFields}
      }
      value
      createdAt
   }
   createdThings {
      ${thingCardFields}
   }
   defaultPrivacy
   defaultExpansion
   broadcastView
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
export { fullMemberFields };
