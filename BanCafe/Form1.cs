using System;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using BanCafe.Data;

namespace BanCafe
{
    public partial class Form1 : Form
    {
        private WebView2 webView;

        public Form1()
        {
            InitializeComponent();

            this.Text = "Pureva Craft - Hệ Thống Quản Lý Cà Phê Hữu Cơ";
            this.Width = 1200;
            this.Height = 800;
            this.StartPosition = FormStartPosition.CenterScreen;

            InitializeWebView();
        }

        private async void InitializeWebView()
        {
            webView = new WebView2();
            webView.Dock = DockStyle.Fill;
            this.Controls.Add(webView);

            try
            {
                await webView.EnsureCoreWebView2Async(null);

                string wwwrootPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot");
                if (!Directory.Exists(wwwrootPath))
                {
                    Directory.CreateDirectory(wwwrootPath);
                }

                webView.CoreWebView2.SetVirtualHostNameToFolderMapping("pureva.local", wwwrootPath, CoreWebView2HostResourceAccessKind.Allow);
                webView.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceived;

                webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
                webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;

                webView.CoreWebView2.Navigate("http://pureva.local/index.html");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Lỗi khởi tạo trình duyệt WebView2: " + ex.Message, "Lỗi", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void CoreWebView2_WebMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                string messageJson = e.WebMessageAsJson;
                if (string.IsNullOrEmpty(messageJson)) return;

                var msg = JsonConvert.DeserializeObject<JObject>(messageJson);
                string action = msg["action"]?.ToString();

                if (string.IsNullOrEmpty(action)) return;

                switch (action)
                {
                    case "getSettings":
                        HandleGetSettings();
                        break;
                    case "getProducts":
                        HandleGetProducts();
                        break;
                    case "getBlogs":
                        HandleGetBlogs();
                        break;
                    case "getAdminData":
                        HandleGetAdminData();
                        break;
                    case "loginAdmin":
                        HandleLoginAdmin(msg);
                        break;
                    case "checkout":
                        HandleCheckout(msg);
                        break;
                    case "submitDesign":
                        HandleSubmitDesign(msg);
                        break;
                    case "submitContact":
                        SendJsonMessage(new { action = "checkoutResponse", success = true });
                        break;
                    case "updateOrderStatus":
                        HandleUpdateOrderStatus(msg);
                        break;
                    case "deleteOrder":
                        HandleDeleteOrder(msg);
                        break;
                    case "updateDesignStatus":
                        HandleUpdateDesignStatus(msg);
                        break;
                    case "deleteDesign":
                        HandleDeleteDesign(msg);
                        break;
                    case "saveProduct":
                        HandleSaveProduct(msg);
                        break;
                    case "deleteProduct":
                        HandleDeleteProduct(msg);
                        break;
                    case "saveBlog":
                        HandleSaveBlog(msg);
                        break;
                    case "deleteBlog":
                        HandleDeleteBlog(msg);
                        break;
                    case "saveSettings":
                        HandleSaveSettings(msg);
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error handling WebView message: " + ex.ToString());
            }
        }

        private void SendJsonMessage(object obj)
        {
            string json = JsonConvert.SerializeObject(obj);
            webView.CoreWebView2.PostWebMessageAsJson(json);
        }

        private void HandleGetSettings()
        {
            DataTable dt = DatabaseHelper.GetDataTable("SELECT * FROM Settings");
            SendJsonMessage(new { action = "getSettingsResponse", settings = dt });
        }

        private void HandleGetProducts()
        {
            DataTable dt = DatabaseHelper.GetDataTable("SELECT * FROM Products WHERE IsActive = 1");
            SendJsonMessage(new { action = "getProductsResponse", products = dt });
        }

        private void HandleGetBlogs()
        {
            DataTable dt = DatabaseHelper.GetDataTable("SELECT * FROM Blogs WHERE IsActive = 1 ORDER BY PublishedAt DESC");
            SendJsonMessage(new { action = "getBlogsResponse", blogs = dt });
        }

        private void HandleGetAdminData()
        {
            DataTable orders = DatabaseHelper.GetDataTable("SELECT * FROM Orders ORDER BY CreatedAt DESC");
            DataTable designs = DatabaseHelper.GetDataTable("SELECT * FROM CustomDesigns ORDER BY CreatedAt DESC");
            DataTable settings = DatabaseHelper.GetDataTable("SELECT * FROM Settings");
            DataTable products = DatabaseHelper.GetDataTable("SELECT * FROM Products");
            DataTable blogs = DatabaseHelper.GetDataTable("SELECT * FROM Blogs ORDER BY PublishedAt DESC");

            SendJsonMessage(new
            {
                action = "getAdminDataResponse",
                orders = orders,
                designs = designs,
                settings = settings,
                products = products,
                blogs = blogs
            });
        }

        private void HandleLoginAdmin(JObject msg)
        {
            string username = msg["username"]?.ToString();
            string password = msg["password"]?.ToString();

            string userDb = DatabaseHelper.ExecuteScalar("SELECT SettingValue FROM Settings WHERE SettingKey = 'AdminUsername'")?.ToString();
            string passDb = DatabaseHelper.ExecuteScalar("SELECT SettingValue FROM Settings WHERE SettingKey = 'AdminPassword'")?.ToString();

            bool success = (username == userDb && password == passDb);
            SendJsonMessage(new { action = "adminLoginResponse", success = success });
        }

        private void HandleCheckout(JObject msg)
        {
            try
            {
                string customerName = msg["customerName"]?.ToString();
                string customerPhone = msg["customerPhone"]?.ToString();
                string customerEmail = msg["customerEmail"]?.ToString();
                string shippingAddress = msg["shippingAddress"]?.ToString();
                decimal totalAmount = msg["totalAmount"]?.ToObject<decimal>() ?? 0;

                string insertOrderQuery = @"
                    INSERT INTO [dbo].[Orders] (CustomerName, CustomerPhone, CustomerEmail, ShippingAddress, TotalAmount, Status, CreatedAt)
                    VALUES (@Name, @Phone, @Email, @Address, @Total, 'Pending', GETDATE());
                    SELECT SCOPE_IDENTITY();";

                SqlParameter[] orderParams = new SqlParameter[]
                {
                    new SqlParameter("@Name", customerName),
                    new SqlParameter("@Phone", customerPhone),
                    new SqlParameter("@Email", customerEmail),
                    new SqlParameter("@Address", shippingAddress),
                    new SqlParameter("@Total", totalAmount)
                };

                object orderIdObj = DatabaseHelper.ExecuteScalar(insertOrderQuery, orderParams);
                int orderId = Convert.ToInt32(orderIdObj);

                JArray items = (JArray)msg["items"];
                foreach (var item in items)
                {
                    int productId = item["id"]?.ToObject<int>() ?? 0;
                    string roastLevel = item["roastLevel"]?.ToString();
                    int quantity = item["quantity"]?.ToObject<int>() ?? 1;
                    decimal price = item["price"]?.ToObject<decimal>() ?? 0;

                    string insertItemQuery = @"
                        INSERT INTO [dbo].[OrderItems] (OrderId, ProductId, RoastLevel, Quantity, Price)
                        VALUES (@OrderId, @ProductId, @Roast, @Qty, @Price)";

                    SqlParameter[] itemParams = new SqlParameter[]
                    {
                        new SqlParameter("@OrderId", orderId),
                        new SqlParameter("@ProductId", productId),
                        new SqlParameter("@Roast", roastLevel ?? (object)DBNull.Value),
                        new SqlParameter("@Qty", quantity),
                        new SqlParameter("@Price", price)
                    };

                    DatabaseHelper.ExecuteNonQuery(insertItemQuery, itemParams);
                }

                SendJsonMessage(new { action = "checkoutResponse", success = true });
            }
            catch (Exception ex)
            {
                SendJsonMessage(new { action = "checkoutResponse", success = false, message = ex.Message });
            }
        }

        private void HandleSubmitDesign(JObject msg)
        {
            try
            {
                string customerName = msg["customerName"]?.ToString();
                string customerEmail = msg["customerEmail"]?.ToString();
                string customerPhone = msg["customerPhone"]?.ToString();
                string description = msg["description"]?.ToString();
                string fileName = msg["fileName"]?.ToString();
                string fileBase64 = msg["fileBase64"]?.ToString();

                string fileUrl = "";

                if (!string.IsNullOrEmpty(fileName) && !string.IsNullOrEmpty(fileBase64))
                {
                    string uploadsDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "uploads");
                    if (!Directory.Exists(uploadsDir))
                    {
                        Directory.CreateDirectory(uploadsDir);
                    }

                    string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(fileName);
                    string filePath = Path.Combine(uploadsDir, uniqueFileName);

                    byte[] fileBytes = Convert.FromBase64String(fileBase64);
                    File.WriteAllBytes(filePath, fileBytes);

                    fileUrl = "http://pureva.local/uploads/" + uniqueFileName;
                }

                string insertDesignQuery = @"
                    INSERT INTO [dbo].[CustomDesigns] (CustomerName, CustomerEmail, CustomerPhone, Description, DesignFileUrl, Status, CreatedAt)
                    VALUES (@Name, @Email, @Phone, @Desc, @Url, 'Pending', GETDATE())";

                SqlParameter[] designParams = new SqlParameter[]
                {
                    new SqlParameter("@Name", customerName),
                    new SqlParameter("@Email", customerEmail),
                    new SqlParameter("@Phone", customerPhone),
                    new SqlParameter("@Desc", description ?? (object)DBNull.Value),
                    new SqlParameter("@Url", fileUrl ?? (object)DBNull.Value)
                };

                DatabaseHelper.ExecuteNonQuery(insertDesignQuery, designParams);

                SendJsonMessage(new { action = "submitDesignResponse", success = true });
            }
            catch (Exception ex)
            {
                SendJsonMessage(new { action = "submitDesignResponse", success = false, message = ex.Message });
            }
        }

        private void HandleUpdateOrderStatus(JObject msg)
        {
            try
            {
                int id = msg["id"]?.ToObject<int>() ?? 0;
                string status = msg["status"]?.ToString();

                string query = "UPDATE [dbo].[Orders] SET Status = @Status WHERE Id = @Id";
                SqlParameter[] parameters = new SqlParameter[]
                {
                    new SqlParameter("@Status", status),
                    new SqlParameter("@Id", id)
                };

                DatabaseHelper.ExecuteNonQuery(query, parameters);
                SendJsonMessage(new { action = "crudResponse", success = true });
            }
            catch (Exception ex)
            {
                SendJsonMessage(new { action = "crudResponse", success = false, message = ex.Message });
            }
        }

        private void HandleDeleteOrder(JObject msg)
        {
            try
            {
                int id = msg["id"]?.ToObject<int>() ?? 0;

                string query = "DELETE FROM [dbo].[Orders] WHERE Id = @Id";
                SqlParameter[] parameters = new SqlParameter[]
                {
                    new SqlParameter("@Id", id)
                };

                DatabaseHelper.ExecuteNonQuery(query, parameters);
                SendJsonMessage(new { action = "crudResponse", success = true });
            }
            catch (Exception ex)
            {
                SendJsonMessage(new { action = "crudResponse", success = false, message = ex.Message });
            }
        }

        private void HandleUpdateDesignStatus(JObject msg)
        {
            try
            {
                int id = msg["id"]?.ToObject<int>() ?? 0;
                string status = msg["status"]?.ToString();

                string query = "UPDATE [dbo].[CustomDesigns] SET Status = @Status WHERE Id = @Id";
                SqlParameter[] parameters = new SqlParameter[]
                {
                    new SqlParameter("@Status", status),
                    new SqlParameter("@Id", id)
                };

                DatabaseHelper.ExecuteNonQuery(query, parameters);
                SendJsonMessage(new { action = "crudResponse", success = true });
            }
            catch (Exception ex)
            {
                SendJsonMessage(new { action = "crudResponse", success = false, message = ex.Message });
            }
        }

        private void HandleDeleteDesign(JObject msg)
        {
            try
            {
                int id = msg["id"]?.ToObject<int>() ?? 0;

                string query = "DELETE FROM [dbo].[CustomDesigns] WHERE Id = @Id";
                SqlParameter[] parameters = new SqlParameter[]
                {
                    new SqlParameter("@Id", id)
                };

                DatabaseHelper.ExecuteNonQuery(query, parameters);
                SendJsonMessage(new { action = "crudResponse", success = true });
            }
            catch (Exception ex)
            {
                SendJsonMessage(new { action = "crudResponse", success = false, message = ex.Message });
            }
        }

        private void HandleSaveProduct(JObject msg)
        {
            try
            {
                JToken idObj = msg["id"];
                int? id = (idObj == null || idObj.Type == JTokenType.Null) ? (int?)null : idObj.ToObject<int>();

                string name = msg["name"]?.ToString();
                decimal price = msg["price"]?.ToObject<decimal>() ?? 0;
                string unit = msg["unit"]?.ToString();
                string description = msg["description"]?.ToString();
                string imageUrl = msg["imageUrl"]?.ToString();
                string roastOptions = msg["roastOptions"]?.ToString();

                string imgFileName = msg["imgFileName"]?.ToString();
                string imgFileBase64 = msg["imgFileBase64"]?.ToString();

                if (!string.IsNullOrEmpty(imgFileName) && !string.IsNullOrEmpty(imgFileBase64))
                {
                    string uploadsDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "uploads");
                    if (!Directory.Exists(uploadsDir))
                    {
                        Directory.CreateDirectory(uploadsDir);
                    }

                    string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(imgFileName);
                    string filePath = Path.Combine(uploadsDir, uniqueFileName);

                    byte[] fileBytes = Convert.FromBase64String(imgFileBase64);
                    File.WriteAllBytes(filePath, fileBytes);

                    imageUrl = "http://pureva.local/uploads/" + uniqueFileName;
                }

                if (string.IsNullOrEmpty(imageUrl))
                {
                    imageUrl = "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800";
                }

                if (id.HasValue)
                {
                    string query = @"
                        UPDATE [dbo].[Products] 
                        SET Name = @Name, Price = @Price, Unit = @Unit, Description = @Desc, ImageUrl = @Img, RoastOptions = @Roast
                        WHERE Id = @Id";

                    SqlParameter[] parameters = new SqlParameter[]
                    {
                        new SqlParameter("@Name", name),
                        new SqlParameter("@Price", price),
                        new SqlParameter("@Unit", unit),
                        new SqlParameter("@Desc", description ?? (object)DBNull.Value),
                        new SqlParameter("@Img", imageUrl),
                        new SqlParameter("@Roast", roastOptions ?? (object)DBNull.Value),
                        new SqlParameter("@Id", id.Value)
                    };
                    DatabaseHelper.ExecuteNonQuery(query, parameters);
                }
                else
                {
                    string query = @"
                        INSERT INTO [dbo].[Products] (Name, Price, Unit, Description, ImageUrl, RoastOptions, IsActive)
                        VALUES (@Name, @Price, @Unit, @Desc, @Img, @Roast, 1)";

                    SqlParameter[] parameters = new SqlParameter[]
                    {
                        new SqlParameter("@Name", name),
                        new SqlParameter("@Price", price),
                        new SqlParameter("@Unit", unit),
                        new SqlParameter("@Desc", description ?? (object)DBNull.Value),
                        new SqlParameter("@Img", imageUrl),
                        new SqlParameter("@Roast", roastOptions ?? (object)DBNull.Value)
                    };
                    DatabaseHelper.ExecuteNonQuery(query, parameters);
                }

                SendJsonMessage(new { action = "crudResponse", success = true });
            }
            catch (Exception ex)
            {
                SendJsonMessage(new { action = "crudResponse", success = false, message = ex.Message });
            }
        }

        private void HandleDeleteProduct(JObject msg)
        {
            try
            {
                int id = msg["id"]?.ToObject<int>() ?? 0;

                // Check if product has orders
                object countObj = DatabaseHelper.ExecuteScalar(
                    "SELECT COUNT(*) FROM [dbo].[OrderItems] WHERE ProductId = @Id",
                    new SqlParameter("@Id", id)
                );
                int count = Convert.ToInt32(countObj);

                if (count > 0)
                {
                    // Soft delete
                    string query = "UPDATE [dbo].[Products] SET IsActive = 0 WHERE Id = @Id";
                    DatabaseHelper.ExecuteNonQuery(query, new SqlParameter("@Id", id));
                    SendJsonMessage(new { action = "crudResponse", success = true, message = "Sản phẩm đã có đơn hàng nên hệ thống chuyển thành ngưng hoạt động (Ẩn khỏi cửa hàng)." });
                }
                else
                {
                    // Hard delete
                    string query = "DELETE FROM [dbo].[Products] WHERE Id = @Id";
                    DatabaseHelper.ExecuteNonQuery(query, new SqlParameter("@Id", id));
                    SendJsonMessage(new { action = "crudResponse", success = true });
                }
            }
            catch (Exception ex)
            {
                SendJsonMessage(new { action = "crudResponse", success = false, message = ex.Message });
            }
        }

        private void HandleSaveBlog(JObject msg)
        {
            try
            {
                JToken idObj = msg["id"];
                int? id = (idObj == null || idObj.Type == JTokenType.Null) ? (int?)null : idObj.ToObject<int>();

                string title = msg["title"]?.ToString();
                string slug = msg["slug"]?.ToString();
                string summary = msg["summary"]?.ToString();
                string content = msg["content"]?.ToString();
                string imageUrl = msg["imageUrl"]?.ToString();
                bool isVideo = msg["isVideo"]?.ToObject<bool>() ?? false;
                string videoUrl = msg["videoUrl"]?.ToString();

                string imgFileName = msg["imgFileName"]?.ToString();
                string imgFileBase64 = msg["imgFileBase64"]?.ToString();

                string vidFileName = msg["vidFileName"]?.ToString();
                string vidFileBase64 = msg["vidFileBase64"]?.ToString();

                string uploadsDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "uploads");

                // Save image file if uploaded
                if (!string.IsNullOrEmpty(imgFileName) && !string.IsNullOrEmpty(imgFileBase64))
                {
                    if (!Directory.Exists(uploadsDir))
                    {
                        Directory.CreateDirectory(uploadsDir);
                    }

                    string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(imgFileName);
                    string filePath = Path.Combine(uploadsDir, uniqueFileName);

                    byte[] fileBytes = Convert.FromBase64String(imgFileBase64);
                    File.WriteAllBytes(filePath, fileBytes);

                    imageUrl = "http://pureva.local/uploads/" + uniqueFileName;
                }

                // Save video file if uploaded
                if (isVideo && !string.IsNullOrEmpty(vidFileName) && !string.IsNullOrEmpty(vidFileBase64))
                {
                    if (!Directory.Exists(uploadsDir))
                    {
                        Directory.CreateDirectory(uploadsDir);
                    }

                    string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(vidFileName);
                    string filePath = Path.Combine(uploadsDir, uniqueFileName);

                    byte[] fileBytes = Convert.FromBase64String(vidFileBase64);
                    File.WriteAllBytes(filePath, fileBytes);

                    videoUrl = "http://pureva.local/uploads/" + uniqueFileName;
                }

                if (string.IsNullOrEmpty(imageUrl))
                {
                    imageUrl = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800";
                }

                if (id.HasValue)
                {
                    string query = @"
                        UPDATE [dbo].[Blogs] 
                        SET Title = @Title, Slug = @Slug, Summary = @Summary, Content = @Content, ImageUrl = @Img, IsVideo = @IsVideo, VideoUrl = @VidUrl
                        WHERE Id = @Id";

                    SqlParameter[] parameters = new SqlParameter[]
                    {
                        new SqlParameter("@Title", title),
                        new SqlParameter("@Slug", slug),
                        new SqlParameter("@Summary", summary ?? (object)DBNull.Value),
                        new SqlParameter("@Content", content ?? (object)DBNull.Value),
                        new SqlParameter("@Img", imageUrl),
                        new SqlParameter("@IsVideo", isVideo),
                        new SqlParameter("@VidUrl", videoUrl ?? (object)DBNull.Value),
                        new SqlParameter("@Id", id.Value)
                    };
                    DatabaseHelper.ExecuteNonQuery(query, parameters);
                }
                else
                {
                    string query = @"
                        INSERT INTO [dbo].[Blogs] (Title, Slug, Summary, Content, ImageUrl, PublishedAt, IsVideo, VideoUrl, IsActive)
                        VALUES (@Title, @Slug, @Summary, @Content, @Img, GETDATE(), @IsVideo, @VidUrl, 1)";

                    SqlParameter[] parameters = new SqlParameter[]
                    {
                        new SqlParameter("@Title", title),
                        new SqlParameter("@Slug", slug),
                        new SqlParameter("@Summary", summary ?? (object)DBNull.Value),
                        new SqlParameter("@Content", content ?? (object)DBNull.Value),
                        new SqlParameter("@Img", imageUrl),
                        new SqlParameter("@IsVideo", isVideo),
                        new SqlParameter("@VidUrl", videoUrl ?? (object)DBNull.Value)
                    };
                    DatabaseHelper.ExecuteNonQuery(query, parameters);
                }

                SendJsonMessage(new { action = "crudResponse", success = true });
            }
            catch (Exception ex)
            {
                SendJsonMessage(new { action = "crudResponse", success = false, message = ex.Message });
            }
        }

        private void HandleDeleteBlog(JObject msg)
        {
            try
            {
                int id = msg["id"]?.ToObject<int>() ?? 0;

                string query = "DELETE FROM [dbo].[Blogs] WHERE Id = @Id";
                SqlParameter[] parameters = new SqlParameter[]
                {
                    new SqlParameter("@Id", id)
                };

                DatabaseHelper.ExecuteNonQuery(query, parameters);
                SendJsonMessage(new { action = "crudResponse", success = true });
            }
            catch (Exception ex)
            {
                SendJsonMessage(new { action = "crudResponse", success = false, message = ex.Message });
            }
        }

        private void HandleSaveSettings(JObject msg)
        {
            try
            {
                string seoTitle = msg["seoTitle"]?.ToString();
                string seoDescription = msg["seoDescription"]?.ToString();
                string phone = msg["phone"]?.ToString();
                string email = msg["email"]?.ToString();
                string address = msg["address"]?.ToString();

                string query = "UPDATE [dbo].[Settings] SET SettingValue = @Value WHERE SettingKey = @Key";

                DatabaseHelper.ExecuteNonQuery(query, new SqlParameter[] { new SqlParameter("@Value", seoTitle), new SqlParameter("@Key", "SeoTitle") });
                DatabaseHelper.ExecuteNonQuery(query, new SqlParameter[] { new SqlParameter("@Value", seoDescription), new SqlParameter("@Key", "SeoDescription") });
                DatabaseHelper.ExecuteNonQuery(query, new SqlParameter[] { new SqlParameter("@Value", phone), new SqlParameter("@Key", "ContactPhone") });
                DatabaseHelper.ExecuteNonQuery(query, new SqlParameter[] { new SqlParameter("@Value", email), new SqlParameter("@Key", "ContactEmail") });
                DatabaseHelper.ExecuteNonQuery(query, new SqlParameter[] { new SqlParameter("@Value", address), new SqlParameter("@Key", "ContactAddress") });

                SendJsonMessage(new { action = "crudResponse", success = true });
            }
            catch (Exception ex)
            {
                SendJsonMessage(new { action = "crudResponse", success = false, message = ex.Message });
            }
        }
    }
}
