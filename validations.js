import { body } from 'express-validator';

export const registerValidation = [
  body('email', 'Неверный формат почты!').isEmail(),
  body('password', 'Неверный формат пароля!').isLength({ min: 6 }),
  body('fullName', 'Неверный формат имени!').isLength({ min: 3 }),
];

export const loginValidation = [
  body('email', 'Неверный формат почты!').isEmail(),
  body('password', 'Неверный формат пароля!').isLength({ min: 6 }),
];

export const goodsValidation = [
  body('title').isString().isLength({ min: 3 }),
  body('text').isString().isLength({ min: 10 }),
  body('imageUrl').isString(),
];
