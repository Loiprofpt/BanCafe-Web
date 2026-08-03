const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support base64 image/video uploads

// Serve uploaded media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// PostgreSQL Database Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : {
    rejectUnauthorized: false // Required for Supabase / cloud DB connections
  }
});

// Helper: Save Base64 Uploads to local disk
function saveBase64File(fileName, base64Data, req) {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(fileName)}`;
  const filePath = path.join(uploadsDir, uniqueName);
  fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
  
  // Return absolute public URL
  const host = req.get('host');
  const protocol = req.protocol;
  return `${protocol}://${host}/uploads/${uniqueName}`;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. GET Settings
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT settingkey, settingvalue, description FROM settings');
    // Map column names to PascalCase for frontend compatibility
    const settings = result.rows.map(row => ({
      SettingKey: row.settingkey,
      SettingValue: row.settingvalue,
      Description: row.description
    }));
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 2. GET Products (Active only)
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE isactive = TRUE ORDER BY id ASC');
    // Map database properties to PascalCase
    const products = result.rows.map(row => ({
      Id: row.id,
      Name: row.name,
      Price: parseFloat(row.price),
      Unit: row.unit,
      Description: row.description,
      ImageUrl: row.imageurl,
      RoastOptions: row.roastoptions,
      IsActive: row.isactive
    }));
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 3. GET Blogs (Active only)
app.get('/api/blogs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs WHERE isactive = TRUE ORDER BY publishedat DESC');
    const blogs = result.rows.map(row => ({
      Id: row.id,
      Title: row.title,
      Slug: row.slug,
      Summary: row.summary,
      Content: row.content,
      ImageUrl: row.imageurl,
      PublishedAt: row.publishedat,
      IsVideo: row.isvideo,
      VideoUrl: row.videourl,
      IsActive: row.isactive
    }));
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 3.5 GET Farm Videos (Active only)
app.get('/api/farm-videos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM farm_videos WHERE isactive = TRUE ORDER BY createdat DESC');
    const farmVideos = result.rows.map(row => ({
      Id: row.id,
      Title: row.title,
      Description: row.description,
      VideoUrl: row.videourl,
      ThumbnailUrl: row.thumbnailurl,
      CreatedAt: row.createdat,
      IsActive: row.isactive
    }));
    res.json(farmVideos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Admin Authentication
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRes = await pool.query('SELECT settingvalue FROM settings WHERE settingkey = \'AdminUsername\'');
    const passRes = await pool.query('SELECT settingvalue FROM settings WHERE settingkey = \'AdminPassword\'');
    
    const dbEmail = userRes.rows[0]?.settingvalue;
    const dbPass = passRes.rows[0]?.settingvalue;
    
    if (email === dbEmail && password === dbPass) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. GET All Admin Data (Orders, Designs, Products, Blogs)
app.get('/api/admin/data', async (req, res) => {
  try {
    // 1. Get Orders
    const ordersRes = await pool.query('SELECT * FROM orders ORDER BY createdat DESC');
    const orders = ordersRes.rows.map(row => ({
      Id: row.id,
      CustomerName: row.customername,
      CustomerEmail: row.customeremail,
      CustomerPhone: row.customerphone,
      ShippingAddress: row.shippingaddress,
      TotalAmount: parseFloat(row.totalamount),
      CreatedAt: row.createdat,
      Status: row.status
    }));

    // 2. Get Order Items mapped with Product Name
    const itemsRes = await pool.query(`
      SELECT oi.*, p.name as productname 
      FROM orderitems oi 
      LEFT JOIN products p ON oi.productid = p.id
    `);
    const orderItems = itemsRes.rows.map(row => ({
      Id: row.id,
      OrderId: row.orderid,
      ProductId: row.productid,
      ProductName: row.productname,
      RoastLevel: row.roastlevel,
      Quantity: row.quantity,
      Price: parseFloat(row.price)
    }));

    // 3. Get Designs
    const designsRes = await pool.query('SELECT * FROM customdesigns ORDER BY createdat DESC');
    const designs = designsRes.rows.map(row => ({
      Id: row.id,
      CustomerName: row.customername,
      CustomerEmail: row.customeremail,
      CustomerPhone: row.customerphone,
      Description: row.description,
      DesignFileUrl: row.designfileurl,
      CreatedAt: row.createdat,
      Status: row.status
    }));

    // 4. Get Products
    const productsRes = await pool.query('SELECT * FROM products ORDER BY id ASC');
    const products = productsRes.rows.map(row => ({
      Id: row.id,
      Name: row.name,
      Price: parseFloat(row.price),
      Unit: row.unit,
      Description: row.description,
      ImageUrl: row.imageurl,
      RoastOptions: row.roastoptions,
      IsActive: row.isactive
    }));

    // 5. Get Blogs
    const blogsRes = await pool.query('SELECT * FROM blogs ORDER BY publishedat DESC');
    const blogs = blogsRes.rows.map(row => ({
      Id: row.id,
      Title: row.title,
      Slug: row.slug,
      Summary: row.summary,
      Content: row.content,
      ImageUrl: row.imageurl,
      PublishedAt: row.publishedat,
      IsVideo: row.isvideo,
      VideoUrl: row.videourl,
      IsActive: row.isactive
    }));

    // 5.5 Get Farm Videos
    const farmVideosRes = await pool.query('SELECT * FROM farm_videos ORDER BY createdat DESC');
    const farmVideos = farmVideosRes.rows.map(row => ({
      Id: row.id,
      Title: row.title,
      Description: row.description,
      VideoUrl: row.videourl,
      ThumbnailUrl: row.thumbnailurl,
      CreatedAt: row.createdat,
      IsActive: row.isactive
    }));

    // 6. Get Settings
    const settingsRes = await pool.query('SELECT settingkey, settingvalue, description FROM settings');
    const settings = settingsRes.rows.map(row => ({
      SettingKey: row.settingkey,
      SettingValue: row.settingvalue,
      Description: row.description
    }));

    res.json({
      orders,
      orderItems,
      designs,
      products,
      blogs,
      farmVideos,
      settings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Submit Checkout Order (Transaction)
app.post('/api/checkout', async (req, res) => {
  const { customerName, customerPhone, customerEmail, shippingAddress, totalAmount, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert Order
    const orderQuery = `
      INSERT INTO orders (customername, customeremail, customerphone, shippingaddress, totalamount) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id
    `;
    const orderResult = await client.query(orderQuery, [customerName, customerEmail, customerPhone, shippingAddress, totalAmount]);
    const orderId = orderResult.rows[0].id;
    const orderCode = `PV-${orderId + 1000}`;
    
    // Insert Order Items
    const itemQuery = `
      INSERT INTO orderitems (orderid, productid, roastlevel, quantity, price) 
      VALUES ($1, $2, $3, $4, $5)
    `;
    let itemsListHtml = '';
    for (const item of items) {
      await client.query(itemQuery, [orderId, item.id, item.roastLevel || null, item.quantity, item.price]);
      itemsListHtml += `<li>${item.name} (x${item.quantity}) - ${item.price.toLocaleString('vi-VN')}đ</li>`;
    }
    
    await client.query('COMMIT');

    // Send Confirmation Email
    if (customerEmail && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: customerEmail,
        subject: `Xác nhận đơn hàng ${orderCode} từ Pureva Craft`,
        html: `
          <h3>Cảm ơn ${customerName} đã đặt hàng tại Pureva Craft!</h3>
          <p>Mã đơn hàng của bạn là: <strong style="color: #634A36; font-size: 16px;">${orderCode}</strong></p>
          <p><strong>Danh sách sản phẩm:</strong></p>
          <ul>
            ${itemsListHtml}
          </ul>
          <p><strong>Tổng thanh toán:</strong> <span style="color: #d35400; font-size: 18px; font-weight: bold;">${totalAmount.toLocaleString('vi-VN')}đ</span></p>
          <p><strong>Địa chỉ nhận hàng:</strong> ${shippingAddress}</p>
          <hr/>
          <h4>HƯỚNG DẪN THANH TOÁN</h4>
          <p>Để hoàn tất đơn hàng, bạn vui lòng dùng ứng dụng ngân hàng quét mã QR dưới đây hoặc chuyển khoản số tiền <strong>${totalAmount.toLocaleString('vi-VN')}đ</strong> vào tài khoản sau:</p>
          <ul>
            <li>Ngân hàng: <strong>VietinBank</strong></li>
            <li>Chủ tài khoản: <strong>DO HUU MINH TOAN</strong></li>
            <li>Số tài khoản: <strong>103879522106</strong></li>
            <li>Nội dung chuyển khoản: <strong>${orderCode}</strong></li>
          </ul>
          <p><em>(Quét mã QR dưới đây để tự động điền số tiền và nội dung chuyển khoản)</em></p>
          <img src="https://img.vietqr.io/image/970415-103879522106-V5TjV6h.jpg?amount=${totalAmount}&addInfo=${orderCode}&accountName=DO%20HUU%20MINH%20TOAN" alt="Mã QR Thanh Toán" width="300" style="margin-top: 10px; border: 1px solid #ccc; border-radius: 8px;"/>
          <p style="margin-top: 20px;">Chúng tôi sẽ liên hệ lại với bạn ngay sau khi nhận được thanh toán.</p>
        `
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email: ", error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }

    res.json({ success: true, orderId: orderCode });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

// 7. Submit Packaging Custom Design
app.post('/api/designs', async (req, res) => {
  const { customerName, customerPhone, customerEmail, description, designFileUrl, designFileName, designFileBase64 } = req.body;
  try {
    let finalFileUrl = designFileUrl;
    
    // Handle local storage upload if file base64 is provided
    if (designFileName && designFileBase64) {
      finalFileUrl = saveBase64File(designFileName, designFileBase64, req);
    }
    
    const query = `
      INSERT INTO customdesigns (customername, customeremail, customerphone, description, designfileurl) 
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(query, [customerName, customerEmail, customerPhone, description, finalFileUrl || '']);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// ADMIN CRUD API ROUTES
// ==========================================

// Update Order Status
app.post('/api/admin/orders/status', async (req, res) => {
  const { id, status } = req.body;
  try {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Order
app.post('/api/admin/orders/delete', async (req, res) => {
  const { id } = req.body;
  try {
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Packaging Design Request Status
app.post('/api/admin/designs/status', async (req, res) => {
  const { id, status } = req.body;
  try {
    await pool.query('UPDATE customdesigns SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Packaging Design Request
app.post('/api/admin/designs/delete', async (req, res) => {
  const { id } = req.body;
  try {
    await pool.query('DELETE FROM customdesigns WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create or Save Product
app.post('/api/admin/products/save', async (req, res) => {
  const { id, name, price, unit, description, imageUrl, roastOptions, isActive, imgFileName, imgFileBase64 } = req.body;
  try {
    let finalImageUrl = imageUrl;
    
    // Save image if uploaded
    if (imgFileName && imgFileBase64) {
      finalImageUrl = saveBase64File(imgFileName, imgFileBase64, req);
    }
    if (!finalImageUrl) {
      finalImageUrl = 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800';
    }

    if (id) {
      // UPDATE
      const query = `
        UPDATE products 
        SET name = $1, price = $2, unit = $3, description = $4, imageurl = $5, roastoptions = $6, isactive = $7
        WHERE id = $8
      `;
      await pool.query(query, [name, price, unit, description, finalImageUrl, roastOptions, isActive !== false, id]);
    } else {
      // INSERT
      const query = `
        INSERT INTO products (name, price, unit, description, imageurl, roastoptions, isactive) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await pool.query(query, [name, price, unit, description, finalImageUrl, roastOptions, isActive !== false]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Product
app.post('/api/admin/products/delete', async (req, res) => {
  const { id } = req.body;
  try {
    // Check if product has orders
    const checkRes = await pool.query('SELECT COUNT(*) FROM orderitems WHERE productid = $1', [id]);
    const hasOrders = parseInt(checkRes.rows[0].count, 10) > 0;
    
    if (hasOrders) {
      // Soft delete: deactivate the product
      await pool.query('UPDATE products SET isactive = false WHERE id = $1', [id]);
      res.json({ success: true, message: 'Sản phẩm đã có đơn hàng nên hệ thống chuyển thành ngưng hoạt động (Ẩn khỏi cửa hàng).' });
    } else {
      // Hard delete: remove completely
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      res.json({ success: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create or Save Blog
app.post('/api/admin/blogs/save', async (req, res) => {
  const { id, title, slug, summary, content, imageUrl, isVideo, videoUrl, isActive, imgFileName, imgFileBase64, vidFileName, vidFileBase64 } = req.body;
  try {
    let finalImageUrl = imageUrl;
    let finalVideoUrl = videoUrl;

    if (imgFileName && imgFileBase64) {
      finalImageUrl = saveBase64File(imgFileName, imgFileBase64, req);
    }
    if (!finalImageUrl) {
      finalImageUrl = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800';
    }

    if (isVideo && vidFileName && vidFileBase64) {
      finalVideoUrl = saveBase64File(vidFileName, vidFileBase64, req);
    }

    if (id) {
      // UPDATE
      const query = `
        UPDATE blogs 
        SET title = $1, slug = $2, summary = $3, content = $4, imageurl = $5, isvideo = $6, videourl = $7, isactive = $8
        WHERE id = $9
      `;
      await pool.query(query, [title, slug, summary, content, finalImageUrl, isVideo === true, finalVideoUrl, isActive !== false, id]);
    } else {
      // INSERT
      const query = `
        INSERT INTO blogs (title, slug, summary, content, imageurl, isvideo, videourl, isactive, publishedat) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `;
      await pool.query(query, [title, slug, summary, content, finalImageUrl, isVideo === true, finalVideoUrl, isActive !== false]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Blog
app.post('/api/admin/blogs/delete', async (req, res) => {
  const { id } = req.body;
  try {
    await pool.query('DELETE FROM blogs WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create or Save Farm Video
app.post('/api/admin/farm-videos/save', async (req, res) => {
  const { id, title, description, videoUrl, thumbnailUrl, isActive, vidFileName, vidFileBase64, imgFileName, imgFileBase64 } = req.body;
  try {
    let finalVideoUrl = videoUrl;
    let finalThumbnailUrl = thumbnailUrl;

    if (vidFileName && vidFileBase64) {
      finalVideoUrl = saveBase64File(vidFileName, vidFileBase64, req);
    }
    if (imgFileName && imgFileBase64) {
      finalThumbnailUrl = saveBase64File(imgFileName, imgFileBase64, req);
    }

    if (id) {
      const query = `
        UPDATE farm_videos 
        SET title = $1, description = $2, videourl = $3, thumbnailurl = $4, isactive = $5
        WHERE id = $6
      `;
      await pool.query(query, [title, description, finalVideoUrl, finalThumbnailUrl, isActive !== false, id]);
    } else {
      const query = `
        INSERT INTO farm_videos (title, description, videourl, thumbnailurl, isactive) 
        VALUES ($1, $2, $3, $4, $5)
      `;
      await pool.query(query, [title, description, finalVideoUrl, finalThumbnailUrl, isActive !== false]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Farm Video
app.post('/api/admin/farm-videos/delete', async (req, res) => {
  const { id } = req.body;
  try {
    await pool.query('DELETE FROM farm_videos WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Save All System Settings
app.post('/api/admin/settings/save', async (req, res) => {
  const { settings } = req.body; // Array of { SettingKey, SettingValue }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const query = 'UPDATE settings SET settingvalue = $1 WHERE settingkey = $2';
    
    for (const key of Object.keys(settings)) {
      await client.query(query, [settings[key], key]);
    }
    
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`BanCafe API Server running on port ${PORT}`);
});
