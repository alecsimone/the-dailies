const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');
const { fullMemberFields } = require('../../utils/CardInterfaces');

async function publishMeUpdate(ctx) {
   const newMe = await ctx.db.query
      .member(
         {
            where: {
               id: ctx.req.memberId
            }
         },
         `{${fullMemberFields}}`
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

async function signup(parent, args, ctx, info) {
   args.email = args.email.toLowerCase();
   const password = await bcrypt.hash(args.password, 10).catch(err => {
      console.log(err);
   });
   if (args.displayName.length > 24) {
      args.displayName = args.displayName.substring(0, 24);
   }
   const member = await ctx.db.mutation
      .createMember(
         {
            data: {
               ...args,
               password,
               role: 'Member',
               defaultPrivacy: 'Friends'
            }
         },
         info
      )
      .catch(err => {
         console.log(err);
      });
   const token = jwt.sign({ memberId: member.id }, process.env.APP_SECRET);
   ctx.res.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 4,
      domain: process.env.DOMAIN
   });
   return member;
}
exports.signup = signup;

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
      domain: process.env.DOMAIN
   });

   return member;
}
exports.login = login;

function logout(parent, args, ctx, info) {
   ctx.res.clearCookie('token', { domain: process.env.DOMAIN });
   return { message: 'Successfully logged out' };
}
exports.logout = logout;

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
   loggedInGate(ctx);
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
         `{${fullMemberFields}}`
      )
      .catch(err => {
         console.log(err);
      });
   publishMeUpdate(ctx);
   return updatedMember;
}

async function sendFriendRequest(parent, { id }, ctx, info) {
   loggedInGate(ctx);
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
   loggedInGate(ctx);
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
               `{onThing {id}}`
            )
            .catch(err => {
               console.log(err);
            });
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
         notification.recipient = theContainingThing.author.id;
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
   loggedInGate(ctx);
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
