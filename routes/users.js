import express from "express";
const router = express.Router();

import { sendError } from "../helpers/errorHelpers.js";
import * as bh from "../helpers/bcryptHelpers.js"
import * as uModels from "../models/userModels.js"; 

router.get("/", async (req, res) => {
    try{
        const users = await uModels.getAllUsers();
        res.status(200).json(users);
    } catch (err){
        sendError(res, "SYS_SERVER_ERROR");   
    }
});

//GET SINGLE USER
router.get("/:id", async (req, res) => {
    const getSettings = req.query.settings === 'true';
    var user = null;

    try{
        if(getSettings)
        {
            user = await uModels.getUserWithSettingsById(req.params.id);
        } else {
            user = await uModels.getUserById(req.params.id);
        }

        if(!user){
            sendError(res, "USER_NOT_FOUND");
            return;
        }
        res.status(200).json(user);
    } catch (err){
        sendError(res, "SYS_SERVER_ERROR");
    }
});

//POST PATHS
//ADD USER
router.put("/", async (req, res) => {
    const {firstName, lastName, userName, password, email } = req.body;

    if(!firstName || !lastName || !userName || !password || !email){
        sendError(res, "USER_OBJECT_INVALID");
        return;
    }

    const passwordHash = await bh.hashPassword(password);

    try {
        const newUser = await uModels.addUser(firstName, lastName, userName, passwordHash ,email);
        res.status(201).json(newUser);
    } catch (err) {
        
        // psql error code for unique_validation failure on unique constraints
        if (err.code === '23505') {
            sendError(res, "USER_ALREADY_EXISTS");
        }
        // psql error code for not null violation
        if (err.code === '23502'){
            sendError(res, "USER_FIELD_EMPTY");
        }

        sendError(res, "SYS_SERVER_ERROR");
    }
});

//UPDATE USER
router.patch("/:id", async (req, res) => {
    try{
        const updatedUser = await uModels.updateUser(req.params.id, req.body);

        if(!updatedUser){
            sendError(res, "USER_OBJECT_INVALID");
            return;
        }

        res.status(200).json(updatedUser);

    } catch (err){
        sendError(res, "USER_UPDATE_FAIL");
    }
});

//UPDATE PASSWORD
router.patch("/:id/update-password", async (req, res) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const userId = req.params.id;
    const user = await uModels.getUserById(userId);

    if(!currentPassword || !newPassword){
        sendError(res, "USER_FIELD_EMPTY");
        return;
    }

    if (await bh.comparePassword(user.password, currentPassword)) {
        const newPasswordHash = await bh.hashPassword(newPassword);

        try {
            await uModels.updateUserPassword(userId, newPasswordHash);
            res.sendStatus(204);
        } catch (error) {
            sendError(res, "USER_UPDATE_FAIL");
        }
    } else {
        sendError(res, "USER_PASSWORD_MISMATCH");
    }
});

//DELETE USER
router.delete ("/:id/delete", async (req, res) => {

    const user = await uModels.getUserById(req.params.id);
    
    if(!user){
        sendError(res, "USER_NOT_FOUND");
        return;
    }
    
    try {
        await uModels.softDeleteUser(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        sendError(res, "SYS_SERVER_ERROR");
    }
});

export default router;
