import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import { db } from "../db";
import { usersTable } from "../db/userSchema";
import { eq } from "drizzle-orm";
import jwt from 'jsonwebtoken'
// register a user 
export async function registerUser(req: Request, res: Response){
    const data = req.cleanBody;
    data.password = await bcrypt.hash(data.password, 10);
    const [user] =await db.
        insert(usersTable)
        .values(data)
        .returning()
    user.password = '********';
    // @ts-ignore
    delete user.password;
    res.status(201).json({
        message: "User created successfully",
        product: user,
        statusCode: 201
    })
}

// login user
export async function loginUser(req: Request, res: Response){
    const {email, password} = req.cleanBody;
    const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, req.cleanBody.email))
    if (!user){
        return res.status(401).json({
            message: "Unauthorized. Invalid Username or Password",
            statusCode: 401
        })
    }
    try {
        const matched = await bcrypt.compare(password, user.password);
        if (!matched){
            return res.status(401).json({
                message: "Authentication Failed",
                statusCode: 401
            })
        }
        //generate jwt access and refresh tokens
        const accessToken = jwt.sign({userId: user.id, role: user.role}, process.env.JWT_ACCESS_TOKEN_SECRET!, {expiresIn: '7d'});
        const refreshToken = jwt.sign({userId: user.id, role: user.role}, process.env.JWT_REFRESH_TOKEN_SECRET!, {expiresIn: '30d'});
        // @ts-ignore
        delete user.password;
        return res.status(200).json({
            message: "Login Successful",
            accessToken,
            refreshToken,
            user: user,
            statusCode: 200
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            statusCode: 500
        })
    }
}