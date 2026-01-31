# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["QMS.API/QMS.API.csproj", "QMS.API/"]
COPY ["QMS.Core/QMS.Core.csproj", "QMS.Core/"]
COPY ["QMS.Application/QMS.Application.csproj", "QMS.Application/"]
COPY ["QMS.Infrastructure/QMS.Infrastructure.csproj", "QMS.Infrastructure/"]
RUN dotnet restore "QMS.API/QMS.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/QMS.API"
RUN dotnet build "QMS.API.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "QMS.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Install dependencies for System.Drawing.Common and globalization
RUN apt-get update && apt-get install -y \
    libgdiplus \
    libicu-dev \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "QMS.API.dll"]
