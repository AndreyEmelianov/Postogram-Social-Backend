const { prisma } = require('../prisma/prisma-client');

const FollowController = {
  followUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    if (followingId === userId) {
      return res.status(500).json({ error: 'Невозможная операция. Нельзя подписаться на себя' });
    }

    try {
      const existingSubscription = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (existingSubscription) {
        return res.status(400).json({ error: 'Подписка уже существует' });
      }

      await prisma.follows.create({
        data: {
          follower: {
            connect: {
              id: userId,
            },
          },
          following: {
            connect: {
              id: followingId,
            },
          },
        },
      });

      res.status(201).json({ message: 'Подписка успешно совершена' });
    } catch (err) {
      console.error('Ошибка при попытке подписаться', err);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },

  unFollowUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    try {
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (!follows) {
        return res.status(404).json({ error: 'Вы не подписаны на этого пользователя' });
      }

      await prisma.follows.delete({ where: { id: follows.id } });
      res.status(201).json({ message: 'Вы успешно отписались' });
    } catch (err) {
      console.error('Ошибка при попытке отписаться', err);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
};

module.exports = FollowController;
