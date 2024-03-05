const { prisma } = require('../prisma/prisma-client');
const bcrypt = require('bcryptjs');
const Jdenticon = require('jdenticon');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ error: 'Такой пользователь уже существует' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const png = Jdenticon.toPng(name, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, '../uploads', avatarName);
      fs.writeFileSync(avatarPath, png);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarPath}`,
        },
      });

      res.json(user);
    } catch (err) {
      console.error('Ошибка при регистрации', err);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: 'Неверный логин или пароль' });
      }

      const validPass = await bcrypt.compare(password, user.password);
      if (!validPass) {
        return res.status(400).json({ error: 'Неверный логин или пароль' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);
      res.json({ token });
    } catch (err) {
      console.log('Login error', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
  getUserById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { followers: true, following: true },
      });

      if (!user) {
        res.status(404).json({ error: 'Пользователь не найден' });
      }

      const isFollowing = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId: id }],
        },
      });

      res.json({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (err) {}
    console.log('Get current error', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  },
  updateUser: async (req, res) => {
    res.send('updateUser');
  },
  current: async (req, res) => {
    res.send('current');
  },
};

module.exports = UserController;
