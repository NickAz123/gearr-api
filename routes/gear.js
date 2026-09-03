import express from "express";
const router = express.Router();

import { sendError } from "../helpers/errorHelpers.js";

import * as gModels from "../models/gearModels.js";

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

//GET GEAR BY USER ID
router.get("/user-gear/:id", async (req, res) => {
    
    try{

        const gearList =  await gModels.getGearByUserId(req.params.id);
        res.status(200).json(gearList);

    } catch (err){
        sendError(res, "SYS_SERVER_ERROR");   
    }
    
})

export default router;
