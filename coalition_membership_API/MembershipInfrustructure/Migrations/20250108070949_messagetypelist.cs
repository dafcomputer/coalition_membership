using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MembershipInfrustructure.Migrations
{
    /// <inheritdoc />
    public partial class messagetypelist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MessageType",
                table: "EventMessages");

            migrationBuilder.AddColumn<string>(
                name: "MessageTypes",
                table: "EventMessages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MessageTypes",
                table: "EventMessages");

            migrationBuilder.AddColumn<int>(
                name: "MessageType",
                table: "EventMessages",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
