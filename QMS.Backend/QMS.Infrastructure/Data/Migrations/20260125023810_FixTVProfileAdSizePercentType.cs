using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QMS.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixTVProfileAdSizePercentType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First, ensure all values are numeric strings
            migrationBuilder.Sql("UPDATE `TVProfiles` SET `AdSizePercent` = '30' WHERE `AdSizePercent` IS NULL OR `AdSizePercent` = '' OR `AdSizePercent` NOT REGEXP '^[0-9]+$';");

            migrationBuilder.AlterColumn<int>(
                name: "AdSizePercent",
                table: "TVProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "AdSizePercent",
                table: "TVProfiles",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
