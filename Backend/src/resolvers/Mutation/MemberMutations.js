const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loggedInGate, fullMemberGate } = require('../../utils/Authentication');
const { fullMemberFields } = require('../../utils/CardInterfaces');
const { publishMeUpdate } = require('../../utils/ThingHandling');

async function signup(parent, args, ctx, info) {
   args.email = args.email.toLowerCase();
   const password = await bcrypt.hash(args.password, 10);
   if (args.displayName.length > 24) {
      args.displayName = args.displayName.substring(0, 24);
   }
   const member = await ctx.db.mutation.createMember(
      {
         data: {
            ...args,
            password,
            role: 'LiteMember',
            defaultPrivacy: 'Friends',
            defaultCategory: {
               connect: {
                  title: 'Misc'
               }
            }
         }
      },
      info
   );
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
   const member = await ctx.db.query.member({ where: { email } });
   if (!member) {
      throw new Error("We don't know anyone with that email address");
   }

   const valid = await bcrypt.compare(password, member.password);
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
   { id, avatar, displayName, email, twitchName },
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
   const newMe = await properEditMe(dataObj, id, ctx);
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

   const updatedMember = await ctx.db.mutation.updateMember(
      {
         where: {
            id
         },
         data: dataObj
      },
      `{${fullMemberFields}}`
   );
   publishMeUpdate(ctx);
   return updatedMember;
}
