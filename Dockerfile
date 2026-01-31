# Stage 1: Build Frontend (Angular)
FROM node:20-alpine AS build-fe
WORKDIR /app
COPY qms-frontend/package*.json ./
RUN npm install
COPY qms-frontend/ ./
RUN npm run build -- --configuration production

# Stage 2: Build Backend (.NET)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-be
WORKDIR /src
COPY QMS.Backend/QMS.sln ./
COPY QMS.Backend/QMS.API/QMS.API.csproj QMS.API/
COPY QMS.Backend/QMS.Application/QMS.Application.csproj QMS.Application/
COPY QMS.Backend/QMS.Core/QMS.Core.csproj QMS.Core/
COPY QMS.Backend/QMS.Infrastructure/QMS.Infrastructure.csproj QMS.Infrastructure/
RUN dotnet restore QMS.sln

COPY QMS.Backend/ ./
RUN dotnet publish QMS.API/QMS.API.csproj -c Release -o /app/publish

# Stage 3: Final Image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build-be /app/publish .

# Create wwwroot and copy frontend build output
RUN mkdir -p wwwroot
COPY --from=build-fe /app/dist/qms-frontend/browser ./wwwroot/

# Environment variables
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "QMS.API.dll"]
