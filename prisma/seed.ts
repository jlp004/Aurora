await prisma.user.createMany({
  data: [
    {
      username: 'megantest',
      email: 'megantest@gmail.com',
      password: 'megantest'
    },
    {
      username: 'johndoe',
      email: 'johndoe@gmail.com',
      password: 'johndoe'
    },
    {
      username: 'ilovecats',
      email: 'cats@gmail.com',
      password: 'cats'
    },
    {
      username: 'musiclover123',
      email: 'musiclover123@gmail.com',
      password: 'music'
    },
    {
      username: 'coffeeandtreats1',
      email: 'coffeeandtreats1@gmail.com',
      password: 'coffee'
    },
    {
      username: 'bobphilfred',
      email: 'bobphilfred@gmail.com',
      password: 'bob'
    },
    {
      username: 'sarahjane',
      email: 'sarahjane@gmail.com',
      password: 'sarah'
    },
    {
      username: 'techgirl101',
      email: 'techgirl101@gmail.com',
      password: 'tech123'
    },
    {
      username: 'wanderlust',
      email: 'wanderlust@gmail.com',
      password: 'travel456'
    },
    {
      username: 'booknerd',
      email: 'booknerd@gmail.com',
      password: 'readmore'
    },
    {
      username: 'gamerking',
      email: 'gamerking@gmail.com',
      password: 'pwnggamer'
    },
    {
      username: 'chefqueen',
      email: 'chefqueen@gmail.com',
      password: 'yumfood'
    }
  ]
});
