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

//POST PATHS
//ADD GEAR BY USER ID
router.put("/:id", async (req, res) => {
    const { name } = req.body;

    if( !name ){
        sendError(res, "GEAR_OBJECT_INVALID");
        return;
    }

    try {
        const newGear = await gModels.addGear(req.params.id, req.body);
        res.status(201).json(newGear);

    } catch (err) {

        // psql error code for unique_validation failure on unique constraints
        if (err.code === '23505') {
            sendError(res, "GEAR_ALREADY_EXISTS");
            return;
        }
        // psql error code for not null violation
        if (err.code === '23502'){
            sendError(res, "GEAR_FIELD_EMPTY");
            return;
        }

        sendError(res, "SYS_SERVER_ERROR");
    }
})

export default router;
