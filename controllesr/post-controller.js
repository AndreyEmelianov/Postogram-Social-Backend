const { prisma } = require('../prisma/prisma-client');

const PostController = {
  createPost: async (req, res) => {
    const { content } = req.body;
    const authorId = req.user.userId;

    if (!content) {
      res.status(400).json({ error: 'Все поля обязательны' });
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
        },
      });

      res.json(post);
    } catch (err) {
      console.error('Ошибка при создании поста', err);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
  getAllPosts: async (req, res) => {
    res.send('getAllPosts post');
  },
  getPostById: async (req, res) => {
    res.send('getPostById post');
  },
  deletePost: async (req, res) => {
    res.send('deletePost post');
  },
};

module.exports = PostController;
