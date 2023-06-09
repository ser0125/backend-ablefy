const prisma = require("../../prisma");

exports.findAll = (req, res) => {
  const name = req.query.name;
  const condition = name
    ? { where: { name: { contains: name, mode: "insensitive" } } }
    : {};

  prisma.artist
    .findMany(condition)
    .then((data) => {
      res.send({ data });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving artists.",
      });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  prisma.artist
    .findUnique({ where: { id: Number(id) } })
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Artist with id " + id });
      else res.send({ data });
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving Artist with id=" + id });
    });
};

exports.getTopThree = (req, res) => {

  prisma.song.groupBy({
    by: ['artistId'],
    _sum: {
      playbacks: true
    },
    orderBy: {
      _sum: {
        playbacks: 'desc'
      }
    },
    take: 3

  }).then(songs => {
    prisma.artist
      .findMany({
        select: {
          id: true,
          name: true
        },
      })
      .then((artists) => {
        let data = [];
        for (let j = 0; j < songs.length; j++) {
          for (let i = 0; i < artists.length; i++) {
            if (artists[i].id === songs[j]?.artistId) data = [...data, { ...artists[i], totalPlaybacks: songs[j]._sum.playbacks }]
          }
        }
        res.send({ data })
      })
  })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving artists.",
      });
    });
};
