const fullThingFields = `
   __typename
   id
   title
   author {
      __typename
      id
      displayName
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
   }
   partOfCategory {
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
   }
   votes {
      __typename
      voter {
         __typename
         id
         displayName
         avatar
         roles
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
         roles
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
