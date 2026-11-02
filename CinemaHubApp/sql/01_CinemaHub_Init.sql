
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CinemaHub_DB')
    CREATE DATABASE CinemaHub_DB;
GO
USE CinemaHub_DB;
GO

IF OBJECT_ID('BarSales', 'U') IS NOT NULL DROP TABLE BarSales;
IF OBJECT_ID('BarItems', 'U') IS NOT NULL DROP TABLE BarItems;
IF OBJECT_ID('Tickets', 'U') IS NOT NULL DROP TABLE Tickets;
IF OBJECT_ID('Sessions', 'U') IS NOT NULL DROP TABLE Sessions;
IF OBJECT_ID('Movies', 'U') IS NOT NULL DROP TABLE Movies;
IF OBJECT_ID('Halls', 'U') IS NOT NULL DROP TABLE Halls;
IF OBJECT_ID('Genres', 'U') IS NOT NULL DROP TABLE Genres;

CREATE TABLE Genres (
    GenreID INT IDENTITY(1,1) PRIMARY KEY,
    GenreName NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL
);

CREATE TABLE Halls (
    HallID INT IDENTITY(1,1) PRIMARY KEY,
    HallName NVARCHAR(50) NOT NULL,
    Capacity INT NOT NULL CHECK (Capacity > 0),
    IsVIP BIT DEFAULT 0 NOT NULL
);

CREATE TABLE Movies (
    MovieID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(150) NOT NULL,
    GenreID INT NOT NULL,
    DurationMinutes INT NOT NULL CHECK (DurationMinutes > 0),
    AgeRating NVARCHAR(10) DEFAULT '12+' NOT NULL,
    BasePrice DECIMAL(10,2) NOT NULL CHECK (BasePrice >= 0),
    CONSTRAINT FK_Movies_Genres FOREIGN KEY (GenreID) REFERENCES Genres(GenreID) ON DELETE CASCADE
);

CREATE TABLE Sessions (
    SessionID INT IDENTITY(1,1) PRIMARY KEY,
    MovieID INT NOT NULL,
    HallID INT NOT NULL,
    StartTime DATETIME NOT NULL,
    TicketPrice DECIMAL(10,2) NOT NULL CHECK (TicketPrice >= 0),
    CONSTRAINT FK_Sessions_Movies FOREIGN KEY (MovieID) REFERENCES Movies(MovieID),
    CONSTRAINT FK_Sessions_Halls FOREIGN KEY (HallID) REFERENCES Halls(HallID)
);

CREATE TABLE Tickets (
    TicketID INT IDENTITY(1,1) PRIMARY KEY,
    SessionID INT NOT NULL,
    CustomerName NVARCHAR(100) NOT NULL,
    CustomerPhone NVARCHAR(20) NULL,
    SeatNumber INT NOT NULL CHECK (SeatNumber > 0),
    PurchaseDate DATETIME DEFAULT GETDATE() NOT NULL,
    IsPaid BIT DEFAULT 1 NOT NULL,
    CONSTRAINT FK_Tickets_Sessions FOREIGN KEY (SessionID) REFERENCES Sessions(SessionID) ON DELETE CASCADE
);

CREATE TABLE BarItems (
    ItemID INT IDENTITY(1,1) PRIMARY KEY,
    ItemName NVARCHAR(100) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL
);

CREATE TABLE BarSales (
    BarSaleID INT IDENTITY(1,1) PRIMARY KEY,
    ItemID INT NOT NULL,
    Quantity INT NOT NULL,
    SaleDate DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_BarSales_Items FOREIGN KEY (ItemID) REFERENCES BarItems(ItemID)
);

INSERT INTO Genres (GenreName, Description) VALUES
(N'Наукова Фантастика', N'Фільми про майбутнє, космос та технології'),
(N'Екшн та Бойовики', N'Динамічні фільми з бійками та погонями'),
(N'Драма та Біографія', N'Глибокі сюжетні стрічки та реальні історії'),
(N'Анімація та Сімейні', N'Мультфільми для перегляду всією родиною');

INSERT INTO Halls (HallName, Capacity, IsVIP) VALUES
(N'Зал 1 (Red Hall)', 100, 0),
(N'Зал 2 (Blue IMAX)', 150, 0),
(N'Зал 3 (VIP Lounge)', 30, 1);

INSERT INTO Movies (Title, GenreID, DurationMinutes, AgeRating, BasePrice) VALUES
(N'Дюна: Частина друга', 1, 166, '16+', 200.00),
(N'Інтерстеллар', 1, 169, '12+', 180.00),
(N'Оппенгеймер', 3, 180, '18+', 220.00),
(N'Дедпул і Росомаха', 2, 127, '18+', 210.00),
(N'Думками навиворіт 2', 4, 96, '0+', 160.00),
(N'Кунг-Фу Панда 4', 4, 94, '0+', 150.00);

INSERT INTO Sessions (MovieID, HallID, StartTime, TicketPrice) VALUES
(1, 2, '2026-10-01 14:00:00', 200.00),
(1, 2, '2026-10-01 18:00:00', 220.00),
(2, 1, '2026-10-01 15:30:00', 180.00),
(3, 3, '2026-10-01 19:00:00', 350.00),
(4, 2, '2026-10-01 21:30:00', 230.00),
(5, 1, '2026-10-02 12:00:00', 160.00),
(6, 1, '2026-10-02 14:00:00', 150.00),
(1, 3, '2026-10-02 18:30:00', 320.00);

INSERT INTO Tickets (SessionID, CustomerName, CustomerPhone, SeatNumber, PurchaseDate, IsPaid) VALUES
(1, N'Олександр Іваненко', '+380971112233', 12, '2026-09-28 10:15:00', 1),
(1, N'Марія Бондаренко', '+380502223344', 13, '2026-09-28 10:20:00', 1),
(1, N'Дмитро Шевченко', '+380633334455', 14, '2026-09-28 11:00:00', 1),
(2, N'Віктор Мороз', '+380984445566', 45, '2026-09-29 14:30:00', 1),
(2, N'Олена Кравц', '+380505556677', 46, '2026-09-29 14:35:00', 1),
(3, N'Андрій Ткачук', '+380676667788', 20, '2026-09-29 16:00:00', 1),
(4, N'Ігор Мельник', '+380937778899', 5, '2026-09-30 09:12:00', 1),
(4, N'Наталія Савченко', '+380508889900', 6, '2026-09-30 09:15:00', 1),
(5, N'Сергій Поліщук', '+380979990011', 88, '2026-09-30 18:40:00', 1),
(6, N'Юлія Лисенко', '+380630001122', 15, '2026-10-01 08:20:00', 1);

INSERT INTO BarItems (ItemName, Category, Price) VALUES
(N'Попкорн Солоний L', N'Попкорн', 140.00),
(N'Попкорн Сирний XL', N'Попкорн', 170.00),
(N'Coca-Cola 0.5', N'Напої', 65.00),
(N'Nachos з сирним соусом', N'Снеки', 150.00),
(N'Вода BonAqua 0.5', N'Напої', 45.00);

INSERT INTO BarSales (ItemID, Quantity, SaleDate) VALUES
(1, 45, '2026-10-01 14:30:00'),
(2, 60, '2026-10-01 18:00:00'),
(3, 110, '2026-10-01 18:15:00'),
(4, 35, '2026-10-01 19:00:00'),
(5, 50, '2026-10-02 12:00:00');
GO

CREATE OR ALTER PROCEDURE sp_GetRevenueByHalls
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        h.HallName AS [Зал],
        CASE WHEN h.IsVIP = 1 THEN 'VIP' ELSE 'Standard' END AS [Клас],
        COUNT(t.TicketID) AS [Квитків],
        ISNULL(SUM(s.TicketPrice), 0.00) AS [ВиручкаГрн]
    FROM Halls h
    LEFT JOIN Sessions s ON h.HallID = s.HallID
    LEFT JOIN Tickets t ON s.SessionID = t.SessionID AND t.IsPaid = 1
    GROUP BY h.HallName, h.IsVIP
    ORDER BY [ВиручкаГрн] DESC;
END;
GO

CREATE OR ALTER PROCEDURE sp_GetRevenueByGenres
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        g.GenreName AS [Жанр],
        COUNT(DISTINCT m.MovieID) AS [ФільмівУПрокаті],
        COUNT(t.TicketID) AS [ПроданоКвитків],
        ISNULL(SUM(s.TicketPrice), 0.00) AS [ВиручкаГрн]
    FROM Genres g
    LEFT JOIN Movies m ON g.GenreID = m.GenreID
    LEFT JOIN Sessions s ON m.MovieID = s.MovieID
    LEFT JOIN Tickets t ON s.SessionID = t.SessionID AND t.IsPaid = 1
    GROUP BY g.GenreName
    ORDER BY [ВиручкаГрн] DESC;
END;
GO

CREATE OR ALTER PROCEDURE sp_GetTopBarItems
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 5
        b.ItemName AS [Товар],
        b.Category AS [Категорія],
        SUM(bs.Quantity) AS [ПроданоШт],
        SUM(bs.Quantity * b.Price) AS [ЗагальнийДохідГрн]
    FROM BarItems b
    INNER JOIN BarSales bs ON b.ItemID = bs.ItemID
    GROUP BY b.ItemName, b.Category
    ORDER BY [ЗагальнийДохідГрн] DESC;
END;
GO
