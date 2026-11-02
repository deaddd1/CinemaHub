using Microsoft.Data.SqlClient;
using Spectre.Console;
using CinemaHubApp.Data;
using CinemaHubApp.Services;

const string connectionString = "Server=localhost;Database=CinemaHub_DB;Trusted_Connection=True;TrustServerCertificate=True;";
var dashboardService = new ExecutiveDashboardService(connectionString);

while (true)
{
    AnsiConsole.Clear();
    AnsiConsole.Write(new FigletText("CinemaHub CLI").Centered().Color(Color.Cyan1));

    var choice = AnsiConsole.Prompt(
        new SelectionPrompt<string>()
            .Title("[yellow]Оберіть дію:[/]")
            .PageSize(10)
            .AddChoices(new[] {
                "1. Розклад звичайних залів (Тема 3: Multi-JOIN)",
                "2. Фінансові збори > 300 грн (Тема 3: GROUP BY / HAVING)",
                "3. Параметризований DAL пошук (Тема 3: TableAdapter)",
                "4. Варіант 8 (Тема 3): Знижка 20% на мультфільми (UPDATE)",
                "5. Варіант 8 (Тема 5): Зведений Дашборд Директора (Multi-Matrix)",
                "6. Експорт Дашборду в Excel (.xlsx)",
                "7. Тест форматування (Сума прописом + GDPR маска)",
                "0. Вихід"
            }));

    if (choice.StartsWith("0")) break;

    try
    {
        switch (choice[0])
        {
            case '1':
                RunSchedule();
                break;
            case '2':
                RunRevenue();
                break;
            case '3':
                RunDalSearch();
                break;
            case '4':
                RunAnimationDiscount();
                break;
            case '5':
                dashboardService.RenderTerminalDashboard();
                break;
            case '6':
                string file = dashboardService.ExportToExcel();
                AnsiConsole.MarkupLine($"[green]Файл згенеровано:[/] [yellow]{file}[/]");
                break;
            case '7':
                AnsiConsole.MarkupLine($"Сума: [green]{ReportExpressions.AmountInWords(450.75m)}[/]");
                AnsiConsole.MarkupLine($"GDPR Телефон: [yellow]{ReportExpressions.MaskPhoneNumber("+380971112233")}[/]");
                break;
        }
    }
    catch (Exception ex)
    {
        AnsiConsole.MarkupLine($"[red]Помилка:[/] {ex.Message}");
    }

    AnsiConsole.WriteLine();
    AnsiConsole.MarkupLine("[grey]Натисніть Enter для продовження...[/]");
    Console.ReadLine();
}

void RunSchedule()
{
    const string sql = @"
        SELECT m.Title, g.GenreName, h.HallName, s.StartTime, s.TicketPrice
        FROM Genres g
        INNER JOIN Movies m ON g.GenreID = m.GenreID
        INNER JOIN Sessions s ON m.MovieID = s.MovieID
        INNER JOIN Halls h ON s.HallID = h.HallID
        WHERE h.IsVIP = 0
        ORDER BY s.StartTime;";

    using var conn = new SqlConnection(connectionString);
    using var cmd = new SqlCommand(sql, conn);
    conn.Open();
    using var reader = cmd.ExecuteReader();

    var table = new Table().Border(TableBorder.Rounded);
    table.AddColumns("Фільм", "Жанр", "Зал", "Початок", "Ціна");
    while (reader.Read())
    {
        table.AddRow(reader.GetString(0), reader.GetString(1), reader.GetString(2), reader.GetDateTime(3).ToString("yyyy-MM-dd HH:mm"), $"{reader.GetDecimal(4):0.00} грн");
    }
    AnsiConsole.Write(table);
}

void RunRevenue()
{
    const string sql = @"
        SELECT m.Title, COUNT(t.TicketID), SUM(s.TicketPrice)
        FROM Movies m
        INNER JOIN Sessions s ON m.MovieID = s.MovieID
        INNER JOIN Tickets t ON s.SessionID = t.SessionID
        GROUP BY m.Title
        HAVING SUM(s.TicketPrice) > 300
        ORDER BY SUM(s.TicketPrice) DESC;";

    using var conn = new SqlConnection(connectionString);
    using var cmd = new SqlCommand(sql, conn);
    conn.Open();
    using var reader = cmd.ExecuteReader();

    var table = new Table().Border(TableBorder.Rounded);
    table.AddColumns("Фільм", "Продано", "Виручка");
    while (reader.Read())
    {
        table.AddRow(reader.GetString(0), reader.GetInt32(1).ToString(), $"{reader.GetDecimal(2):0.00} грн");
    }
    AnsiConsole.Write(table);
}

void RunDalSearch()
{
    var adapter = new TicketsTableAdapter(connectionString);
    var tickets = adapter.GetDataByClientAndDate("Олександр", DateTime.Parse("2026-09-01"), DateTime.Parse("2026-10-31"));

    var table = new Table().Border(TableBorder.Rounded);
    table.AddColumns("Квиток #", "Клієнт", "Телефон", "Місце", "Дата");
    foreach (var t in tickets)
    {
        table.AddRow(t.TicketId.ToString(), t.CustomerName, t.CustomerPhone ?? "-", t.SeatNumber.ToString(), t.PurchaseDate.ToString("yyyy-MM-dd HH:mm"));
    }
    AnsiConsole.Write(table);
}

void RunAnimationDiscount()
{
    const string sql = @"
        UPDATE s
        SET s.TicketPrice = s.TicketPrice * 0.80
        FROM Sessions s
        INNER JOIN Movies m ON s.MovieID = m.MovieID
        INNER JOIN Genres g ON m.GenreID = g.GenreID
        WHERE g.GenreName = N'Анімація та Сімейні';";

    using var conn = new SqlConnection(connectionString);
    using var cmd = new SqlCommand(sql, conn);
    conn.Open();
    int count = cmd.ExecuteNonQuery();
    AnsiConsole.MarkupLine($"[green]Оновлено цін на сеанси мультфільмів:[/] [yellow]{count}[/]");
}
