using System.Data;
using ClosedXML.Excel;
using Microsoft.Data.SqlClient;
using Spectre.Console;

namespace CinemaHubApp.Services;

public class ExecutiveDashboardService
{
    private readonly string _connectionString;

    public ExecutiveDashboardService(string connectionString)
    {
        _connectionString = connectionString;
    }

    public void RenderTerminalDashboard()
    {
        using var conn = new SqlConnection(_connectionString);
        conn.Open();

        var dtHalls = ExecuteProcedure(conn, "sp_GetRevenueByHalls");
        var dtGenres = ExecuteProcedure(conn, "sp_GetRevenueByGenres");
        var dtBar = ExecuteProcedure(conn, "sp_GetTopBarItems");

        var tableHalls = new Table().Border(TableBorder.Rounded).Title("[bold green]1. Дохід за кінозалами[/]");
        tableHalls.AddColumns("Зал", "Клас", "Квитків", "Виручка");
        foreach (DataRow row in dtHalls.Rows)
        {
            tableHalls.AddRow(
                row["Зал"].ToString()!,
                row["Клас"].ToString()!,
                row["Квитків"].ToString()!,
                $"{Convert.ToDecimal(row["ВиручкаГрн"]):N2} грн"
            );
        }

        var tableGenres = new Table().Border(TableBorder.Rounded).Title("[bold blue]2. Дохід за жанрами[/]");
        tableGenres.AddColumns("Жанр", "Фільмів", "Квитків", "Виручка");
        foreach (DataRow row in dtGenres.Rows)
        {
            tableGenres.AddRow(
                row["Жанр"].ToString()!,
                row["ФільмівУПрокаті"].ToString()!,
                row["ПроданоКвитків"].ToString()!,
                $"{Convert.ToDecimal(row["ВиручкаГрн"]):N2} грн"
            );
        }

        var tableBar = new Table().Border(TableBorder.Rounded).Title("[bold yellow]3. ТОП товарів кінобару[/]");
        tableBar.AddColumns("Товар", "Категорія", "Продано (шт)", "Сума");
        foreach (DataRow row in dtBar.Rows)
        {
            tableBar.AddRow(
                row["Товар"].ToString()!,
                row["Категорія"].ToString()!,
                row["ПроданоШт"].ToString()!,
                $"{Convert.ToDecimal(row["ЗагальнийДохідГрн"]):N2} грн"
            );
        }

        var layout = new Layout("Root")
            .SplitColumns(
                new Layout("Left").SplitRows(new Layout("Halls"), new Layout("Genres")),
                new Layout("Right").SplitRows(new Layout("Bar"))
            );

        layout["Halls"].Update(tableHalls);
        layout["Genres"].Update(tableGenres);
        layout["Bar"].Update(tableBar);

        AnsiConsole.Write(layout);
    }

    public string ExportToExcel(string outputPath = "ExecutiveDashboard.xlsx")
    {
        using var conn = new SqlConnection(_connectionString);
        conn.Open();

        var dtHalls = ExecuteProcedure(conn, "sp_GetRevenueByHalls");
        var dtGenres = ExecuteProcedure(conn, "sp_GetRevenueByGenres");
        var dtBar = ExecuteProcedure(conn, "sp_GetTopBarItems");

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Дашборд Директора");

        ws.Cell("A1").Value = "ЗВЕДЕНИЙ ДАШБОРД ГЕНЕРАЛЬНОГО ДИРЕКТОРА CINEMAHUB";
        ws.Range("A1:G1").Merge().Style.Font.SetBold().Font.SetFontSize(14).Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

        ws.Cell("A3").Value = "ДОХІД ЗА ЗАЛАМИ";
        ws.Cell("A3").Style.Font.SetBold().Fill.SetBackgroundColor(XLColor.LightGreen);
        ws.Cell("A4").InsertData(dtHalls.AsEnumerable());
        ApplyHeader(ws, 4, 1, new[] { "Зал", "Клас", "Квитків", "Виручка (грн)" });

        int genresRow = 6 + dtHalls.Rows.Count;
        ws.Cell(genresRow, 1).Value = "ДОХІД ЗА ЖАНРАМИ";
        ws.Cell(genresRow, 1).Style.Font.SetBold().Fill.SetBackgroundColor(XLColor.LightSkyBlue);
        ws.Cell(genresRow + 1, 1).InsertData(dtGenres.AsEnumerable());
        ApplyHeader(ws, genresRow + 1, 1, new[] { "Жанр", "Фільмів", "Квитків", "Виручка (грн)" });

        ws.Cell("F3").Value = "ТОП-5 БАРНИХ ТОВАРІВ";
        ws.Cell("F3").Style.Font.SetBold().Fill.SetBackgroundColor(XLColor.LightYellow);
        ws.Cell("F4").InsertData(dtBar.AsEnumerable());
        ApplyHeader(ws, 4, 6, new[] { "Товар", "Категорія", "Кількість", "Дохід (грн)" });

        ws.Columns().AdjustToContents();
        workbook.SaveAs(outputPath);

        return Path.GetFullPath(outputPath);
    }

    private static void ApplyHeader(IXLWorksheet ws, int row, int startCol, string[] headers)
    {
        for (int i = 0; i < headers.Length; i++)
        {
            var cell = ws.Cell(row, startCol + i);
            cell.Value = headers[i];
            cell.Style.Font.SetBold().Fill.SetBackgroundColor(XLColor.LightGray);
        }
    }

    private static DataTable ExecuteProcedure(SqlConnection conn, string procName)
    {
        using var cmd = new SqlCommand(procName, conn) { CommandType = CommandType.StoredProcedure };
        using var da = new SqlDataAdapter(cmd);
        var dt = new DataTable();
        da.Fill(dt);
        return dt;
    }
}
