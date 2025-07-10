import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Board } from "../entities/board.entity";
import { Column } from "../entities/column.entity";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
    @InjectRepository(Column)
    private columnsRepository: Repository<Column>,
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
    const board = this.boardsRepository.create({
      ...createBoardDto,
      createdBy: userId,
    });

    const savedBoard = await this.boardsRepository.save(board);

    const defaultColumns = [
      { title: "To Do", order: 0 },
      { title: "In Progress", order: 1 },
      { title: "Testing", order: 2 },
      { title: "Done", order: 3 },
    ];

    await Promise.all(
      defaultColumns.map(async (columnData) => {
        const column = this.columnsRepository.create({
          ...columnData,
          boardId: savedBoard.id,
        });
        return await this.columnsRepository.save(column);
      }),
    );

    return this.findOne(savedBoard.id);
  }

  async findAll(): Promise<Board[]> {
    return this.boardsRepository.find({
      relations: ["columns", "createdByUser", "tickets"],
      order: {
        createdAt: "DESC",
      },
    });
  }

  async findOne(id: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id },
      relations: ["columns", "createdByUser", "tickets"],
      order: {
        columns: {
          order: "ASC",
        },
      },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return board;
  }

  async update(
    id: string,
    updateBoardDto: UpdateBoardDto,
    _userId: string,
  ): Promise<Board> {
    await this.findOne(id);

    await this.boardsRepository.update(id, updateBoardDto);
    return this.findOne(id);
  }

  async remove(id: string, _userId: string): Promise<void> {
    const board = await this.findOne(id);
    await this.boardsRepository.remove(board);
  }
}
