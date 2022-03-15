const linkFields = `
   id
      title
      description
      icon
      video
      image
      siteName
      url
      ogURL
`;
export { linkFields };

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
   links {
      ${linkFields}
   }
`;
export { commentFields };

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
   links {
      ${linkFields}
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
   manualUpdatedAt
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
   individualViewPermissions {
      __typename
      id
      displayName
      avatar
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
   manualUpdatedAt
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
      isBlocked
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
      isBlocked
      createdAt
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
      ${fullThingFields}
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

const fullPersonalLinkFields = `
   __typename
   id
   url
   owner {
      id
   }
   title
   description
   partOfTags {
      id
      title
   }
   createdAt
   updatedAt
`;
export { fullPersonalLinkFields };

const collectionGroupFields = `
   __typename
   id
   title
   includedLinks {
      ${fullPersonalLinkFields}
   }
   inCollection {
      id
   }
   order
   createdAt
   updatedAt
`;
export { collectionGroupFields };

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
   ungroupedThingsOrder
   tagOrders {
      __typename
      id
      tag {
         __typename
         id
      }
      order
   }
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
export { fullCollectionFields };

const profileFields = `
   __typename
   id
   displayName
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
   votes(last: 2) {
      __typename
      id
      onThing {
         ${fullThingFields}
      }
      onComment {
         ${commentFields}
      }
      onContentPiece {
         ${contentPieceFields}
      }
      value
      createdAt
   }
   createdThings(last: 2) {
      ${fullThingFields}
   }
   defaultPrivacy
   role
   twitterUserName
   createdAt
`;
export { profileFields };

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
         ${fullThingFields}
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
   votes(last: 2) {
      __typename
      id
      onThing {
         ${fullThingFields}
      }
      onComment {
         ${commentFields}
      }
      onContentPiece {
         ${contentPieceFields}
      }
      value
      createdAt
   }
   createdThings(last: 2) {
      ${fullThingFields}
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
   comments(last: 4) {
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
   ownedLinks {
      ${fullPersonalLinkFields}
   }
   createdAt
`;
export { fullMemberFields };
