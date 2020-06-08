const smallThingCardFields = `
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
      }
   }
   content {
      __typename
      id
      content
   }
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
   partOfStacks {
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
   privacy
`;

const commentFields = `
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
`;
exports.commentFields = commentFields;

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
      }
   }
   featuredImage
   link
   content {
      __typename
      id
      content
   }
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
   partOfStacks {
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
   passes {
      __typename
      passer {
         __typename
         id
         displayName
         avatar
         role
      }
   }
   score
   winner
   finalistDate
   privacy
   eliminated
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
   }
   color
   content {
      __typename
      id
      content
   }
   contentOrder
   connectedThings {
      ${smallThingCardFields}
   }
   comments {
      ${commentFields}
   }
   createdAt
`;
exports.tagFields = tagFields;

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
exports.fullMemberFields = fullMemberFields;
