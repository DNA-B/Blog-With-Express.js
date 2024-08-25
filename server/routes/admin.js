const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};

router.get("/admin", async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Simple Blog created with NodeJs, Express & MongoDB",
        };
        res.render("admin/index", { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

router.get("/admin/logout", async (req, res) => {
    try {
        res.clearCookie("token");
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
});

router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Dashboard",
            description: "Simple Blog created with NodeJs & express",
        };
        const data = await Post.find();
        res.render("admin/dashboard", {
            locals,
            data,
            layout: adminLayout,
        });
    } catch (error) {
        console.log(error);
    }
});

router.get("/add-post", authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Dashboard",
            description: "Simple Blog created with NodeJs & express",
        };
        const data = await Post.find();
        res.render("admin/add-post", {
            locals,
            layout: adminLayout,
        });
    } catch (error) {
        console.log(error);
    }
});

router.get("/edit-post/:id", authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Edit Post",
            description: "Simple Blog created with NodeJs & express",
        };
        const data = await Post.findOne({ _id: req.params.id });
        res.render("admin/edit-post", {
            locals,
            data,
            layout: adminLayout,
        });
    } catch (error) {
        console.log(error);
    }
});

router.post("/admin", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, jwtSecret);
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
    }
});

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({
                username: username,
                password: hashedPassword,
            });
            res.status(201).json({ message: "User Created", user });
        } catch (error) {}
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "User already in use" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/add-post", authMiddleware, async (req, res) => {
    try {
        await Post.create({
            title: req.body.title,
            body: req.body.body,
        });
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
    }
});

router.put("/edit-post/:id", authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now(),
        });
        res.redirect(`/post/${req.params.id}`);
    } catch (error) {
        console.log(error);
    }
});

router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;