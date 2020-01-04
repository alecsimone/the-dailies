const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function signup(parent, args, ctx, info) {
   args.email = args.email.toLowerCase();
   const password = await bcrypt.hash(args.password, 10);
   const member = await ctx.db.mutation.createMember(
      {
         data: {
            ...args,
            password,
            roles: { set: ['LiteMember'] }
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
