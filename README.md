# SmartQueue - Hệ thống Quản lý Hàng đợi Thông minh

Hệ thống quản lý hàng đợi cho bệnh viện, phòng khám với tính năng ưu tiên và xen kẽ số.

## 🏥 Tính năng chính

### Quản lý Kiosk
- Phát số tự động theo dịch vụ và phòng khám
- Hỗ trợ số thường và số ưu tiên
- Đếm số in hôm nay
- In số qua máy in nhiệt (TCP/IP)

### Bàn gọi số (Calling Desk)
- Gọi số tiếp theo
- Gọi lại số đã gọi
- Chuyển số sang phòng khác
- Hoàn thành/Bỏ qua/Gọi lại
- Thống kê thời gian chờ và phục vụ

### Quản lý ưu tiên
- **Chế độ Strict**: Số ưu tiên luôn lên đầu hàng đợi
- **Chế độ Interleaved (Xen kẽ)**: Số ưu tiên được chèn vào giữa theo khoảng cách cấu hình (ví dụ: cứ 3 số thường có 1 số ưu tiên)

### Màn hình TV
- Hiển thị số đang gọi và số tiếp theo
- Cập nhật real-time qua SignalR
- Hỗ trợ nhiều cấu hình hiển thị (TV Profile)

### Quản trị Admin
- Quản lý dịch vụ, phòng khám, máy in
- Cấu hình ưu tiên (Priority Settings)
- Lịch sử in ấn
- Cấu hình TV Profile

## 🛠 Công nghệ

| Phần | Công nghệ |
|------|-----------|
| Backend | ASP.NET Core 9.0 (C#) |
| Database | Entity Framework Core + MySQL |
| Frontend | Angular 19 + PrimeNG |
| Real-time | SignalR |
| Desktop App | Tauri 2.0 |
| Printing | Thermal Printer (TCP/IP) |

## 📁 Cấu trúc dự án

```
SmartQueue/
├── QMS.Backend/                    # Backend API
│   ├── QMS.API/                    # Web API Controllers & Services
│   ├── QMS.Application/            # DTOs & Service Interfaces
│   ├── QMS.Core/                   # Entities & Enums
│   └── QMS.Infrastructure/         # Repositories & Database
├── qms-frontend/                   # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/               # Core services, models
│   │   │   ├── features/           # Feature modules
│   │   │   │   ├── admin/
│   │   │   │   ├── calling-desk/
│   │   │   │   ├── kiosk/
│   │   │   │   ├── login/
│   │   │   │   ├── ticket-issuer/
│   │   │   │   └── tv-display/
│   │   │   └── shared/             # Shared components
│   │   ├── assets/
│   │   └── environments/
│   └── src-tauri/                  # Tauri Desktop App
├── docker-compose.yml              # Docker Compose
└── README.md
```

## 🚀 Hướng dẫn cài đặt

### Yêu cầu
- .NET 9.0 SDK
- Node.js 18+
- MySQL 8.0
- Angular CLI 19

### Cấu hình Database

Tạo database MySQL và chạy migrations:

```bash
cd QMS.Backend/QMS.Infrastructure
dotnet ef database update
```

Hoặc sử dụng Docker:

```bash
docker-compose up -d mysql
cd QMS.Backend/QMS.API
dotnet ef database update
```

### Chạy Backend

```bash
cd QMS.Backend/QMS.API
dotnet run
```

Backend chạy tại: `https://localhost:5001` (hoặc `http://localhost:5000`)

### Chạy Frontend

```bash
cd qms-frontend
npm install
npm start
```

Frontend chạy tại: `http://localhost:4200`

### Chạy Desktop App (Tauri)

```bash
cd qms-frontend
npm run tauri dev
```

## ⚙️ Cấu hình

### Environment Variables

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| DB_CONNECTION_STRING | Chuỗi kết nối MySQL | - |
| BACKEND_PORT | Port backend | 5000 |
| FRONTEND_PORT | Port frontend | 8080 |

### Priority Settings (Cấu hình ưu tiên)

```
Strategy: Strict | Interleaved
InterleaveInterval: số lượng số thường giữa các số ưu tiên (mặc định: 5)
```

**Ví dụ Xen kẽ (N=3):**
```
Hàng đợi: [1-T, 2-T, 3-UT, 4-T, 5-T, 6-UT, 7-T, 8-UT, 9-UT]
```

## 📡 API Endpoints

### Tickets
- `GET /api/tickets/room/{roomId}` - Lấy danh sách số theo phòng
- `POST /api/tickets/issue` - Phát số mới
- `GET /api/tickets/{ticketNumber}` - Lấy thông tin số

### Calling Desk
- `POST /api/calling/call-next/{roomId}` - Gọi số tiếp theo
- `POST /api/calling/call-again/{ticketId}` - Gọi lại số
- `POST /api/calling/complete/{ticketId}` - Hoàn thành số
- `POST /api/calling/skip/{ticketId}` - Bỏ qua số
- `POST /api/calling/transfer` - Chuyển số sang phòng khác

### Statistics
- `GET /api/statistics/daily` - Thống kê trong ngày
- `GET /api/statistics/room/{roomId}` - Thống kê theo phòng

## 🔧 Phát triển

### Tạo Migration mới

```bash
cd QMS.Backend/QMS.API
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Build Frontend cho Production

```bash
cd qms-frontend
npm run build
```

### Docker Deployment

```bash
docker-compose build
docker-compose up -d
```

## 📄 License

MIT License
