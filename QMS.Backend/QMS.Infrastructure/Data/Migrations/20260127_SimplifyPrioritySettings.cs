using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QMS.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyPrioritySettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TimeSliceMinutes",
                table: "PrioritySettings");

            migrationBuilder.DropColumn(
                name: "WeightedRatio",
                table: "PrioritySettings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TimeSliceMinutes",
                table: "PrioritySettings",
                type: "int",
                nullable: false,
                defaultValue: 15);

            migrationBuilder.AddColumn<decimal>(
                name: "WeightedRatio",
                table: "PrioritySettings",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 2.0m);
        }
    }
}
