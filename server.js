const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');//farklı portlardan gelen istekleri kabul edilmesini saglar.
const path = require('path');
const session = require('express-session');
const ExcelJS = require('exceljs');
const router = express.Router();
const { error } = require('console');

const app = express();

app.use(cors());//tüm kaynaklardan gelen istekleri kabul eder
app.use(bodyParser.json());//json verileri okumayi sağlar
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: 'parcaTakipSistemiGizliAnahtar',
    resave: false,
    saveUninitialized: false,//guvenlık true olmamlı
    cookie: {
        secure: false,        // https kullanıyorsan true olurdu
        maxAge: 1000 * 60 * 60 // 1 saatlik oturum
    }
}));


// Oturum kontrol middleware’i
app.use((req, res, next) => {
    // Bu sayfalara giriş yapılmadan da erişilebilir
    const izinliSayfalar = [
        '/login.html',
        '/login',           // POST login işlemi
        '/logout',          // logout işlemi
        '/css/',
        '/js/',
        '/tenom.png'
    ];

    // Kullanıcı giriş yaptıysa devam etsin
    if (req.session.user) {
        return next();
    }

    // Eğer istek izinli sayfalardan biriyle başlıyorsa izin ver
    if (izinliSayfalar.some(p => req.url.startsWith(p))) {
        return next();
    }

    // Aksi halde login sayfasına yönlendir
    return res.redirect('/login.html');
});

app.use(express.static(path.join(__dirname, 'public')));//public içindeki dosyların statik olarak servis edilmesini saglar

//login kısmı
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'E-posta ve şifre gereklidir' });
    }

    const sql = `SELECT * FROM kullanicilar WHERE kullanici_eposta = ? AND kullanici_sifre = ?`;

    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Giriş sorgu hatası:', err);
            return res.status(500).json({ success: false, message: 'Veritabanı hatası' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre' });
        }

        const user = results[0];

        // Session oluştur
        req.session.user = {
            id: user.kullanici_id,
            adi: user.kullanici_adi,
            soyadi: user.kullanici_soyadi,
            eposta: user.kullanici_eposta,
            rol: user.kullanici_rol
        };

        // Başarılı girişte ana sayfaya yönlendir
        res.json({
            success: true,
            message: 'Giriş başarılı',
            redirect: '/index.html'
        });
    });
});

// Oturum kontrolü
app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// Çıkış endpoint'i
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Çıkış yapılamadı' });
        }
        res.setHeader('Cache-Control', 'no-store'); // Önbellek engeli
        res.json({ success: true, message: 'Çıkış başarılı' });
    });
});


//veritabanına bağlantı
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ceren123',
    database: 'parca_takip'
});
//kontrol
db.connect(err => {
    if (err) {
        console.error('veritabanı hatası:', err);
        return;
    }
    console.log('mySQL bağlantısı başarılı');
});

//veritabanındaki verileri çekme
app.get('/parcalar', (req, res) => {
    const sql = `
  SELECT p.parca_id, p.parca_adi,k.kategori_adi,  ps.mevcut_miktar
  FROM parcalar p
  LEFT JOIN kategoriler k ON p.kategori_id = k.kategori_id
  LEFT JOIN parca_stok ps ON p.parca_id = ps.parca_id
  ORDER BY p.parca_id;

`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

//kategori tablosundaki tüm verileri json formatında fronted gönderme
app.get('/kategoriler', (req, res) => {
    db.query('SELECT*FROM kategoriler', (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'veritabanı hatası' });
        }
        res.json(result);
    });
});


//parça ekleme 
app.post('/parcalar', (req, res) => {
    const { parca_adi, kategori_id, mevcut_miktar } = req.body;
    db.query('INSERT INTO parcalar (parca_adi,kategori_id) VALUES (?,?)', [parca_adi, kategori_id], (err, result) => {
        if (err) {
            console.error('parça eklerken hata oluştu:', err);
            return res.status(500).send({ hata: 'parça ekleme hatası' });
        }
        const parca_id = result.insertId;//yeni eklenen parçanın id si
        //stok ekleme
        db.query('INSERT INTO parca_stok (parca_id,mevcut_miktar) VALUES (?,?)', [parca_id, mevcut_miktar], (err2, result) => {
            if (err2) {
                console.error('stok eklerken hata oluştu:', err2);
                return res.status(500).send({ hata: 'stok ekleme hatası' });
            }
            res.json({ message: 'Parça başarılı bir şekilde eklenmiştir.' });
        });
    });
});
//parça silme
app.delete('/parcalar/:id', (req, res) => {
    const parca_id = req.params.id;
    db.query('DELETE FROM parcalar WHERE parca_id =?', [parca_id], (err, result) => {
        if (err) {
            console.error('parça silinirken hata oluştu:', err);
            return res.status(500).json({ status: false, hata: 'parça silme hatası' });
        }

        if (result.affectedRows == 0) {
            return res.status(404).json({ status: false, mesaj: `${parca_id} ile eşleşen parça bulunamadı` });
        }
        res.json({ status: true, mesaj: `${parca_id} numaralı ID'ye sahip parça silindi` });
    });
});
//parça güncelleme
app.put('/parcalar/:id/stok', (req, res) => {
    const gelenId = Number(req.params.id);
    const { miktar } = req.body;

    if (!gelenId || gelenId <= 0 || !miktar) {
        return res.status(400).json({ status: false, hata: 'Geçerli id ve miktar giriniz' });
    }

    db.query(
        'UPDATE parca_stok SET mevcut_miktar = mevcut_miktar + ? WHERE parca_id = ?',
        [miktar, gelenId],
        (err, result) => {
            if (err) {
                console.error('stok güncellenirken hata oluştu:', err);
                return res.status(500).json({ status: false, hata: 'stok güncelleme hatası' });
            }
            if (result.affectedRows == 0) {
                return res.status(404).json({ status: false, mesaj: `${gelenId} ile eşleşen parça bulunamadı` });
            }
            res.json({ status: true, mesaj: `${gelenId} numaralı ID ye sahip parçanın stoğu değiştirildi.` });
        }
    );
});


//kullanıcı cekme veritabanından 
app.get('/kullanicilar', (req, res) => {
    db.query('SELECT * FROM kullanicilar', (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Veri alınamadı' });
        }
        res.json(results);
    });
});
//kullanıcı ekleme
app.post('/kullanicilar', (req, res) => {
    const { kullanici_adi, kullanici_soyadi, kullanici_eposta, kullanici_sifre, kullanici_rol } = req.body;

    db.query('INSERT INTO kullanicilar (kullanici_adi,kullanici_soyadi,kullanici_eposta,kullanici_sifre,kullanici_rol) VALUES (?,?,?,?,?)', [kullanici_adi, kullanici_soyadi, kullanici_eposta, kullanici_sifre, kullanici_rol], (err, results) => {
        if (err) {
            console.error('kullanıcı eklerken hata oluştu:', err);
            return res.status(500).send({ hata: 'kulanıcı ekleme hatası' });
        }
        res.json({ message: 'Kullanıcı başarılı bir şekilde eklendi' });
    });
});
//kullanıcı silme
app.delete('/kullanicilar/:id', (req, res) => {
    const kullanici_id = req.params.id;
    db.query('DELETE FROM kullanicilar WHERE kullanici_id=?', [kullanici_id], (err, result) => {
        if (err) {
            console.error('kullanıcı silinirken hata oluştu:', err);
            return res.status(500).json({ status: false, hata: 'kullanıcı silme hatası' });
        }
        if (result.affectedRows == 0) {
            return res.status(404).json({ status: false, mesaj: `${kullanici_id} ile eşleşen kullanıcı bulunamadı` });
        }
        res.json({ status: true, mesaj: `${kullanici_id} numaralı ID'ye sahip kullanıcı silindi` });
    })
});


app.get('/export/excel', (req, res) => {
    const sql = `
    SELECT p.parca_id, p.parca_adi, p.kategori_id, ps.mevcut_miktar
    FROM parcalar p
    LEFT JOIN parca_stok ps ON p.parca_id = ps.parca_id
  `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Sorgu hatası:', err);
            return res.status(500).send('Veritabanı hatası');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Parçalar');

        worksheet.columns = [
            { header: 'ID', key: 'parca_id', width: 10 },
            { header: 'Parça Adı', key: 'parca_adi', width: 30 },
            { header: 'Kategori ID', key: 'kategori_id', width: 20 },
            { header: 'Stok Miktarı', key: 'mevcut_miktar', width: 15 },
        ];

        results.forEach(row => worksheet.addRow(row));

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=parcalar.xlsx');

        workbook.xlsx.write(res)
            .then(() => {
                res.end();
            })
            .catch(error => {
                console.error('Excel yazılırken hata:', error);
                res.status(500).send('Excel oluşturma hatası');
            });
    });
});


app.listen(3000, () => {
    console.log('3000 portunda çalışıyor.');
});