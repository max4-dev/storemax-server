import GoodsModel from '../models/Goods.js';

export const create = async (req, res) => {
  try {
    const doc = new GoodsModel({
      title: req.body.title,
      text: req.body.text,
      price: req.body.price,
      rating: req.body.rating,
      category: req.body.category,
      imageUrl: req.body.imageUrl,
    });

    const good = await doc.save();

    res.json(good);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать товар',
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const { sortBy, search, category, order } = req.query;

    let sort = {};
    if (sortBy === 'price') {
      sort.price = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'rating') {
      sort.rating = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'title') {
      sort.title = order === 'desc' ? -1 : 1;
    }

    let filter = {};
    if (search) {
      filter.title = { $regex: `.*${search}.*`, $options: 'i' };
    }

    const goods = await (Number(category) > 0
      ? GoodsModel.find({ category, ...filter }).sort(sort)
      : GoodsModel.find(filter)
    )
      .sort(sort)
      .exec();
    res.json(goods);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить товары',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const goodId = req.params.id;
    const good = await GoodsModel.findById(goodId).exec();
    if (!good) {
      return res.status(404).json({
        message: 'Товар не найден',
      });
    }
    res.json(good);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить товар',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const goodId = req.params.id;
    const good = await GoodsModel.findOneAndDelete({
      _id: goodId,
    });
    if (!good) {
      return res.status(404).json({
        message: 'Не удалось удалить товар',
      });
    }
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить товар',
    });
  }
};

export const update = async (req, res) => {
  try {
    const goodId = req.params.id;
    GoodsModel.updateOne(
      {
        _id: goodId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        price: req.body.price,
        rating: req.body.rating,
        category: req.body.category,
        imageUrl: req.body.imageUrl,
      },
    ).then((doc) => {
      if (!doc) {
        return res.status(404).json({
          message: 'Товар не найден',
        });
      }

      res.json({
        success: true,
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: 'Не удалось изменить товар',
    });
  }
};
