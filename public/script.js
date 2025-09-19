
const API_URL = 'http://localhost:3000';

//sayfa yüklendiginde parcaları cekip sayfaya yükleme
document.addEventListener('DOMContentLoaded', parcalariGetir);
function parcalariGetir() {
    fetch(`${API_URL}/parcalar`)
        .then(res => res.json())//gelen verileri jsona ceviriyoruz cunku gelen backenden gelen veri json
        .then(data => {
            const tbody = document.getElementById('parcaBody');
            tbody.innerHTML = ``;//table içi doluysa temizliyoruz
            data.forEach(element => {//data listesindeki her parça için tr oluşturuyoruz
                const tr = document.createElement('tr');
                tr.innerHTML = `
                <td>${element.parca_id}</td>
                <td>${element.parca_adi}</td>
                <td>${element.kategori_adi}</td>
                <td>${element.mevcut_miktar !== null ? element.mevcut_miktar : 0}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error('parça listelenirken hata oluştu:', err));
}

//kategori çekme
document.addEventListener('DOMContentLoaded', () => {
    fetch(`${API_URL}/kategoriler`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('kategori');//gelen verileri selecte atıyoruz
            data.forEach(kategori => {
                const option = document.createElement('option');
                option.value = kategori.kategori_id;
                option.textContent = kategori.kategori_adi;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error("kategoriler çekilirken hata oluştu:", error);
        })
})

//veri ekleme
document.getElementById('ekle').addEventListener('submit', function (e) {
    e.preventDefault();//submit olayında sayfa yenilirdi ancak preventDefault() ile bunu engelleyip verileri işleyebilirz
    const parca_adi = document.getElementById('ad').value;
    const kategori_id = Number(document.getElementById('kategori').value);
    const mevcut_miktar = Number(document.getElementById('stok').value);
    fetch(`${API_URL}/parcalar`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ parca_adi, kategori_id, mevcut_miktar })//js objesini JSON a çevirir
    })
        .then(res => res.json())
        .then(data => {
            alert(`${parca_adi} başarılı bir şekilde eklendi.`);
            this.reset();//formu temizler ekleme yaptıktan sonra
            parcalariGetir();//yenilenme olmadan parçalar güncellenir
        })
        .catch(err => {
            console.error('hata:', err);
            alert('Parça eklenirken hata oluştu.');
        });
});

//veri silme(id ile)
document.getElementById('sil').addEventListener('submit', function (e) {
    e.preventDefault();

    const silId = Number(document.getElementById('silID').value);
    if (!silId || silId <= 0) {
        alert('Lütfen geçerli bir ID değeri giriniz');
        return;
    }

    fetch(`${API_URL}/parcalar/${silId}`, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(data => {
            if (!data.status) {
                alert(data.mesaj || `${silId} ID'li parça silinirken hata oluştu`);
                return;
            }
            alert(data.mesaj);
            this.reset();
            parcalariGetir();
        })
        .catch(err => {
            console.error('Hata:', err);
            alert(`${silId} ID'li parça silinirken hata oluştu`);
        });
});


//veri güncelleme (id)
document.getElementById('guncelle').addEventListener('submit', function (e) {
    e.preventDefault();
    const guncelleId = Number(document.getElementById('guncelleID').value);
    const eklenecek = Number(document.getElementById('eklenecekStok').value);
    if (!guncelleId || guncelleId <= 0) {
        alert('Lütfen geçerli bir id i değeri giriniz');
        return;
    }
    fetch(`${API_URL}/parcalar/${guncelleId}/stok`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ miktar: eklenecek })
    })
        .then(res => res.json())
        .then(data => {
            if (!data.status) {
                alert(`${guncelleId} ID'li parçanın stoğun güncellenirken hata oluştu`);
                return;
            }
            alert(data.mesaj);
            this.reset();
            parcalariGetir();
        })
        .catch(err => {
            console.error('Hata:', err);
            alert(`${guncelleId} ID'li parçanın stoğu güncellenirken hata oluştu`);
        })
});
//giren kisi admin mi kullanıcı mı
document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/check-auth')//kullanıcının oturum açıp açmadığını kontrol etmek için
        .then(res => res.json())
        .then(data => {
            if (!data.loggedIn) {
                location.href = '/login.html';
                return;
            }
            if (data.user.rol !== 'admin') { //eger giren kisi admin degilse kullanıcılar btn gızleme
                var link = document.querySelector('.kln-btn');
                if (link) {
                    link.style.display = 'none';
                }
            }
            console.log("Giriş yaoan:", data.user.adi, "Rol:", data.user.rol);
        })
        .catch(err => {
            console.error('Hata:', err);
            location.href = '/login.html';
        })
});

//çıkış butonu
document.getElementById('cıkıs-btn').addEventListener('click', function () {
    fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                location.href = '/login.html';
                alert('Çıkış başarılı bir şekilde yapılmıştır.');
            }
            else {
                alert('Çıkış yapılmadı');
            }
        })
        .catch(err => {
            console.error('Hata:', err);
            alert('Çıkış sırasında hata oluştu.');
        });
});
