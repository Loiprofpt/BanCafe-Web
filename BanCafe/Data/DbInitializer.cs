using System;
using System.Data.SqlClient;

namespace BanCafe.Data
{
    public static class DbInitializer
    {
        public static void SeedData()
        {
            try
            {
                SeedSettings();
                SeedProducts();
                SeedBlogs();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Data seeding failed: " + ex.Message);
                throw;
            }
        }

        private static void SeedSettings()
        {
            string query = "SELECT COUNT(*) FROM [dbo].[Settings]";
            int count = (int)DatabaseHelper.ExecuteScalar(query);
            if (count == 0)
            {
                string insertQuery = @"
                    INSERT INTO [dbo].[Settings] ([SettingKey], [SettingValue], [Description]) VALUES
                    ('AdminUsername', 'admin@pureva.com', 'Tài khoản đăng nhập trang quản trị'),
                    ('AdminPassword', 'Admin@123', 'Mật khẩu đăng nhập trang quản trị (Plaintext cho demo)'),
                    ('SeoTitle', N'Pureva Coffee - Cà phê hữu cơ đặc sản từ Lâm Đồng', 'Tiêu đề SEO mặc định của trang web'),
                    ('SeoDescription', N'Pureva chuyên cung cấp hạt cà phê Arabica, Robusta hữu cơ canh tác tự nhiên tại Lâm Đồng, chất lượng tuyệt hảo và thân thiện môi trường.', 'Mô tả SEO mặc định'),
                    ('ContactPhone', '0901 234 567', 'Số điện thoại liên hệ hotline'),
                    ('ContactEmail', 'contact@purevacraft.vn', 'Email hỗ trợ khách hàng'),
                    ('ContactAddress', N'Dốc Di Linh, Huyện Di Linh, Tỉnh Lâm Đồng, Việt Nam', 'Địa chỉ văn phòng / nông trại')";

                DatabaseHelper.ExecuteNonQuery(insertQuery);
            }
            else
            {
                // Auto-fix for existing databases that were seeded without N prefix (corrupt characters shown as '?')
                string checkQuery = "SELECT SettingValue FROM [dbo].[Settings] WHERE SettingKey = 'SeoDescription'";
                string descValue = DatabaseHelper.ExecuteScalar(checkQuery)?.ToString();
                if (descValue != null && descValue.Contains("?"))
                {
                    string fixQuery = @"
                        UPDATE [dbo].[Settings] SET SettingValue = N'Pureva Coffee - Cà phê hữu cơ đặc sản từ Lâm Đồng' WHERE SettingKey = 'SeoTitle';
                        UPDATE [dbo].[Settings] SET SettingValue = N'Pureva chuyên cung cấp hạt cà phê Arabica, Robusta hữu cơ canh tác tự nhiên tại Lâm Đồng, chất lượng tuyệt hảo và thân thiện môi trường.' WHERE SettingKey = 'SeoDescription';";
                    DatabaseHelper.ExecuteNonQuery(fixQuery);
                }
            }
        }

        private static void SeedProducts()
        {
            string query = "SELECT COUNT(*) FROM [dbo].[Products]";
            int count = (int)DatabaseHelper.ExecuteScalar(query);
            if (count == 0)
            {
                string insertQuery = @"
                    INSERT INTO [dbo].[Products] ([Name], [Price], [Unit], [Description], [ImageUrl], [RoastOptions], [IsActive]) VALUES
                    (N'Arabica Cầu Đất Organic', 220000, N'250g', N'Hạt cà phê Arabica thượng hạng được thu hoạch từ vùng cao Cầu Đất (Đà Lạt). Vị chua thanh tao, hậu ngọt sâu sắc xen lẫn hương hoa quả tự nhiên.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800', 'Light,Medium,Dark', 1),
                    (N'Robusta Honey Di Linh', 180000, N'250g', N'Cà phê Robusta được chế biến theo phương pháp Honey (mật ong) từ nông trại Di Linh. Hương vị đậm đà, hậu vị sô-cô-la ngọt ngào, đắng dịu êm ái.', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800', 'Medium,Dark', 1),
                    (N'Liberica Bảo Lộc Rare', 260000, N'250g', N'Hạt cà phê Liberica (cà phê mít) cực kỳ quý hiếm từ Bảo Lộc. Có mùi thơm nồng nàn của quả chín và vị chua ngọt rất độc đáo, phù hợp cho người sành cà phê.', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800', 'Light,Medium', 1),
                    (N'Pureva Special Blend', 195000, N'250g', N'Sự kết hợp hoàn hảo theo tỷ lệ vàng giữa Arabica chua thanh và Robusta Honey đậm đà. Đem lại ly cà phê cân bằng tuyệt vời, lý tưởng để khởi đầu ngày mới.', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800', 'Medium,Dark', 1)";

                DatabaseHelper.ExecuteNonQuery(insertQuery);
            }
        }

        private static void SeedBlogs()
        {
            string query = "SELECT COUNT(*) FROM [dbo].[Blogs]";
            int count = (int)DatabaseHelper.ExecuteScalar(query);
            if (count == 0)
            {
                string insertQuery = @"
                    INSERT INTO [dbo].[Blogs] ([Title], [Slug], [Summary], [Content], [ImageUrl], [PublishedAt], [IsVideo], [VideoUrl], [IsActive]) VALUES
                    (N'Hành trình từ nông trại hữu cơ đến ly cà phê đặc sản', 'hanh-trinh-ca-phe-huu-co', N'Khám phá quy trình trồng trọt khép kín không hóa chất của Pureva tại vùng cao Lâm Đồng, mang lại hạt cà phê tinh khiết nhất.', N'Tại nông trại Pureva Coffee ở Lâm Đồng, chúng tôi bắt đầu từ việc chọn giống tốt nhất, nuôi dưỡng đất bằng phân hữu cơ sinh học, và tưới nguồn nước suối trong lành tự nhiên. Từng hạt cà phê chín đỏ mọng được thu hái thủ công 100% để đảm bảo độ đồng đều cao nhất. Tiếp đến là công nghệ phơi trên giàn lưới nhà kính giúp hạt cà phê phát triển hương vị đầy đủ mà không bị ẩm mốc. Mỗi cốc cà phê bạn thưởng thức đều mang trong mình cả tâm huyết của người nông dân Việt.', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800', GETDATE(), 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1),
                    (N'Cách phân biệt Arabica và Robusta chuẩn xác nhất', 'phan-biet-arabica-va-robusta', N'Bạn là người thích vị chua thanh hay đắng đậm? Cùng tìm hiểu sự kết hợp khác biệt cơ bản giữa hai dòng cà phê phổ biến nhất.', N'Arabica và Robusta là hai loại cà phê phổ biến nhất trên thế giới nhưng chúng mang những đặc điểm hoàn toàn khác biệt. Arabica ưa sống ở độ cao trên 1500m, hạt hình bầu dục dài, chứa lượng caffeine thấp (khoảng 1.5%) nhưng giàu axit hữu cơ, đem lại vị chua thanh, hương hoa quả thơm ngát. Ngược lại, Robusta sống ở độ cao thấp hơn dưới 800m, hạt tròn hơn, lượng caffeine gấp đôi (khoảng 2.7%), mang đến vị đắng đậm đà, ngậy béo. Tùy gu thưởng thức mà bạn có thể chọn dòng cà phê phù hợp.', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800', GETDATE(), 0, NULL, 1),
                    (N'Nghệ thuật rang cà phê thủ công: Đánh thức hương vị ẩn giấu', 'nghe-thuat-rang-thu-cong', N'Rang cà phê là sự kết hợp giữa khoa học nhiệt độ và cảm quan nghệ thuật để giải phóng tinh chất hương vị.', N'Một hạt cà phê xanh hầu như không có hương vị gì đặc biệt. Chỉ có qua quá trình rang, dưới tác động của nhiệt độ thích hợp, các phản ứng hóa học (như phản ứng Maillard hay Caramel hóa) mới diễn ra để tạo ra hàng trăm hợp chất hương thơm đặc trưng. Người thợ rang tại Pureva phải theo dõi sát sao từng tiếng nổ của hạt cà phê (crack), ngửi mùi khói, và quan sát màu sắc hạt thay đổi liên tục để quyết định thời điểm xả mẻ rang phù hợp nhất cho từng profile Light, Medium hay Dark.', 'https://images.unsplash.com/photo-1524350876685-274059332603?q=80&w=800', GETDATE(), 0, NULL, 1)";

                DatabaseHelper.ExecuteNonQuery(insertQuery);
            }
        }
    }
}
