import jwt from "jsonwebtoken";


export const generateAuthToken = (user) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    return token;
}
