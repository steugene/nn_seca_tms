import { AppDataSource } from "../data-source";
import { User } from "../../entities/user.entity";
import { Board } from "../../entities/board.entity";
import { Column } from "../../entities/column.entity";
import { Ticket } from "../../entities/ticket.entity";
import * as bcrypt from "bcryptjs";
import { TicketPriority, TicketStatus } from "@nn-seca-tms/shared";

export async function runSeeds() {
  console.log("Starting database seeding...");

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await AppDataSource.query("TRUNCATE TABLE tickets CASCADE");
    await AppDataSource.query("TRUNCATE TABLE columns CASCADE");
    await AppDataSource.query("TRUNCATE TABLE boards CASCADE");
    await AppDataSource.query("TRUNCATE TABLE users CASCADE");

    console.log("Cleared existing data");

    const userRepository = AppDataSource.getRepository(User);
    const boardRepository = AppDataSource.getRepository(Board);
    const columnRepository = AppDataSource.getRepository(Column);
    const ticketRepository = AppDataSource.getRepository(Ticket);
    const users = await userRepository.save([
      {
        email: "admin@nnseca.com",
        username: "admin",
        firstName: "Admin",
        lastName: "User",
        password: await bcrypt.hash("AdminPass123!", 10),
      },
      {
        email: "alice@nnseca.com",
        username: "alice",
        firstName: "Alice",
        lastName: "Johnson",
        password: await bcrypt.hash("AlicePass123!", 10),
      },
      {
        email: "bob@nnseca.com",
        username: "bob",
        firstName: "Bob",
        lastName: "Smith",
        password: await bcrypt.hash("BobPass123!", 10),
      },
      {
        email: "charlie@nnseca.com",
        username: "charlie",
        firstName: "Charlie",
        lastName: "Brown",
        password: await bcrypt.hash("CharliePass123!", 10),
      },
      {
        email: "diana@nnseca.com",
        username: "diana",
        firstName: "Diana",
        lastName: "Davis",
        password: await bcrypt.hash("DianaPass123!", 10),
      },
    ]);

    console.log(`Created ${users.length} users`);
    const boards = await boardRepository.save([
      {
        title: "Frontend Development",
        description: "Tasks related to frontend development and UI/UX",
        createdBy: users[0].id,
      },
      {
        title: "Backend API",
        description: "Backend development tasks and API endpoints",
        createdBy: users[1].id,
      },
      {
        title: "DevOps & Infrastructure",
        description: "Deployment, CI/CD, and infrastructure tasks",
        createdBy: users[2].id,
      },
      {
        title: "Testing & QA",
        description: "Quality assurance and testing tasks",
        createdBy: users[3].id,
      },
    ]);

    console.log(`Created ${boards.length} boards`);
    const columnTitles = ["To Do", "In Progress", "Testing", "Done"];
    const allColumns = [];

    for (const board of boards) {
      for (let i = 0; i < columnTitles.length; i++) {
        const column = columnRepository.create({
          title: columnTitles[i],
          boardId: board.id,
          order: i,
        });
        allColumns.push(column);
      }
    }

    const columns = await columnRepository.save(allColumns);
    console.log(`Created ${columns.length} columns`);

    const tickets = [];
    const sampleTickets = [
      {
        title: "Implement user authentication UI",
        description: "Create login and registration forms with validation",
        priority: TicketPriority.HIGH,
        status: TicketStatus.IN_PROGRESS,
        boardIndex: 0,
        columnIndex: 1,
        assignedUserIndex: 1,
        createdByIndex: 0,
      },
      {
        title: "Design responsive navbar",
        description: "Create a mobile-first responsive navigation component",
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.TODO,
        boardIndex: 0,
        columnIndex: 0,
        assignedUserIndex: 2,
        createdByIndex: 0,
      },
      {
        title: "Implement board view component",
        description: "Create the main Kanban board view with drag and drop",
        priority: TicketPriority.HIGH,
        status: TicketStatus.TODO,
        boardIndex: 0,
        columnIndex: 0,
        assignedUserIndex: 1,
        createdByIndex: 0,
      },
      {
        title: "Add dark mode toggle",
        description: "Implement dark/light mode switching functionality",
        priority: TicketPriority.LOW,
        status: TicketStatus.DONE,
        boardIndex: 0,
        columnIndex: 3,
        assignedUserIndex: 2,
        createdByIndex: 0,
      },
      {
        title: "Implement JWT authentication",
        description: "Set up JWT-based authentication with refresh tokens",
        priority: TicketPriority.URGENT,
        status: TicketStatus.TESTING,
        boardIndex: 1,
        columnIndex: 2,
        assignedUserIndex: 3,
        createdByIndex: 1,
      },
      {
        title: "Create board management API",
        description: "CRUD endpoints for board management",
        priority: TicketPriority.HIGH,
        status: TicketStatus.DONE,
        boardIndex: 1,
        columnIndex: 3,
        assignedUserIndex: 4,
        createdByIndex: 1,
      },
      {
        title: "Implement WebSocket real-time updates",
        description: "Add Socket.IO for real-time board collaboration",
        priority: TicketPriority.HIGH,
        status: TicketStatus.IN_PROGRESS,
        boardIndex: 1,
        columnIndex: 1,
        assignedUserIndex: 0,
        createdByIndex: 1,
      },
      {
        title: "Add input validation middleware",
        description: "Implement comprehensive request validation",
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.TODO,
        boardIndex: 1,
        columnIndex: 0,
        assignedUserIndex: 3,
        createdByIndex: 1,
      },
      {
        title: "Set up Docker containers",
        description:
          "Create Docker configuration for development and production",
        priority: TicketPriority.HIGH,
        status: TicketStatus.DONE,
        boardIndex: 2,
        columnIndex: 3,
        assignedUserIndex: 2,
        createdByIndex: 2,
      },
      {
        title: "Configure CI/CD pipeline",
        description: "Set up automated testing and deployment",
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.IN_PROGRESS,
        boardIndex: 2,
        columnIndex: 1,
        assignedUserIndex: 4,
        createdByIndex: 2,
      },
      {
        title: "Write unit tests for authentication",
        description: "Comprehensive test coverage for auth module",
        priority: TicketPriority.HIGH,
        status: TicketStatus.TODO,
        boardIndex: 3,
        columnIndex: 0,
        assignedUserIndex: 0,
        createdByIndex: 3,
      },
      {
        title: "End-to-end testing setup",
        description: "Set up E2E testing framework and basic tests",
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.TODO,
        boardIndex: 3,
        columnIndex: 0,
        assignedUserIndex: 1,
        createdByIndex: 3,
      },
    ];

    for (let i = 0; i < sampleTickets.length; i++) {
      const ticketData = sampleTickets[i];
      const board = boards[ticketData.boardIndex];
      const boardColumns = columns.filter((c) => c.boardId === board.id);
      const column = boardColumns[ticketData.columnIndex];

      const ticket = ticketRepository.create({
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        status: ticketData.status,
        assignedTo: users[ticketData.assignedUserIndex].id,
        createdBy: users[ticketData.createdByIndex].id,
        columnId: column.id,
        boardId: board.id,
        order: i % 4,
      });

      tickets.push(ticket);
    }

    await ticketRepository.save(tickets);
    console.log(`Created ${tickets.length} tickets`);

    console.log("Database seeding completed successfully");
    console.log(`Created ${users.length} users and ${boards.length} boards`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

if (require.main === module) {
  runSeeds()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
