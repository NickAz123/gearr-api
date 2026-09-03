import express from "express";
const router = express.Router();

import { sendError } from "../helpers/errorHelpers.js";

//GET SINGLE GEAR
router.get("/:id", async (req, res) => {
    try{
        const gear = await gModels.getGearById(req.params.id);
        
        if(!gear){
            sendError(res, "GEAR_NOT_FOUND");
            return;
        }
        res.status(200).json(gear);

    } catch (err){
        sendError(res, "SYS_SERVER_ERROR");   
    }
});