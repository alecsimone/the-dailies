const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
   async signup(parent, args, ctx, info) {
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
   },
   async login(parent, { email, password }, ctx, info) {
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
};

module.exports = Mutations;
