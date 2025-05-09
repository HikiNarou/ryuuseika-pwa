document.addEventListener('DOMContentLoaded', function () {
    // Navigasi Sidebar
    const navItems = document.querySelectorAll('.navigation ul li');
    navItems.forEach(item => {
        item.addEventListener('click', function (event) {
            if (event.target.closest('a')) {
                navItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Placeholder untuk fungsi pencarian
    const searchButton = document.querySelector('.search-button');
    const searchInput = document.querySelector('.search-bar input');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            alert('Fungsi pencarian untuk: ' + searchInput.value);
        });
    }
    if (searchInput) {
         searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                alert('Fungsi pencarian untuk: ' + searchInput.value);
            }
        });
    }

    // Inisialisasi Swiper untuk Rekomendasi Magang
    const recommendationSwiper = new Swiper('.recommendation-swiper', {
        slidesPerView: 1.2,
        spaceBetween: 15,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            640: { slidesPerView: 2.2, spaceBetween: 20 },
            768: { slidesPerView: 2.5, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 25 },
            1200: { slidesPerView: 3.3, spaceBetween: 25 }
        },
        // Menonaktifkan loop bawaan jika ada, karena kita akan menangani "kembali ke awal" secara manual
        loop: false, // Pastikan loop tidak aktif jika ingin kembali ke indeks 0 secara eksplisit
        // Tambahkan event listener untuk kembali ke slide awal
        on: {
            // Event ini terpicu setelah transisi slide selesai
            slideChangeTransitionEnd: function () {
                // `this` merujuk ke instance Swiper
                // Jika slide aktif bukan slide pertama (indeks 0)
                if (this.activeIndex !== 0) {
                    // Tambahkan jeda sebelum kembali ke awal (misalnya 2000ms = 2 detik)
                    setTimeout(() => {
                        this.slideTo(0, 800); // Kembali ke slide pertama (indeks 0) dengan kecepatan 800ms
                    }, 2000); // Jeda 2 detik
                }
            },
            // Alternatif: `touchEnd` terpicu saat pengguna mengangkat jari setelah swipe
            // Ini mungkin lebih responsif tapi bisa terasa terlalu cepat kembali
            /*
            touchEnd: function () {
                if (this.activeIndex !== 0) {
                    // Pertimbangkan untuk menambahkan kondisi jika pengguna hanya tap, bukan swipe jauh
                    // Atau jika interaksi adalah klik pada pagination
                    if (this.isMoved) { // isMoved adalah properti internal, mungkin perlu cara lain untuk cek swipe
                        setTimeout(() => {
                            this.slideTo(0, 800);
                        }, 1500);
                    }
                }
            }
            */
        }
    });

    // Implementasi Filter Kategori untuk "Jelajahi Perusahaan Lainnya"
    const categorySelect = document.getElementById('companyCategoryFilter');
    const companyCards = document.querySelectorAll('.company-grid .card.card-hover-effect');

    if (categorySelect && companyCards.length > 0) {
        categorySelect.addEventListener('change', function () {
            const selectedCategory = this.value;
            companyCards.forEach(card => {
                const cardCategory = card.dataset.category;
                if (selectedCategory === "" || cardCategory === selectedCategory) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }
});