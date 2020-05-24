import {
  JsonController,
  Get,
  Body,
  Post,
  Param,
  Put,
  Delete,
  QueryParams,
} from "routing-controllers";
import { Pagination } from "../misc/QueryPagination";
import { ReportTicketModel } from "../database/models/ReportTicket";
import { ReportValidator } from "../validators/ReportValidator";

@JsonController("/reports")
export class ReportTicketController {
  @Get()
  public async get(@QueryParams() query: Pagination) {
    return ReportTicketModel.find({})
      .sort({ createdAt: -1 })
      .paginate(query.skip, query.take);
  }

  @Post("/:id")
  public async create(@Body() report: ReportValidator) {
    return new ReportTicketModel(report).save();
  }

  @Delete("/:id")
  public async delete(@Param("id") id: string) {
    return ReportTicketModel.deleteOne({ id });
  }
}
