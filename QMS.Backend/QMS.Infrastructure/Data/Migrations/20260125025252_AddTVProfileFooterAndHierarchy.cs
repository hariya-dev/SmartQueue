using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QMS.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTVProfileFooterAndHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FooterPosition",
                table: "TVProfiles",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "FooterSizePercent",
                table: "TVProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "FooterText",
                table: "TVProfiles",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "HeaderSizePercent",
                table: "TVProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "ShowFooter",
                table: "TVProfiles",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FooterPosition",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "FooterSizePercent",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "FooterText",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "HeaderSizePercent",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "ShowFooter",
                table: "TVProfiles");
        }
    }
}
