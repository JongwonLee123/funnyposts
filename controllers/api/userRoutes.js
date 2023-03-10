const router = require("express").Router();
const { User } = require("../../models/index");
const bcrypt = require("bcrypt");


router.post("/login", async (req, res) => {

  try {
    const userData = await User.findOne({
      where: { username: req.body.username },
    });

    if (!userData) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
      return;
    }

    const pwTest = await userData.checkPassword(req.body.password);

    if (!pwTest) {
      res.status(400).json({
        message: "Incorrect username or password. Password failed hash check.",
      });
      return;
    }
    req.session.save(() => {
      req.session.username = req.body.username;
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      res.status(200).json({ user: userData });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});
router.post("/create", async (req, res) => {
  try {
 
    const sameUsername = await User.findAll({
      where: {
        username: req.body.newUsername,
      },
    });

    if (sameUsername.length > 0) {
      res.status(401).end();
      return;
    }

    const newUser = {
      username: req.body.newUsername,
    };

    newUser.password = await bcrypt.hash(req.body.newPassword, 10);

    const userData = await User.create(newUser);

    req.session.save(() => {
      req.session.username = userData.username;
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      res.status(200).json({ user: userData });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.post("/logout", async (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});



module.exports = router;