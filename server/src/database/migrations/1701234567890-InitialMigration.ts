import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1701234567890 implements MigrationInterface {
  name = "InitialMigration1701234567890";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "username" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "password" character varying NOT NULL,
        "avatar" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "boards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" character varying,
        "createdBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_boards_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "columns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "boardId" uuid NOT NULL,
        "order" integer NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_columns_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tickets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" character varying,
        "priority" character varying NOT NULL DEFAULT 'MEDIUM',
        "status" character varying NOT NULL DEFAULT 'TODO',
        "assignedTo" uuid,
        "createdBy" uuid NOT NULL,
        "columnId" uuid NOT NULL,
        "boardId" uuid NOT NULL,
        "order" integer NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tickets_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_tickets_priority" CHECK ("priority" IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
        CONSTRAINT "CHK_tickets_status" CHECK ("status" IN ('TODO', 'IN_PROGRESS', 'TESTING', 'DONE'))
      )
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "boards"
        ADD CONSTRAINT "FK_boards_createdBy" 
        FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "columns"
        ADD CONSTRAINT "FK_columns_boardId" 
        FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "tickets"
        ADD CONSTRAINT "FK_tickets_assignedTo" 
        FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "tickets"
        ADD CONSTRAINT "FK_tickets_createdBy" 
        FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "tickets"
        ADD CONSTRAINT "FK_tickets_columnId" 
        FOREIGN KEY ("columnId") REFERENCES "columns"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "tickets"
        ADD CONSTRAINT "FK_tickets_boardId" 
        FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_boards_createdBy" ON "boards" ("createdBy")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_columns_boardId" ON "columns" ("boardId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_columns_order" ON "columns" ("boardId", "order")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_tickets_assignedTo" ON "tickets" ("assignedTo")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_tickets_createdBy" ON "tickets" ("createdBy")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_tickets_columnId" ON "tickets" ("columnId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_tickets_boardId" ON "tickets" ("boardId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_tickets_order" ON "tickets" ("columnId", "order")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_tickets_status" ON "tickets" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_tickets_priority" ON "tickets" ("priority")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_tickets_priority"`);
    await queryRunner.query(`DROP INDEX "IDX_tickets_status"`);
    await queryRunner.query(`DROP INDEX "IDX_tickets_order"`);
    await queryRunner.query(`DROP INDEX "IDX_tickets_boardId"`);
    await queryRunner.query(`DROP INDEX "IDX_tickets_columnId"`);
    await queryRunner.query(`DROP INDEX "IDX_tickets_createdBy"`);
    await queryRunner.query(`DROP INDEX "IDX_tickets_assignedTo"`);
    await queryRunner.query(`DROP INDEX "IDX_columns_order"`);
    await queryRunner.query(`DROP INDEX "IDX_columns_boardId"`);
    await queryRunner.query(`DROP INDEX "IDX_boards_createdBy"`);

    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_tickets_boardId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_tickets_columnId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_tickets_createdBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_tickets_assignedTo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "columns" DROP CONSTRAINT "FK_columns_boardId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "boards" DROP CONSTRAINT "FK_boards_createdBy"`,
    );

    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(`DROP TABLE "columns"`);
    await queryRunner.query(`DROP TABLE "boards"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
