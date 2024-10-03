import { Request, Response } from "express-serve-static-core";
import { CreateUserDto } from "../dtos/Creatuser.dto";
import { CreateUserQueryParams } from "../types/query-params";
import { User } from "../types/response";

export function getUsers(request: Request, response: Response){
    response.send([])
}
export function getUserById(request: Request, response: Response){
    response.send({})
}
export function createUser(request: Request<{}, {}, CreateUserDto, CreateUserQueryParams>, response: Response<User>){
    
    response.send({
        id: 1,
        email: "Test User",
        username: "Gkw"
    })
}