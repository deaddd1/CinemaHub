// DTOs mirroring the C# ASP.NET Core Web API (CinemaHub_DB)

export interface MovieDto {
  MovieID: number;
  Title: string;
  GenreName: string;
  DurationMin: number;
  AgeRating: string;
  Featured: boolean;
  Tagline: string;
}

export interface MovieSessionDto {
  SessionID: number;
  MovieID: number;
  Title: string;
  GenreName: string;
  AgeRating: string;
  DurationMin: number;
  HallName: string;
  Capacity: number;
  SoldSeats: number;
  TakenSeats: string[];
  StartTime: string; // ISO
  TicketPrice: number;
  IsVIP: boolean;
}

export interface BookTicketsRequest {
  SessionID: number;
  Seats: string[];
  CustomerName: string;
  CustomerPhone: string;
}

export interface BookTicketsResponse {
  TicketIDs: number[];
  TotalPaid: number;
}

export interface RevenueReportDto {
  Title: string;
  SoldTickets: number;
  TotalRevenue: number;
}

export interface HallOccupancyDto {
  HallName: string;
  Capacity: number;
  Booked: number;
}

export interface RevenueAnalyticsDto {
  Movies: RevenueReportDto[];
  Halls: HallOccupancyDto[];
}

export interface HallRevenueDto {
  HallName: string;
  IsVIP: boolean;
  SoldTickets: number;
  TotalRevenue: number;
}

export interface GenreRevenueDto {
  GenreName: string;
  MoviesCount: number;
  TicketsCount: number;
  GrossRevenue: number;
}

export interface BarItemDto {
  Rank: number;
  ItemName: string;
  Category: string;
  SoldQuantity: number;
  GrossRevenue: number;
}

export interface ExecutiveDashboardDto {
  HallsRevenue: HallRevenueDto[];
  GenresRevenue: GenreRevenueDto[];
  TopBarItems: BarItemDto[];
}

export interface TicketItemDto {
  TicketID: number;
  MovieTitle: string;
  SessionStart: string;
  CustomerName: string;
  CustomerPhone: string;
  SeatNumber: string;
  PurchaseDate: string;
  IsPaid: boolean;
}

export interface PromoResultDto {
  SessionID: number;
  Title: string;
  StartTime: string;
  OldPrice: number;
  NewPrice: number;
}
