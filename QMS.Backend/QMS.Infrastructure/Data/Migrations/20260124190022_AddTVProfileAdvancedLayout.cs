using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QMS.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTVProfileAdvancedLayout : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ColumnsPerRow",
                table: "TVProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LayoutMode",
                table: "TVProfiles",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "ScreenHeight",
                table: "TVProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ScreenWidth",
                table: "TVProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ColumnsPerRow",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "LayoutMode",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "ScreenHeight",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "ScreenWidth",
                table: "TVProfiles");
        }
    }
}
