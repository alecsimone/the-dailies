const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');
const {
   basicMemberFields,
   profileFields
} = require('../../utils/CardInterfaces');

async function publishMeUpdate(ctx) {
   const newMe = await ctx.db.query
      .member(
         {
            where: {
               id: ctx.req.memberId
            }
         },
         `{${basicMemberFields}}`
      )
      .catch(err => {
         console.log(err);
      });
   ctx.pubsub.publish('me', {
      me: {
         node: newMe
      }
   });
   return newMe;
}
exports.publishMeUpdate = publishMeUpdate;

const { properUpdateStuff } = require('../../utils/ThingHandling'); // This needs to be below publishMeUpdate, because properUpdateStuff usese publishMeUpdate, so it gets called before it's defined if we put this require above its definition

async function startSignup(parent, args, ctx, info) {
   args.email = args.email.toLowerCase();
   const password = await bcrypt.hash(args.password, 10).catch(err => {
      console.log(err);
   });
   if (args.displayName.length > 24) {
      args.displayName = args.displayName.substring(0, 24);
   }

   const verificationToken = (await promisify(randomBytes)(20)).toString('hex');
   const verificationTokenExpiry = Date.now() + 1000 * 60 * 60 * 8; // 8 hours to verify yourself

   const member = await ctx.db.mutation
      .createMember(
         {
            data: {
               ...args,
               password,
               role: 'Unverified',
               defaultPrivacy: 'Friends',
               verificationToken,
               verificationTokenExpiry
            }
         },
         info
      )
      .catch(err => {
         console.log(err);
         throw new Error(err);
      });

   const defaultClient = SibApiV3Sdk.ApiClient.instance;
   const apiKey = defaultClient.authentications['api-key'];
   apiKey.apiKey = process.env.MAIL_API_KEY;

   const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
   const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

   sendSmtpEmail.to = [
      {
         email: args.email,
         name: args.displayName
      }
   ];
   sendSmtpEmail.templateId = 1;
   sendSmtpEmail.params = {
      domain: process.env.FRONTEND_URL,
      memberId: member.id,
      verificationToken
   };

   apiInstance
      .sendTransacEmail(sendSmtpEmail)
      .then(
         function(data) {
            console.log(`Send In Blue API called successfully`);
            console.log(data);
         },
         function(error) {
            console.error(error);
            throw new Error(
               'Something has gone terribly wrong with your signup'
            );
         }
      )
      .catch(err => console.log(err));

   const token = jwt.sign({ memberId: member.id }, process.env.APP_SECRET);
   ctx.res.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 4,
      domain: process.env.DOMAIN,
      sameSite: 'lax'
   });
   return member;
}
exports.startSignup = startSignup;

async function login(parent, { email, password }, ctx, info) {
   const member = await ctx.db.query
      .member({
         where: { email: email.toLowerCase() }
      })
      .catch(err => {
         console.log(err);
      });
   if (!member) {
      throw new Error("We don't know anyone with that email address");
   }

   const valid = await bcrypt.compare(password, member.password).catch(err => {
      console.log(err);
   });
   if (!valid) {
      throw new Error('Wrong Password');
   }

   const token = jwt.sign({ memberId: member.id }, process.env.APP_SECRET);
   ctx.res.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 4,
      domain: process.env.DOMAIN,
      sameSite: 'lax'
   });

   return member;
}
exports.login = login;

function logout(parent, args, ctx, info) {
   ctx.res.clearCookie('token', { domain: process.env.DOMAIN });
   return { message: 'Successfully logged out' };
}
exports.logout = logout;

async function requestReset(parent, { email }, ctx, info) {
   email = email.toLowerCase();

   const existingMember = await ctx.db.query.member(
      {
         where: {
            email
         }
      },
      `{id email displayName}`
   );

   if (existingMember == null) {
      return null;
   }

   const resetToken = (await promisify(randomBytes)(20)).toString('hex');
   const resetTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 minutes to verify yourself

   const member = await ctx.db.mutation
      .updateMember(
         {
            where: { email },
            data: {
               resetToken,
               resetTokenExpiry
            }
         },
         info
      )
      .catch(err => {
         console.log(err);
         throw new Error(err);
      });

   const defaultClient = SibApiV3Sdk.ApiClient.instance;
   const apiKey = defaultClient.authentications['api-key'];
   apiKey.apiKey = process.env.MAIL_API_KEY;

   const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
   const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

   sendSmtpEmail.to = [
      {
         email,
         name: existingMember.displayName
      }
   ];
   sendSmtpEmail.templateId = 2;
   sendSmtpEmail.params = {
      domain: process.env.FRONTEND_URL,
      memberId: existingMember.id,
      resetToken
   };

   apiInstance
      .sendTransacEmail(sendSmtpEmail)
      .then(
         function(data) {
            console.log(`Send In Blue API called successfully`);
            console.log(data);
         },
         function(error) {
            console.error(error);
            throw new Error(
               'Something has gone terribly wrong with your password reset'
            );
         }
      )
      .catch(err => console.log(err));
   return null;
}
exports.requestReset = requestReset;

async function changePassword(parent, { id, code, password }, ctx, info) {
   const existingMember = await ctx.db.query.member(
      {
         where: {
            id
         }
      },
      `{id resetToken}`
   );

   if (existingMember == null || code !== existingMember.resetToken) {
      throw new Error(
         "Something has gone wrong in the reset process, sorry. You're going to have to start again."
      );
   }

   const hashedPassword = await bcrypt.hash(password, 10).catch(err => {
      console.log(err);
   });

   const updatedMember = await ctx.db.mutation
      .updateMember(
         {
            where: {
               id
            },
            data: {
               password: hashedPassword,
               resetToken: null,
               resetTokenExpiry: null
            }
         },
         info
      )
      .catch(err => {
         console.log(err);
      });
   return updatedMember;
}
exports.changePassword = changePassword;

async function editProfile(
   parent,
   {
      id,
      avatar,
      displayName,
      email,
      twitchName,
      defaultPrivacy,
      defaultExpansion
   },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   if (
      ctx.req.memberId !== id &&
      !['Admin', 'Editor', 'Moderator'].includes(ctx.req.member.role)
   ) {
      throw new Error("You don't have permission to edit that member");
   }

   const dataObj = {};
   if (avatar != null) {
      dataObj.avatar = avatar;
   }
   if (displayName != null) {
      dataObj.displayName = displayName;
   }
   if (email != null) {
      dataObj.email = email;
   }
   if (twitchName != null) {
      dataObj.twitchName = twitchName;
   }
   if (defaultPrivacy != null) {
      dataObj.defaultPrivacy = defaultPrivacy;
   }
   if (defaultExpansion != null) {
      if (defaultExpansion === 'Expanded') {
         dataObj.defaultExpansion = true;
      } else if (defaultExpansion === 'Collapsed') {
         dataObj.defaultExpansion = false;
      }
   }
   const newMe = await properEditMe(dataObj, id, ctx).catch(err => {
      console.log(err);
   });
   return newMe;
}
exports.editProfile = editProfile;

async function properEditMe(dataObj, id, ctx) {
   if (
      id !== ctx.req.memberId &&
      !['Admin', 'Editor', 'Moderator'].includes(ctx.req.member.role)
   ) {
      throw new Error("You don't have permission to edit that member");
   }

   const updatedMember = await ctx.db.mutation
      .updateMember(
         {
            where: {
               id
            },
            data: dataObj
         },
         `{${profileFields}}`
      )
      .catch(err => {
         console.log(err);
      });
   publishMeUpdate(ctx);
   return updatedMember;
}

async function sendFriendRequest(parent, { id }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   sendNotification(
      {
         kind: 'friendRequest',
         recipient: id
      },
      ctx
   );

   const newThem = await ctx.db.mutation
      .updateMember(
         {
            where: {
               id
            },
            data: {
               friendRequests: {
                  connect: {
                     id: ctx.req.memberId
                  }
               }
            }
         },
         info
      )
      .catch(err => {
         console.log(err);
      });
   return newThem;
}
exports.sendFriendRequest = sendFriendRequest;

async function confirmFriendRequest(parent, { id }, ctx, info) {
   const oldMe = await ctx.db.query
      .member(
         {
            where: {
               id: ctx.req.memberId
            }
         },
         `{friendRequests {id} ignoredFriendRequests {id}}`
      )
      .catch(err => {
         console.log(err);
      });
   const dataObj = {
      friends: {
         connect: {
            id
         }
      }
   };
   if (oldMe.friendRequests && oldMe.friendRequests.length > 0) {
      const existingFriendRequest = oldMe.friendRequests.filter(
         requester => requester.id === id
      );
      if (existingFriendRequest && existingFriendRequest.length > 0) {
         dataObj.friendRequests = {
            disconnect: {
               id
            }
         };
      }
   }
   if (oldMe.ignoredFriendRequests && oldMe.ignoredFriendRequests.length > 0) {
      const existingIgnoredFriendRequests = oldMe.ignoredFriendRequests.filter(
         requester => requester.id === id
      );
      if (
         existingIgnoredFriendRequests &&
         existingIgnoredFriendRequests.length > 0
      ) {
         dataObj.ignoredFriendRequests = {
            disconnect: {
               id
            }
         };
      }
   }
   const newMe = await properEditMe(dataObj, ctx.req.memberId, ctx).catch(
      err => {
         console.log(err);
      }
   );

   const theirDataObj = {
      friends: {
         connect: {
            id: ctx.req.memberId
         }
      }
   };
   const oldThem = await ctx.db.query
      .member(
         {
            where: {
               id
            }
         },
         `{friendRequests {id} ignoredFriendRequests {id}}`
      )
      .catch(err => {
         console.log(err);
      });
   if (oldThem.friendRequests && oldThem.friendRequests.length > 0) {
      const existingFriendRequest = oldThem.friendRequests.filter(
         requester => requester.id === ctx.req.memberId
      );
      if (existingFriendRequest && existingFriendRequest.length > 0) {
         theirDataObj.friendRequests = {
            disconnect: {
               id
            }
         };
      }
   }
   if (
      oldThem.ignoredFriendRequest &&
      oldThem.ignoredFriendRequest.length > 0
   ) {
      const existingIgnoredFriendRequest = oldThem.ignoredfriendRequests.filter(
         requester => requester.id === ctx.req.memberId
      );
      if (
         existingIgnoredFriendRequest &&
         existingIgnoredFriendRequest.length > 0
      ) {
         theirDataObj.ignoredFriendRequests = {
            disconnect: {
               id
            }
         };
      }
   }

   const newThem = ctx.db.mutation.updateMember({
      where: {
         id
      },
      data: theirDataObj
   });

   return newMe;
}
exports.confirmFriendRequest = confirmFriendRequest;

async function ignoreFriendRequest(parent, { id }, ctx, info) {
   const dataObj = {
      ignoredFriendRequests: {
         connect: {
            id
         }
      }
   };
   const newMe = await properEditMe(dataObj, ctx.req.memberId, ctx).catch(
      err => {
         console.log(err);
      }
   );
   return newMe;
}
exports.ignoreFriendRequest = ignoreFriendRequest;

async function readNotifications(parent, { ids }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   await ctx.db.mutation
      .updateManyNotifications({
         where: {
            id_in: ids
         },
         data: {
            unread: false
         }
      })
      .catch(err => {
         console.log(err);
      });

   const newMe = publishMeUpdate(ctx);
   return newMe;
}
exports.readNotifications = readNotifications;

async function sendNotification(notification, ctx) {
   if (notification.recipient == null) {
      const theThing = await ctx.db.query
         .thing(
            {
               where: {
                  id: notification.linkQuery
               }
            },
            `{author {id}}`
         )
         .catch(err => {
            console.log(err);
         });
      if (theThing == null) {
         const theContentPiece = await ctx.db.query
            .contentPiece(
               {
                  where: {
                     id: notification.linkQuery
                  }
               },
               `{onThing {id} onTag {id}}`
            )
            .catch(err => {
               console.log(err);
            });
         let recipient;
         if (theContentPiece.onThing != null) {
            const theContainingThing = await ctx.db.query
               .thing(
                  {
                     where: {
                        id: theContentPiece.onThing.id
                     }
                  },
                  `{author {id}}`
               )
               .catch(err => {
                  console.log(err);
               });
            recipient = theContainingThing.author.id;
         } else if (theContentPiece.onTag != null) {
            const theContainingTag = await ctx.db.query
               .tag(
                  {
                     where: {
                        id: theContentPiece.onTag.id
                     }
                  },
                  `{author {id}}`
               )
               .catch(err => {
                  console.log(err);
               });
            recipient = theContainingTag.author.id;
         }
         notification.recipient = recipient;
      } else {
         notification.recipient = theThing.author.id;
      }
   }

   if (notification.recipient === ctx.req.memberId) {
      return;
   }

   const data = {
      kind: notification.kind,
      initiator: {
         connect: {
            id: ctx.req.memberId
         }
      },
      recipient: {
         connect: {
            id: notification.recipient
         }
      }
   };

   if (notification.linkQuery) {
      data.linkQuery = notification.linkQuery;
   }

   ctx.db.mutation.createNotification({
      data
   });
}
exports.sendNotification = sendNotification;

async function toggleBroadcastView(parent, { newState }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   await ctx.db.mutation
      .updateMember({
         where: {
            id: ctx.req.memberId
         },
         data: {
            broadcastView: newState
         }
      })
      .catch(err => {
         console.log(err);
      });

   const newMe = publishMeUpdate(ctx);
   return newMe;
}
exports.toggleBroadcastView = toggleBroadcastView;

async function addViewerToStuff(
   parent,
   { stuffID, memberID, type = 'Thing' },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   let authorID;

   if (type === 'ContentPiece') {
      const pieceData = await ctx.db.query.contentPiece(
         {
            where: {
               id: stuffID
            }
         },
         '{onThing {author {id}}}'
      );
      if (pieceData.onThing == null) {
         throw new Error(
            'You can only set the privacy on a content piece on a Thing, sorry'
         );
      }
      authorID = pieceData.onThing.author.id;
   } else if (type === 'Thing') {
      const thingData = await ctx.db.query
         .thing(
            {
               where: {
                  id: stuffID
               }
            },
            '{author {id}}'
         )
         .catch(err => {
            console.log(err);
         });
      authorID = thingData.author.id;
   }

   if (authorID !== ctx.req.memberId) {
      throw new Error("You don't have permission to edit that thing");
   }

   const dataObj = {
      individualViewPermissions: {
         connect: {
            id: memberID
         }
      }
   };

   const updatedStuff = await properUpdateStuff(
      dataObj,
      stuffID,
      type,
      ctx
   ).catch(err => {
      console.log(err);
   });
   return updatedStuff;
}
exports.addViewerToStuff = addViewerToStuff;

async function removeViewerFromStuff(
   parent,
   { stuffID, memberID, type = 'Thing' },
   ctx,
   info
) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   let authorID;
   if (type === 'ContentPiece') {
      const pieceData = await ctx.db.query.contentPiece(
         {
            where: {
               id: stuffID
            }
         },
         '{onThing {author {id}}}'
      );
      if (pieceData.onThing == null) {
         throw new Error("You can't do that, sorry");
      }
      authorID = pieceData.onThing.author.id;
   } else if (type === 'Thing') {
      const thingData = await ctx.db.query
         .thing(
            {
               where: {
                  id: stuffID
               }
            },
            '{author {id}}'
         )
         .catch(err => {
            console.log(err);
         });
      authorID = thingData.author.id;
   }

   if (authorID !== ctx.req.memberId) {
      throw new Error("You don't have permission to edit that thing");
   }

   const dataObj = {
      individualViewPermissions: {
         disconnect: {
            id: memberID
         }
      }
   };

   const updatedStuff = await properUpdateStuff(
      dataObj,
      stuffID,
      type,
      ctx
   ).catch(err => {
      console.log(err);
   });
   return updatedStuff;
}
exports.removeViewerFromStuff = removeViewerFromStuff;

async function storeOrganizeState(parent, { state }, ctx, info) {
   await loggedInGate(ctx).catch(() => {
      throw new AuthenticationError('You must be logged in to do that!');
   });
   fullMemberGate(ctx.req.member);

   await ctx.db.mutation
      .updateMember({
         where: {
            id: ctx.req.memberId
         },
         data: {
            organizePageState: state
         }
      })
      .catch(err => {
         console.log(err);
      });

   const newMe = publishMeUpdate(ctx);
   return newMe;
}
exports.storeOrganizeState = storeOrganizeState;
