using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QMS.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPrinterDetailsAndUserPrinterRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConnectionString",
                table: "Printers");

            migrationBuilder.AddColumn<int>(
                name: "PrinterId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "Printers",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Printers",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Users_PrinterId",
                table: "Users",
                column: "PrinterId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Printers_PrinterId",
                table: "Users",
                column: "PrinterId",
                principalTable: "Printers",
                principalColumn: "PrinterId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Printers_PrinterId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_PrinterId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PrinterId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "Printers");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Printers");

            migrationBuilder.AddColumn<string>(
                name: "ConnectionString",
                table: "Printers",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
