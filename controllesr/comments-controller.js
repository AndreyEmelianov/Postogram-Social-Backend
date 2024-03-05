const { prisma } = require('../prisma/prisma-client');

const CommentController = {
  createComment: async (req, res) => {
    const { postId, content } = req.body;
    const userId = req.user.userId;

    if (!postId || !content) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          content,
        },
      });

      res.json(comment);
    } catch (err) {
      console.error('Ошибка при создании комментария', err);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },

  deleteComment: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const comment = await prisma.comment.findUnique({ where: { id } });

      if (!comment) {
        return res.status(404).json({ error: 'Комментарий не найден' });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ error: 'Нет прав доступа для удаления комментария' });
      }

      await prisma.comment.delete({ where: { id } });

      res.json(comment);
    } catch (err) {
      console.error('Ошибка при удалении комментария', err);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
};

module.exports = CommentController;
