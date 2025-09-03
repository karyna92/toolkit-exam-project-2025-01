db.Messages.aggregate([
  {
    $match: {
      body: { $regex: 'паровоз', $options: 'i' },
    },
  },
  {
    $count: 'count',
  },
]);
