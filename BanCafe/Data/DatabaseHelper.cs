using System;
using System.Data;
using System.Data.SqlClient;

namespace BanCafe.Data
{
    public static class DatabaseHelper
    {
        // Connection string to the specific database
        private static readonly string DbName = "BanCafeDb";
        private static readonly string MasterConnectionString = @"Server=(localdb)\MSSQLLocalDB;Database=master;Trusted_Connection=True;Connect Timeout=30;";
        private static readonly string ConnectionString = $@"Server=(localdb)\MSSQLLocalDB;Database={DbName};Trusted_Connection=True;Connect Timeout=30;";

        public static string GetConnectionString()
        {
            return ConnectionString;
        }

        // Initialize the database: create it if it doesn't exist, and setup tables
        public static void InitializeDatabase()
        {
            try
            {
                // 1. Create database if not exists
                CreateDatabaseIfNotExists();

                // 2. Create tables
                CreateTables();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Database initialization failed: " + ex.Message);
                throw;
            }
        }

        private static void CreateDatabaseIfNotExists()
        {
            using (var conn = new SqlConnection(MasterConnectionString))
            {
                conn.Open();
                string checkDbQuery = $"SELECT database_id FROM sys.databases WHERE name = '{DbName}'";
                using (var cmd = new SqlCommand(checkDbQuery, conn))
                {
                    var result = cmd.ExecuteScalar();
                    if (result == null || result == DBNull.Value)
                    {
                        // Database does not exist, create it
                        string createDbQuery = $"CREATE DATABASE [{DbName}]";
                        using (var createCmd = new SqlCommand(createDbQuery, conn))
                        {
                            createCmd.ExecuteNonQuery();
                        }
                    }
                }
            }
        }

        private static void CreateTables()
        {
            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();

                // Table: Products
                string productsTable = @"
                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[Products] (
                            [Id] INT IDENTITY(1,1) PRIMARY KEY,
                            [Name] NVARCHAR(100) NOT NULL,
                            [Price] DECIMAL(18,2) NOT NULL,
                            [Unit] NVARCHAR(50) NOT NULL,
                            [Description] NVARCHAR(MAX) NULL,
                            [ImageUrl] NVARCHAR(255) NULL,
                            [RoastOptions] NVARCHAR(100) NULL,
                            [IsActive] BIT NOT NULL DEFAULT 1
                        )
                    END";

                // Table: Orders
                string ordersTable = @"
                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[Orders] (
                            [Id] INT IDENTITY(1,1) PRIMARY KEY,
                            [CustomerName] NVARCHAR(100) NOT NULL,
                            [CustomerEmail] NVARCHAR(100) NOT NULL,
                            [CustomerPhone] NVARCHAR(20) NOT NULL,
                            [ShippingAddress] NVARCHAR(255) NOT NULL,
                            [TotalAmount] DECIMAL(18,2) NOT NULL,
                            [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
                            [Status] NVARCHAR(50) NOT NULL DEFAULT 'Pending'
                        )
                    END";

                // Table: OrderItems
                string orderItemsTable = @"
                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[OrderItems]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[OrderItems] (
                            [Id] INT IDENTITY(1,1) PRIMARY KEY,
                            [OrderId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Orders]([Id]) ON DELETE CASCADE,
                            [ProductId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Products]([Id]),
                            [RoastLevel] NVARCHAR(50) NULL,
                            [Quantity] INT NOT NULL,
                            [Price] DECIMAL(18,2) NOT NULL
                        )
                    END";

                // Table: CustomDesigns
                string customDesignsTable = @"
                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CustomDesigns]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[CustomDesigns] (
                            [Id] INT IDENTITY(1,1) PRIMARY KEY,
                            [CustomerName] NVARCHAR(100) NOT NULL,
                            [CustomerEmail] NVARCHAR(100) NOT NULL,
                            [CustomerPhone] NVARCHAR(20) NOT NULL,
                            [Description] NVARCHAR(MAX) NULL,
                            [DesignFileUrl] NVARCHAR(255) NULL,
                            [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
                            [Status] NVARCHAR(50) NOT NULL DEFAULT 'Pending'
                        )
                    END";

                // Table: Blogs
                string blogsTable = @"
                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Blogs]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[Blogs] (
                            [Id] INT IDENTITY(1,1) PRIMARY KEY,
                            [Title] NVARCHAR(200) NOT NULL,
                            [Slug] NVARCHAR(200) NOT NULL,
                            [Summary] NVARCHAR(500) NULL,
                            [Content] NVARCHAR(MAX) NULL,
                            [ImageUrl] NVARCHAR(255) NULL,
                            [PublishedAt] DATETIME NOT NULL DEFAULT GETDATE(),
                            [IsVideo] BIT NOT NULL DEFAULT 0,
                            [VideoUrl] NVARCHAR(255) NULL,
                            [IsActive] BIT NOT NULL DEFAULT 1
                        )
                    END";

                // Table: Settings
                string settingsTable = @"
                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Settings]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[Settings] (
                            [SettingKey] NVARCHAR(100) PRIMARY KEY,
                            [SettingValue] NVARCHAR(MAX) NULL,
                            [Description] NVARCHAR(250) NULL
                        )
                    END";

                ExecuteNonQueryInternal(conn, productsTable);
                ExecuteNonQueryInternal(conn, ordersTable);
                ExecuteNonQueryInternal(conn, orderItemsTable);
                ExecuteNonQueryInternal(conn, customDesignsTable);
                ExecuteNonQueryInternal(conn, blogsTable);
                ExecuteNonQueryInternal(conn, settingsTable);
            }
        }

        private static void ExecuteNonQueryInternal(SqlConnection conn, string query)
        {
            using (var cmd = new SqlCommand(query, conn))
            {
                cmd.ExecuteNonQuery();
            }
        }

        // Generic execute non query
        public static int ExecuteNonQuery(string query, SqlParameter[] parameters = null)
        {
            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                using (var cmd = new SqlCommand(query, conn))
                {
                    if (parameters != null)
                    {
                        cmd.Parameters.AddRange(parameters);
                    }
                    return cmd.ExecuteNonQuery();
                }
            }
        }

        // Generic execute scalar
        public static object ExecuteScalar(string query, SqlParameter[] parameters = null)
        {
            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                using (var cmd = new SqlCommand(query, conn))
                {
                    if (parameters != null)
                    {
                        cmd.Parameters.AddRange(parameters);
                    }
                    return cmd.ExecuteScalar();
                }
            }
        }

        // Generic execute reader with action
        public static void ExecuteReader(string query, SqlParameter[] parameters, Action<SqlDataReader> readerAction)
        {
            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                using (var cmd = new SqlCommand(query, conn))
                {
                    if (parameters != null)
                    {
                        cmd.Parameters.AddRange(parameters);
                    }
                    using (var reader = cmd.ExecuteReader())
                    {
                        readerAction(reader);
                    }
                }
            }
        }

        // Generic GetDataTable
        public static DataTable GetDataTable(string query, SqlParameter[] parameters = null)
        {
            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                using (var cmd = new SqlCommand(query, conn))
                {
                    if (parameters != null)
                    {
                        cmd.Parameters.AddRange(parameters);
                    }
                    using (var adapter = new SqlDataAdapter(cmd))
                    {
                        var dt = new DataTable();
                        adapter.Fill(dt);
                        return dt;
                    }
                }
            }
        }
    }
}
