using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Rukn.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCancellationReason : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                table: "Orders",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Orders_CancellationReason",
                table: "Orders",
                sql: "(\"Status\" = 4 AND \"CancellationReason\" IS NOT NULL AND length(trim(\"CancellationReason\")) > 0) OR (\"Status\" <> 4 AND \"CancellationReason\" IS NULL)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Orders_CancellationReason",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "Orders");
        }
    }
}
