namespace CinemaHubApp.Models;

public record TicketReportItem(
    int TicketId,
    int SessionId,
    string CustomerName,
    string? CustomerPhone,
    int SeatNumber,
    DateTime PurchaseDate,
    bool IsPaid
);
