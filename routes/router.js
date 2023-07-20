const express = require('express');
const router = new express.Router();
const User = require("../models/User");
const transactions = require("../models/Transaction");
const image = require("../models/Images");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require('passport-local').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        // let ext = path.extname(file.originalname)
        cb(null, Date.now() + file.originalname)
    }
});

// upload parameters for multer

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 3
    }
});


// const User = mongoose.model("User", userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


router.get("/", function (req, res) {
    res.render("home");
});

router.get("/login", function (req, res) {
    res.sendFile(__dirname + "/login.html");
});

router.get("/signup", function (req, res) {
    res.sendFile(__dirname + "/signup.html");
});

router.get("/tracker", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("tracker", { User: req.user });
       
    }
    else {
        res.redirect("login");
    }
});

router.get("/income", function (req, res) {

    if (req.isAuthenticated()) {
        res.render("income", { User: req.user });
    }
    else {
        res.redirect("login");
    }
});

router.get("/charts", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("charts", { User: req.user })
    }
    else {
        res.redirect("login");
    }
});

router.get("/history", function (req, res) {
    if (req.isAuthenticated()) {
        transactions.find()
            .exec()
            .then(results => res.render("history", { transactions: results, User: req.user }))
            .catch(err => res.redirect("tracker"));

    }
    else {
        res.redirect("login");
    }
});

router.get("/target", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("target", { User: req.user });
    }
    else {
        res.redirect("login");
    }
});

router.get('/uploadRecipts', (req, res) => {


    if (req.isAuthenticated()) {
        image.find()
            .exec()
            .then(items => res.render("uploadRecipts", { items: items, User: req.user }))
            .catch(err => res.redirect("tracker"));

    }
    else {
        res.redirect("login");
    }
});

// list****************************************************

router.get("/list", (req, res) => {
    if (req.isAuthenticated()) {
        items.find({}, function (err, foundItems) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("list", { listTitle: "Today", newListItems: foundItems, User: req.user });
            }

        });
    }
    else {
        res.redirect("login");
    }
});

router.post("/newlist", function (req, res) {
    let itemName = req.body.newItem;
    const newItem = new Item({
        name: itemName,
        userid: req.user._id
    });

    newItem.save();
    res.redirect("/list");

});

router.post("/list", (req, res) => {
    req.logout();
    res.redirect("/");
});

router.post("/delete", function (req, res) {

    const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/list");
        }
    });
});

// list******************************************

router.post("/tracker", function (req, res) {
    req.logout();
    res.redirect("/");
});
router.post("/income", function (req, res) {
    req.logout();
    res.redirect("/");
});
router.post("/charts", function (req, res) {
    req.logout();
    res.redirect("/");
});
router.post("/history", function (req, res) {
    req.logout();
    res.redirect("/");
});
router.post("/target", function (req, res) {
    req.logout();
    res.redirect("/");
});
router.post("/uploadRecipts", function (req, res) {
    req.logout();
    res.redirect("/");
});

router.post("/signup", function (req, res) {

    User.register({ username: req.body.username, balance: 0, totalCredit: 0, totalDebit: 0 }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("login");
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("tracker");
            });
        }
    });

});


router.post("/login", function (req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });

    req.login(user, function (err) {
        if (err) {
            res.redirect("signup");
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("tracker");
            });
        }
    });

});


router.post("/addMoney", function (req, res) {

    const transaction = new transactions({
        flow: "Credit",
        userid: req.user.id,
        amount: req.body.income,
        category: req.body.category,
        mode: req.body.mode,
        note: req.body.note,
        year: new Date().getFullYear(),
        month: new Date().getMonth()
    });

    transaction.save();

    User.findOneAndUpdate({ _id: req.user._id }, { $inc: { balance: req.body.income } }, function (err, data) {
        if (err) {
            console.log(err);
            req.redirect("income");
        }
        else {
            console.log(data);
        }
    });

    User.findOneAndUpdate({ _id: req.user._id }, { $inc: { totalCredit: req.body.income } }, function (err, data) {
        if (err) {
            console.log(err);
            req.redirect("income");
        }
        else {
            console.log(data);
        }
    });

    res.redirect("income");
});
router.post("/subMoney", function (req, res) {

    const transaction = new transactions({
        flow: "Debit",
        userid: req.user.id,
        amount: req.body.expense,
        category: req.body.category,
        mode: req.body.mode,
        note: req.body.note,
        year: new Date().getFullYear(),
        month: new Date().getMonth()
    });

    transaction.save();

    User.findOneAndUpdate({ _id: req.user._id }, { $inc: { balance: -req.body.expense } }, function (err, data) {
        if (err) {
            console.log(err);
            req.redirect("income");
        }
        else {
            console.log(data);
        }
    });
    User.findOneAndUpdate({ _id: req.user._id }, { $inc: { totalDebit: req.body.expense } }, function (err, data) {
        if (err) {
            console.log(err);
            res.redirect("income");
        }
        else {
            console.log(data);
        }
    });
    res.redirect("income");

});

router.post("/setTarget", function (req, res) {
    let expectedExpense = Number(req.body.TGroceryExpense) + Number(req.body.TTransportationExpense) + Number(req.body.TEducationExpense) + Number(req.body.TOtherExpense);
    let TSavings = Number(req.body.ProjectedIncome) - Number(req.body.TGroceryExpense) - Number(req.body.TTransportationExpense) - Number(req.body.TEducationExpense) - Number(req.body.TOtherExpense);
    User.findOneAndUpdate({ _id: req.user._id }, { xincome: req.body.ProjectedIncome, xgrocery: req.body.TGroceryExpense, xtranspartation: req.body.TTransportationExpense, xeducation: req.body.TEducationExpense, xother: req.body.TOtherExpense, xsavings: TSavings, xexpense: expectedExpense }, function (err, data) {

        if (err) {
            console.log(err);
            res.redirect("target");
        }
        else {
            res.redirect("target");
        }
    });
});


router.post('/addnewRecipts', upload.single('image'), async (req, res) => {

    console.log(req.file);
    let obj = new image({
        userid: req.user._id,
        name: req.body.imgtitle,
        desc: req.body.desc,
        img: req.file.filename
    });

    try {
        obj = await obj.save();
        res.redirect('uploadRecipts');
    } catch (error) {
        console.log(error);
    }

});

module.exports = router;