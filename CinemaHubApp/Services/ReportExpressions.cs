
namespace CinemaHubApp.Services;

public static class ReportExpressions
{
    public static string MaskPhoneNumber(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone) || phone.Length < 10)
            return phone ?? string.Empty;

        return $"{phone[..4]}******{phone[^3..]}";
    }

    public static string AmountInWords(decimal amount)
    {
        long hryvnias = (long)Math.Truncate(amount);
        int kopecks = (int)((amount - hryvnias) * 100);
        return $"{hryvnias} грн. {kopecks:D2} коп.";
    }
}
