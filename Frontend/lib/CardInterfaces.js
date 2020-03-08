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
   createdAt
   updatedAt
`;
export { commentFields };

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
         friends {
            __typename
            id
         }
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
         id
         avatar
      }
   }
   partOfStacks {
      __typename
      id
      title
      author {
         id
         avatar
      }
   }
   color
   createdAt
   updatedAt
   privacy
`;
export { smallThingCardFields };

const fullThingFields = `
   __typename
   id
   title
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
         id
         avatar
      }
   }
   partOfStacks {
      __typename
      id
      title
      author {
         id
         avatar
      }
   }
   color
   comments {
      ${commentFields}
   }
   votes {
      __typename
      voter {
         __typename
         id
         displayName
         avatar
         role
      }
      value
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
export { taxFields };

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
         ${smallThingCardFields}
      }
      value
      createdAt
   }
   createdThings {
      ${smallThingCardFields}
   }
   defaultPrivacy
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
      onComment {
         __typename
         id
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
