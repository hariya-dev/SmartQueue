using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using QMS.Application.DTOs;
using QMS.Application.Services;
using QRCoder;

namespace QMS.API.Services;

public class PrintService : IPrintService
{
    private const int PrinterPort = 9100;
    private const int TicketWidth = 576; // 80mm printer standard width in dots

    public async Task PrintTicketAsync(IssueTicketResponse ticket, string ipAddress)
    {
        if (string.IsNullOrEmpty(ipAddress)) return;

        try
        {
            // Use a 5-second timeout for the whole print process to avoid hanging
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            
            using var client = new TcpClient();
            var connectTask = client.ConnectAsync(ipAddress, PrinterPort, cts.Token);
            await connectTask;

            if (!client.Connected) return;

            using var stream = client.GetStream();
            
            // 1. Initialize printer
            await stream.WriteAsync(new byte[] { 0x1B, 0x40 }, cts.Token);

            // 2. Build and Send Bitmap Image
            byte[] imageCommands = BuildTicketImageCommands(ticket);
            await stream.WriteAsync(imageCommands, cts.Token);

            // 3. Cut paper and Reset
            await stream.WriteAsync(new byte[] { 0x0A, 0x0A, 0x0A, 0x1D, 0x56, 0x42, 0x00 }, cts.Token);
            await stream.FlushAsync(cts.Token);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PrintService] Critical error printing to {ipAddress}: {ex.Message}");
        }
    }

    private byte[] BuildTicketImageCommands(IssueTicketResponse ticket)
    {
        // Define ticket dimensions (Height auto-calculated or fixed)
        int height = 650;
        using var bitmap = new Bitmap(TicketWidth, height);
        using var g = Graphics.FromImage(bitmap);
        
        g.Clear(Color.White);
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

        var fontBold = new Font("Arial", 24, FontStyle.Bold);
        var fontLarge = new Font("Arial", 80, FontStyle.Bold);
        var fontMedium = new Font("Arial", 18, FontStyle.Bold);
        var fontSmall = new Font("Arial", 14, FontStyle.Regular);
        var brush = Brushes.Black;
        var centerFormat = new StringFormat { Alignment = StringAlignment.Center };

        float y = 20;

        // 1. Header - Hospital Name
        g.DrawString("Queue Management System", fontBold, brush, new RectangleF(0, y, TicketWidth, 50), centerFormat);
        y += 60;

        // 2. Divider
        g.DrawLine(new Pen(Color.Black, 2), 40, y, TicketWidth - 40, y);
        y += 20;

        // 3. Ticket Number
        g.DrawString(ticket.TicketNumber, fontLarge, brush, new RectangleF(0, y, TicketWidth, 120), centerFormat);
        y += 130;

        // 4. Service Name
        g.DrawString(ticket.ServiceName.ToUpper(), fontMedium, brush, new RectangleF(20, y, TicketWidth - 40, 80), centerFormat);
        y += 80;

        // 5. Room Info
        g.DrawString($"PHÒNG: {ticket.RoomName} ({ticket.RoomCode})", fontMedium, brush, new RectangleF(0, y, TicketWidth, 40), centerFormat);
        y += 50;

        // 6. Queue Position
        g.DrawString($"Vị trí chờ: {ticket.QueuePosition}", fontSmall, brush, new RectangleF(0, y, TicketWidth, 30), centerFormat);
        y += 40;

        // 7. Timestamp
        g.DrawString($"Ngày: {DateTime.Now:dd/MM/yyyy HH:mm:ss}", fontSmall, brush, new RectangleF(0, y, TicketWidth, 30), centerFormat);
        y += 50;

        // 8. QR Code (for checking status online or future use)
        try {
            var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode("https://hoanmy.com/saigon/", QRCodeGenerator.ECCLevel.Q);
            var qrCode = new PngByteQRCode(qrCodeData);
            byte[] qrBytes = qrCode.GetGraphic(20);
            using var ms = new MemoryStream(qrBytes);
            using var qrImg = Image.FromStream(ms);
            g.DrawImage(qrImg, (TicketWidth - 150) / 2, y, 150, 150);
            y += 160;
        } catch {}

        // 9. Footer
        g.DrawString("Vui lòng đợi gọi số!", fontSmall, brush, new RectangleF(0, y, TicketWidth, 30), centerFormat);

        return ConvertBitmapToEscPos(bitmap);
    }

    private byte[] ConvertBitmapToEscPos(Bitmap bitmap)
    {
        var list = new List<byte>();
        
        // Use GS v 0 command (Raster bit image)
        // Format: GS v 0 m xL xH yL yH d1...dk
        int widthBytes = (bitmap.Width + 7) / 8;
        int height = bitmap.Height;

        list.AddRange(new byte[] { 0x1D, 0x76, 0x30, 0x00 }); // GS v 0 mode 0
        list.Add((byte)(widthBytes % 256));
        list.Add((byte)(widthBytes / 256));
        list.Add((byte)(height % 256));
        list.Add((byte)(height / 256));

        for (int y = 0; y < height; y++)
        {
            for (int x = 0; x < widthBytes; x++)
            {
                byte b = 0;
                for (int bit = 0; x * 8 + bit < bitmap.Width && bit < 8; bit++)
                {
                    Color pixel = bitmap.GetPixel(x * 8 + bit, y);
                    // Threshold for black (simple)
                    if (pixel.R < 128 || pixel.G < 128 || pixel.B < 128)
                    {
                        b |= (byte)(0x80 >> bit);
                    }
                }
                list.Add(b);
            }
        }

        return list.ToArray();
    }
}
