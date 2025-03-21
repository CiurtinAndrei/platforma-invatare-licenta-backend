const { Elevi, Profesori } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();


exports.authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Nu există token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token invalid sau expirat" });
        }

        // Attach decoded user info to request object
        req.user = decoded;
        next();
    });
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await Profesori.findOne({ where: { email } });
        let role = "profesor";

        if (!user) {
            user = await Elevi.findOne({ where: { email } });
            role = "elev";
        }

        if (!user) {
            return res.status(401).json({ message: "Credentiale invalide" });
        }

        const validPassword = await bcrypt.compare(password, user.parola);
        if (!validPassword) {
            return res.status(401).json({ message: "Credentiale invalide" });
        }

        const token = jwt.sign({ id: user.idprofesor || user.idelev, role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600000
        });

        return res.json({ message: "Autentificare reușită", role });
    } catch (err) {
        return res.status(500).json({ message: "Eroare server", error: err.message });
    }
};


exports.checkAuth = async (req, res) => {
    try {
        const { id, role } = req.user;

        let user;
        if (role === "profesor") {
            user = await Profesori.findByPk(id);
        } else if (role === "elev") {
            user = await Elevi.findByPk(id);
        }

        if (!user) {
            return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
        }

        // Send the user's role back to the frontend
        return res.json({ role });
    } catch (err) {
        console.error("Eroare la verificarea autentificării:", err);
        return res.status(500).json({ message: "Eroare server" });
    }
};


exports.getUserInfo = async (req, res) => {
    try {
        const { id, role } = req.user;

        let user;
        if (role === "profesor") {
            user = await Profesori.findByPk(id, { attributes: ["nume", "prenume"] });
        } else if (role === "elev") {
            user = await Elevi.findByPk(id, { attributes: ["nume", "prenume"] });
        }

        if (!user) {
            return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
        }

        return res.json({ nume: user.nume, prenume: user.prenume, role });
    } catch (err) {
        console.error("Eroare la obținerea informațiilor utilizatorului:", err);
        return res.status(500).json({ message: "Eroare server" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
    return res.json({ message: "Logout reușit" });
};

