using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QMS.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTVCustomizationAndAds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActiveColor",
                table: "TVProfiles",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ConnectionStatusColor",
                table: "TVProfiles",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "CounterNumberFontSize",
                table: "TVProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DateTimeFontSize",
                table: "TVProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "FooterBgColor",
                table: "TVProfiles",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "FooterFontSize",
                table: "TVProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "FooterTextColor",
                table: "TVProfiles",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "HeaderBgColor",
                table: "TVProfiles",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "HeaderTextColor",
                table: "TVProfiles",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "HospitalNameFontSize",
                table: "TVProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "InactiveColor",
                table: "TVProfiles",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "MainBgColor",
                table: "TVProfiles",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "MainTextColor",
                table: "TVProfiles",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "RoomNameFontSize",
                table: "TVProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TicketNumberFontSize",
                table: "TVProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "TVAds",
                columns: table => new
                {
                    TVAdId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    TVProfileId = table.Column<int>(type: "int", nullable: false),
                    AdTitle = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Url = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AdType = table.Column<int>(type: "int", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    DurationInSeconds = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TVAds", x => x.TVAdId);
                    table.ForeignKey(
                        name: "FK_TVAds_TVProfiles_TVProfileId",
                        column: x => x.TVProfileId,
                        principalTable: "TVProfiles",
                        principalColumn: "TVProfileId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_TVAds_TVProfileId",
                table: "TVAds",
                column: "TVProfileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TVAds");

            migrationBuilder.DropColumn(
                name: "ActiveColor",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "ConnectionStatusColor",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "CounterNumberFontSize",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "DateTimeFontSize",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "FooterBgColor",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "FooterFontSize",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "FooterTextColor",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "HeaderBgColor",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "HeaderTextColor",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "HospitalNameFontSize",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "InactiveColor",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "MainBgColor",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "MainTextColor",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "RoomNameFontSize",
                table: "TVProfiles");

            migrationBuilder.DropColumn(
                name: "TicketNumberFontSize",
                table: "TVProfiles");
        }
    }
}
