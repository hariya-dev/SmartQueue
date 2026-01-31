using Microsoft.EntityFrameworkCore;
using QMS.Core.Entities;
using QMS.Core.Enums;

namespace QMS.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(QMSDbContext context)
    {
        // Check if already seeded
        if (await context.Services.AnyAsync())
            return;

        // Seed Services
        var services = new List<Service>
        {
            new() { ServiceCode = "XN", ServiceName = "Xét nghiệm", DisplayOrder = 1, IsActive = true },
            new() { ServiceCode = "SA", ServiceName = "Siêu âm", DisplayOrder = 2, IsActive = true },
            new() { ServiceCode = "KN", ServiceName = "Khám Nội", DisplayOrder = 3, IsActive = true },
            new() { ServiceCode = "KNG", ServiceName = "Khám Ngoại", DisplayOrder = 4, IsActive = true },
            new() { ServiceCode = "BLVP", ServiceName = "Bán lẻ - Viện phí", DisplayOrder = 5, IsActive = true },
            new() { ServiceCode = "TT", ServiceName = "Thu tiền", DisplayOrder = 6, IsActive = true }
        };
        await context.Services.AddRangeAsync(services);
        await context.SaveChangesAsync();

        // Seed Rooms for each service
        var rooms = new List<Room>
        {
            // Xét nghiệm rooms
            new() { ServiceId = services[0].ServiceId, RoomCode = "XN-P1", RoomName = "Phòng Xét nghiệm 1", IsActive = true },
            new() { ServiceId = services[0].ServiceId, RoomCode = "XN-P2", RoomName = "Phòng Xét nghiệm 2", IsActive = true },
            new() { ServiceId = services[0].ServiceId, RoomCode = "XN-P3", RoomName = "Phòng Xét nghiệm 3", IsActive = true },
            
            // Siêu âm rooms
            new() { ServiceId = services[1].ServiceId, RoomCode = "SA-P1", RoomName = "Phòng Siêu âm 1", IsActive = true },
            new() { ServiceId = services[1].ServiceId, RoomCode = "SA-P2", RoomName = "Phòng Siêu âm 2", IsActive = true },
            
            // Khám Nội rooms
            new() { ServiceId = services[2].ServiceId, RoomCode = "KN-P1", RoomName = "Phòng Khám Nội 1", IsActive = true },
            new() { ServiceId = services[2].ServiceId, RoomCode = "KN-P2", RoomName = "Phòng Khám Nội 2", IsActive = true },
            new() { ServiceId = services[2].ServiceId, RoomCode = "KN-P3", RoomName = "Phòng Khám Nội 3", IsActive = true },
            
            // Khám Ngoại rooms
            new() { ServiceId = services[3].ServiceId, RoomCode = "KNG-P1", RoomName = "Phòng Khám Ngoại 1", IsActive = true },
            new() { ServiceId = services[3].ServiceId, RoomCode = "KNG-P2", RoomName = "Phòng Khám Ngoại 2", IsActive = true },
            
            // BLVP rooms
            new() { ServiceId = services[4].ServiceId, RoomCode = "BLVP-P1", RoomName = "Quầy BLVP 1", IsActive = true },
            
            // Thu tiền rooms
            new() { ServiceId = services[5].ServiceId, RoomCode = "TT-P1", RoomName = "Quầy Thu tiền 1", IsActive = true },
            new() { ServiceId = services[5].ServiceId, RoomCode = "TT-P2", RoomName = "Quầy Thu tiền 2", IsActive = true }
        };
        await context.Rooms.AddRangeAsync(rooms);
        await context.SaveChangesAsync();

        // Seed Printers
        var printers = new List<Printer>
        {
            new() { PrinterCode = "PR-01", PrinterName = "Máy in Sảnh chính", PrinterType = "Thermal", ConnectionType = "Network", AreaCode = "LOBBY", IsActive = true, Status = PrinterStatus.Online },
            new() { PrinterCode = "PR-02", PrinterName = "Máy in Khu A", PrinterType = "Thermal", ConnectionType = "Network", AreaCode = "AREA-A", IsActive = true, Status = PrinterStatus.Online },
            new() { PrinterCode = "PR-03", PrinterName = "Máy in Khu B", PrinterType = "Thermal", ConnectionType = "Network", AreaCode = "AREA-B", IsActive = true, Status = PrinterStatus.Online }
        };
        await context.Printers.AddRangeAsync(printers);
        await context.SaveChangesAsync();

        // Seed Kiosks
        var kiosks = new List<Kiosk>
        {
            new() { KioskCode = "KIOSK-01", KioskName = "Kiosk Sảnh chính", Location = "Sảnh chính - Tầng 1", DefaultPrinterId = printers[0].PrinterId, IsActive = true },
            new() { KioskCode = "KIOSK-02", KioskName = "Kiosk Khu A", Location = "Khu A - Tầng 2", DefaultPrinterId = printers[1].PrinterId, IsActive = true },
            new() { KioskCode = "KIOSK-03", KioskName = "Kiosk Khu B", Location = "Khu B - Tầng 3", DefaultPrinterId = printers[2].PrinterId, IsActive = true }
        };
        await context.Kiosks.AddRangeAsync(kiosks);
        await context.SaveChangesAsync();

        // Seed TV Profiles
        var tvProfiles = new List<TVProfile>
        {
            new() { TVCode = "TV-01", TVName = "TV Sảnh chính - Tất cả", DisplayMode = TVDisplayMode.All, IsActive = true },
            new() { TVCode = "TV-02", TVName = "TV Khu Xét nghiệm", DisplayMode = TVDisplayMode.Specific, IsActive = true },
            new() { TVCode = "TV-03", TVName = "TV Khu Khám bệnh", DisplayMode = TVDisplayMode.Specific, IsActive = true }
        };
        await context.TVProfiles.AddRangeAsync(tvProfiles);
        await context.SaveChangesAsync();

        // Assign rooms to TV profiles
        var tvProfileRooms = new List<TVProfileRoom>
        {
            // TV-02: XN rooms
            new() { TVProfileId = tvProfiles[1].TVProfileId, RoomId = rooms[0].RoomId },
            new() { TVProfileId = tvProfiles[1].TVProfileId, RoomId = rooms[1].RoomId },
            new() { TVProfileId = tvProfiles[1].TVProfileId, RoomId = rooms[2].RoomId },
            
            // TV-03: Khám Nội + Khám Ngoại
            new() { TVProfileId = tvProfiles[2].TVProfileId, RoomId = rooms[5].RoomId },
            new() { TVProfileId = tvProfiles[2].TVProfileId, RoomId = rooms[6].RoomId },
            new() { TVProfileId = tvProfiles[2].TVProfileId, RoomId = rooms[7].RoomId },
            new() { TVProfileId = tvProfiles[2].TVProfileId, RoomId = rooms[8].RoomId },
            new() { TVProfileId = tvProfiles[2].TVProfileId, RoomId = rooms[9].RoomId }
        };
        await context.TVProfileRooms.AddRangeAsync(tvProfileRooms);
        await context.SaveChangesAsync();

        // Seed Post Process Branches
        var branches = new List<PostProcessBranch>
        {
            new() { BranchCode = "PAYMENT", BranchName = "Thu tiền", DisplayOrder = 1, IsActive = true },
            new() { BranchCode = "REEXAM", BranchName = "Khám lại", DisplayOrder = 2, IsActive = true },
            new() { BranchCode = "EXIT", BranchName = "Ra về", DisplayOrder = 3, IsActive = true }
        };
        await context.PostProcessBranches.AddRangeAsync(branches);
        await context.SaveChangesAsync();

        // Seed Priority Settings (default: Strict for all)
        var prioritySettings = new List<PrioritySetting>
        {
            new() { ServiceId = null, RoomId = null, Strategy = PriorityStrategy.Strict, InterleaveInterval = 5, IsActive = true }
        };
        await context.PrioritySettings.AddRangeAsync(prioritySettings);
        await context.SaveChangesAsync();

        // Seed Users
        var users = new List<User>
        {
            // Admin
            new() { Username = "admin", PasswordHash = HashPassword("admin123"), FullName = "Administrator", Role = UserRole.Admin, IsActive = true },
            
            // Doctors for each room
            new() { Username = "bs.xn1", PasswordHash = HashPassword("123456"), FullName = "BS. Nguyễn Văn A", Role = UserRole.Doctor, RoomId = rooms[0].RoomId, IsActive = true },
            new() { Username = "bs.xn2", PasswordHash = HashPassword("123456"), FullName = "BS. Trần Thị B", Role = UserRole.Doctor, RoomId = rooms[1].RoomId, IsActive = true },
            new() { Username = "bs.xn3", PasswordHash = HashPassword("123456"), FullName = "BS. Lê Văn C", Role = UserRole.Doctor, RoomId = rooms[2].RoomId, IsActive = true },
            new() { Username = "bs.sa1", PasswordHash = HashPassword("123456"), FullName = "BS. Phạm Thị D", Role = UserRole.Doctor, RoomId = rooms[3].RoomId, IsActive = true },
            new() { Username = "bs.sa2", PasswordHash = HashPassword("123456"), FullName = "BS. Hoàng Văn E", Role = UserRole.Doctor, RoomId = rooms[4].RoomId, IsActive = true },
            new() { Username = "bs.kn1", PasswordHash = HashPassword("123456"), FullName = "BS. Vũ Thị F", Role = UserRole.Doctor, RoomId = rooms[5].RoomId, IsActive = true },
            new() { Username = "bs.kn2", PasswordHash = HashPassword("123456"), FullName = "BS. Đặng Văn G", Role = UserRole.Doctor, RoomId = rooms[6].RoomId, IsActive = true },
            new() { Username = "bs.kn3", PasswordHash = HashPassword("123456"), FullName = "BS. Bùi Thị H", Role = UserRole.Doctor, RoomId = rooms[7].RoomId, IsActive = true },
            new() { Username = "bs.kng1", PasswordHash = HashPassword("123456"), FullName = "BS. Ngô Văn I", Role = UserRole.Doctor, RoomId = rooms[8].RoomId, IsActive = true },
            new() { Username = "bs.kng2", PasswordHash = HashPassword("123456"), FullName = "BS. Dương Thị K", Role = UserRole.Doctor, RoomId = rooms[9].RoomId, IsActive = true },
            
            // Kiosk users
            new() { Username = "kiosk1", PasswordHash = HashPassword("kiosk123"), FullName = "Kiosk Sảnh chính", Role = UserRole.Kiosk, IsActive = true },
            new() { Username = "kiosk2", PasswordHash = HashPassword("kiosk123"), FullName = "Kiosk Khu A", Role = UserRole.Kiosk, IsActive = true },
            
            // Ticket Issuer users
            new() { Username = "nv.quay1", PasswordHash = HashPassword("123456"), FullName = "NV. Nguyễn Thị Lấy Số", Role = UserRole.TicketIssuer, AreaCode = "LOBBY", IsActive = true },
            new() { Username = "nv.quay2", PasswordHash = HashPassword("123456"), FullName = "NV. Trần Văn In Số", Role = UserRole.TicketIssuer, AreaCode = "AREA-A", IsActive = true },

            // TV users
            new() { Username = "tv1", PasswordHash = HashPassword("tv123"), FullName = "TV Sảnh chính", Role = UserRole.TV, IsActive = true },
            new() { Username = "tv2", PasswordHash = HashPassword("tv123"), FullName = "TV Khu XN", Role = UserRole.TV, IsActive = true }
        };
        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();
    }

    private static string HashPassword(string password)
    {
        // Simple hash for demo - in production use BCrypt or similar
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var bytes = System.Text.Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
