using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace QMS.Infrastructure.Data;

public class QMSDbContextFactory : IDesignTimeDbContextFactory<QMSDbContext>
{
    public QMSDbContext CreateDbContext(string[] args)
    {
        // Get the directory of the API project to find appsettings.json
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "QMS.API");
        
        // If the above path doesn't exist (e.g. running from root), fallback to current directory
        if (!Directory.Exists(basePath))
        {
            basePath = Directory.GetCurrentDirectory();
        }

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        
        // Fallback for design time if configuration is not found
        if (string.IsNullOrEmpty(connectionString))
        {
            connectionString = "Server=localhost;Port=3305;Database=QMS;User=root;Password=100100;";
        }

        var optionsBuilder = new DbContextOptionsBuilder<QMSDbContext>();
        optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));

        return new QMSDbContext(optionsBuilder.Options);
    }
}