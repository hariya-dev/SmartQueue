using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QMS.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketIssuedDateAndCompositeIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Add IssuedDate column first
            migrationBuilder.AddColumn<DateOnly>(
                name: "IssuedDate",
                table: "Tickets",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            // 2. Populate IssuedDate from IssuedAt
            migrationBuilder.Sql("UPDATE Tickets SET IssuedDate = CAST(IssuedAt AS DATE);");

            // 3. Create new indexes first (this satisfies foreign key requirements for RoomId, ServiceId etc.)
            migrationBuilder.CreateIndex(
                name: "IX_Tickets_IssuedDate",
                table: "Tickets",
                column: "IssuedDate");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_RoomId_Status_IssuedDate",
                table: "Tickets",
                columns: new[] { "RoomId", "Status", "IssuedDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_ServiceId_RoomId_Status_IssuedDate",
                table: "Tickets",
                columns: new[] { "ServiceId", "RoomId", "Status", "IssuedDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_TicketNumber_IssuedDate",
                table: "Tickets",
                columns: new[] { "TicketNumber", "IssuedDate" },
                unique: true);

            // 4. Safely drop old indexes
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS DropIndexIfExists;
                CREATE PROCEDURE DropIndexIfExists(IN tableName VARCHAR(255), IN indexName VARCHAR(255))
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.statistics 
                               WHERE table_name = tableName AND index_name = indexName AND table_schema = DATABASE()) THEN
                        SET @query = CONCAT('ALTER TABLE ', tableName, ' DROP INDEX ', indexName);
                        PREPARE stmt FROM @query;
                        EXECUTE stmt;
                        DEALLOCATE PREPARE stmt;
                    END IF;
                END;
            ");

            migrationBuilder.Sql("CALL DropIndexIfExists('Tickets', 'IX_Tickets_IssuedAt');");
            migrationBuilder.Sql("CALL DropIndexIfExists('Tickets', 'IX_Tickets_RoomId_Status');");
            migrationBuilder.Sql("CALL DropIndexIfExists('Tickets', 'IX_Tickets_ServiceId_RoomId_Status_IssuedAt');");
            migrationBuilder.Sql("CALL DropIndexIfExists('Tickets', 'IX_Tickets_TicketNumber');");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS DropIndexIfExists;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tickets_IssuedDate",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_RoomId_Status_IssuedDate",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_ServiceId_RoomId_Status_IssuedDate",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_TicketNumber_IssuedDate",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "IssuedDate",
                table: "Tickets");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_IssuedAt",
                table: "Tickets",
                column: "IssuedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_RoomId_Status",
                table: "Tickets",
                columns: new[] { "RoomId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_ServiceId_RoomId_Status_IssuedAt",
                table: "Tickets",
                columns: new[] { "ServiceId", "RoomId", "Status", "IssuedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_TicketNumber",
                table: "Tickets",
                column: "TicketNumber",
                unique: true);
        }
    }
}
