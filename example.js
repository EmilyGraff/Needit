exports.getAll = function (req, res) {
  ItemModel.find(function (err, items) {
    if (err) {
      throw new APIError(500, errors.find);
    }
    return respond(200, items, req, res);
  });
};

exports.getOne = function (req, res) {
  findOne(req, res, function (item) {
    return respond(200, item, req, res);
  });
};

exports.create = function (req, res) {
  if (!req.body.title || req.body.title === '') {
    throw new APIError(400, errors.noTitle);
  }

  var item = new ItemModel({
    title : req.body.title,
    body  : req.body.body || '',
    done  : false
  });

  item.save(function (err) {
    if (err) {
      throw new APIError(500, errors.save, err.message);
    } else {
        elasticSearch.index(item);
    }
    return respond(200, item, req, res);
  });
};