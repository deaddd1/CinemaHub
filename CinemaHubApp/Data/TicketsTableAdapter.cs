using System.Data;
using Microsoft.Data.SqlClient;
using CinemaHubApp.Models;

namespace CinemaHubApp.Data;

public class TicketsTableAdapter
{
    private readonly string _connectionString;

    public TicketsTableAdapter(string connectionString)
    {
        _connectionString = connectionString;
    }

    public List<TicketReportItem> GetDataByClientAndDate(string customerName, DateTime startDate, DateTime endDate)
    {
        const string query = @"
            SELECT TicketID, SessionID, CustomerName, CustomerPhone, SeatNumber, PurchaseDate, IsPaid
            FROM Tickets
            WHERE (CustomerName LIKE '%' + @CustomerName + '%')
              AND (PurchaseDate >= @StartDate AND PurchaseDate <= @EndDate);";

        var result = new List<TicketReportItem>();

        using var connection = new SqlConnection(_connectionString);
        using var command = new SqlCommand(query, connection);

        command.Parameters.Add("@CustomerName", SqlDbType.NVarChar, 100).Value = customerName;
        command.Parameters.Add("@StartDate", SqlDbType.DateTime).Value = startDate;
        command.Parameters.Add("@EndDate", SqlDbType.DateTime).Value = endDate;

        connection.Open();
        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            result.Add(new TicketReportItem(
                TicketId: reader.GetInt32(0),
                SessionId: reader.GetInt32(1),
                CustomerName: reader.GetString(2),
                CustomerPhone: reader.IsDBNull(3) ? null : reader.GetString(3),
                SeatNumber: reader.GetInt32(4),
                PurchaseDate: reader.GetDateTime(5),
                IsPaid: reader.GetBoolean(6)
            ));
        }

        return result;
    }
}
