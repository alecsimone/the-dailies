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
   partOfTags {
      __typename
      id
      title
      author {
         id
      }
      public
   }
   partOfCategory {
      __typename
      id
      title
      color
   }
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
   partOfTags {
      __typename
      id
      title
      author {
         id
      }
      public
   }
   partOfCategory {
      __typename
      id
      title
      color
   }
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
   public
   content {
      __typename
      id
      content
   }
   connectedThings {
      ${smallThingCardFields}
   }
   comments {
      ${commentFields}
   }
   createdAt
`;
export { tagFields };

const catFields = `
   __typename,
   id
   title
   featuredImage
   color
   content {
      __typename
      id
      content
   }
   connectedThings {
      ${smallThingCardFields}
   }
   comments {
      ${commentFields}
   }
   createdAt
`;
export { catFields };

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
   defaultCategory {
      __typename
      id
      title
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
      onCategory {
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
