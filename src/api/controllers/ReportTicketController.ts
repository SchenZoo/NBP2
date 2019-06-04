import { JsonController, Get, Body, Post, Param, Put, Delete, QueryParams } from "routing-controllers";
import { Query } from "mongoose";
import { Pagination } from "../misc/QueryPagination";
import { ReportTicketModel } from "../database/models/ReportTicket";
import { ReportValidator } from '../validators/ReportValidator';
import bodyParser = require("body-parser");

@JsonController('/report')
export class ReportTicketController {

    @Get()
    public async get(@QueryParams() query: Pagination) {
        return ReportTicketModel.find()
        .sort({ createdAt: -1})
        .limit(query.take)
        .skip(query.skip)
    }

    @Post('/:id')
    public async create( @Body() report: ReportValidator){
        return new ReportTicketModel(report).save()
    }

    // @Put('/:id')
    // public async update(@Body() report: ReportValidator, @Param('id') id: string){
    //     return ReportTicketModel.updateOne({ id }, report);  
    // }

    @Delete('/:id')
    public async delete(@Param('id') id: string){
        return ReportTicketModel.deleteOne({ id })
    }
}