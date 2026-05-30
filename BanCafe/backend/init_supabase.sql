-- 1. Xóa bảng cũ nếu tồn tại (để tránh xung đột)
DROP TABLE IF EXISTS orderitems CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customdesigns CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 2. Tạo bảng Sản phẩm (products)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    description TEXT,
    imageurl VARCHAR(255),
    roastoptions VARCHAR(100),
    isactive BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. Tạo bảng Đơn hàng (orders)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customername VARCHAR(100) NOT NULL,
    customeremail VARCHAR(100) NOT NULL,
    customerphone VARCHAR(20) NOT NULL,
    shippingaddress VARCHAR(255) NOT NULL,
    totalamount DECIMAL(18,2) NOT NULL,
    createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending'
);

-- 4. Tạo bảng Chi tiết đơn hàng (orderitems)
CREATE TABLE orderitems (
    id SERIAL PRIMARY KEY,
    orderid INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    productid INT NOT NULL REFERENCES products(id),
    roastlevel VARCHAR(50),
    quantity INT NOT NULL,
    price DECIMAL(18,2) NOT NULL
);

-- 5. Tạo bảng Yêu cầu thiết kế bao bì (customdesigns)
CREATE TABLE customdesigns (
    id SERIAL PRIMARY KEY,
    customername VARCHAR(100) NOT NULL,
    customeremail VARCHAR(100) NOT NULL,
    customerphone VARCHAR(20) NOT NULL,
    description TEXT,
    designfileurl VARCHAR(255),
    createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending'
);

-- 6. Tạo bảng Tin tức / Nhật ký nông trại (blogs)
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    summary VARCHAR(500),
    content TEXT,
    imageurl VARCHAR(255),
    publishedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    isvideo BOOLEAN NOT NULL DEFAULT FALSE,
    videourl VARCHAR(255),
    isactive BOOLEAN NOT NULL DEFAULT TRUE
);

-- 7. Tạo bảng Cấu hình hệ thống (settings)
CREATE TABLE settings (
    settingkey VARCHAR(100) PRIMARY KEY,
    settingvalue TEXT,
    description VARCHAR(250)
);

-- ==========================================
-- CHÈN DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ==========================================

-- Chèn Cấu hình
INSERT INTO settings (settingkey, settingvalue, description) VALUES
('AdminUsername', 'admin@pureva.com', 'Tài khoản đăng nhập trang quản trị'),
('AdminPassword', 'Admin@123', 'Mật khẩu đăng nhập trang quản trị (Plaintext cho demo)'),
('SeoTitle', 'Pureva Coffee - Cà phê hữu cơ đặc sản từ Lâm Đồng', 'Tiêu đề SEO mặc định của trang web'),
('SeoDescription', 'Pureva chuyên cung cấp hạt cà phê Arabica, Robusta hữu cơ canh tác tự nhiên tại Lâm Đồng, chất lượng tuyệt hảo và thân thiện môi trường.', 'Mô tả SEO mặc định'),
('ContactPhone', '0901 234 567', 'Số điện thoại liên hệ hotline'),
('ContactEmail', 'contact@purevacraft.vn', 'Email hỗ trợ khách hàng'),
('ContactAddress', 'Dốc Di Linh, Huyện Di Linh, Tỉnh Lâm Đồng, Việt Nam', 'Địa chỉ văn phòng / nông trại');

-- Chèn Sản phẩm
INSERT INTO products (name, price, unit, description, imageurl, roastoptions, isactive) VALUES
('Arabica Cầu Đất Organic', 220000, '250g', 'Hạt cà phê Arabica thượng hạng được thu hoạch từ vùng cao Cầu Đất (Đà Lạt). Vị chua thanh tao, hậu ngọt sâu sắc xen lẫn hương hoa quả tự nhiên.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800', 'Light,Medium,Dark', TRUE),
('Robusta Honey Di Linh', 180000, '250g', 'Cà phê Robusta được chế biến theo phương pháp Honey (mật ong) từ nông trại Di Linh. Hương vị đậm đà, hậu vị sô-cô-la ngọt ngào, đắng dịu êm ái.', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800', 'Medium,Dark', TRUE),
('Liberica Bảo Lộc Rare', 260000, '250g', 'Hạt cà phê Liberica (cà phê mít) cực kỳ quý hiếm từ Bảo Lộc. Có mùi thơm nồng nàn của quả chín và vị chua ngọt rất độc đáo, phù hợp cho người sành cà phê.', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800', 'Light,Medium', TRUE),
('Pureva Special Blend', 195000, '250g', 'Sự kết hợp hoàn hảo theo tỷ lệ vàng giữa Arabica chua thanh và Robusta Honey đậm đà. Đem lại ly cà phê cân bằng tuyệt vời, lý tưởng để khởi đầu ngày mới.', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800', 'Medium,Dark', TRUE);

-- Chèn Tin tức / Blogs
INSERT INTO blogs (title, slug, summary, content, imageurl, isvideo, videourl, isactive) VALUES
('Hành trình từ nông trại hữu cơ đến ly cà phê đặc sản', 'hanh-trinh-ca-phe-huu-co', 'Khám phá quy trình trồng trọt khép kín không hóa chất của Pureva tại vùng cao Lâm Đồng, mang lại hạt cà phê tinh khiết nhất.', 'Tại nông trại Pureva Coffee ở Lâm Đồng, chúng tôi bắt đầu từ việc chọn giống tốt nhất, nuôi dưỡng đất bằng phân hữu cơ sinh học, và tưới nguồn nước suối trong lành tự nhiên. Từng hạt cà phê chín đỏ mọng được thu hái thủ công 100% để đảm bảo độ đồng đều cao nhất. Tiếp đến là công nghệ phơi trên giàn lưới nhà kính giúp hạt cà phê phát triển hương vị đầy đủ mà không bị ẩm mốc. Mỗi cốc cà phê bạn thưởng thức đều mang trong mình cả tâm huyết của người nông dân Việt.', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800', TRUE, 'https://www.youtube.com/embed/dQw4w9WgXcQ', TRUE),
('Cách phân biệt Arabica và Robusta chuẩn xác nhất', 'phan-biet-arabica-va-robusta', 'Bạn là người thích vị chua thanh hay đắng đậm? Cùng tìm hiểu sự kết hợp khác biệt cơ bản giữa hai dòng cà phê phổ biến nhất.', 'Arabica và Robusta là hai loại cà phê phổ biến nhất trên thế giới nhưng chúng mang những đặc điểm hoàn toàn khác biệt. Arabica ưa sống ở độ cao trên 1500m, hạt hình bầu dục dài, chứa lượng caffeine thấp (khoảng 1.5%) nhưng giàu axit hữu cơ, đem lại vị chua thanh, hương hoa quả thơm ngát. Ngược lại, Robusta sống ở độ cao thấp hơn dưới 800m, hạt tròn hơn, lượng caffeine gấp đôi (khoảng 2.7%), mang đến vị đắng đậm đà, ngậy béo. Tùy gu thưởng thức mà bạn có thể chọn dòng cà phê phù hợp.', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800', FALSE, NULL, TRUE),
('Nghệ thuật rang cà phê thủ công: Đánh thức hương vị ẩn giấu', 'nghe-thuat-rang-thu-cong', 'Rang cà phê là sự kết hợp giữa khoa học nhiệt độ và cảm quan nghệ thuật để giải phóng tinh chất hương vị.', 'Một hạt cà phê xanh hầu như không có hương vị gì đặc biệt. Chỉ có qua quá trình rang, dưới tác động của nhiệt độ thích hợp, các phản ứng hóa học (như phản ứng Maillard hay Caramel hóa) mới diễn ra để tạo ra hàng trăm hợp chất hương thơm đặc trưng. Người thợ rang tại Pureva phải theo dõi sát sao từng tiếng nổ của hạt cà phê (crack), ngửi mùi khói, và quan sát màu sắc hạt thay đổi liên tục để quyết định thời điểm xả mẻ rang phù hợp nhất cho từng profile Light, Medium hay Dark.', 'https://images.unsplash.com/photo-1524350876685-274059332603?q=80&w=800', FALSE, NULL, TRUE);
