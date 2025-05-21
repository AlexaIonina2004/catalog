let allProducts = [];
const skeletonContainer = document.querySelector('.catalog__skeletons');
const skeletonContainerFilter = document.querySelector('.catalog-filter__skeleton');

const btnFilterMobile = document.querySelector('.filter-mobile');
const closeFilterMobile = document.querySelector('.catalog-filter__top-close');
const catalogFilter = document.querySelector('.catalog-filter');

showSkeletons();

fetch('https://products-qn4pgbgk1-orlovwebdevgmailcoms-projects.vercel.app/products.json')
    .then(response => {
        if (!response.ok) throw new Error('Ошибка запроса');
        return response.json();
    })
    .then(products => {
        allProducts = products;
        hideSkeletons();
        renderProducts(products);
        renderCategories(products);
    })
    .catch(error => {
        hideSkeletons();
        document.querySelector('.catalog__items').innerHTML = `<p class="error">Ошибка загрузки товаров. Попробуйте позже.</p>`;
        console.error(error);
    });

function renderCategories(products) {
    const containerCategory = document.querySelector('.catalog-filter__category');
    containerCategory.innerHTML = '';

    const uniqueCategories = [...new Set(products.map(p => p.category))];

    uniqueCategories?.forEach(category => {
        const categoryBody = document.createElement('div');
        categoryBody.className = 'checkboxes-body';
        categoryBody.innerHTML = `
            <input type="checkbox" class="checkboxes-body-item" id="${category}" name="category" value="${category}">
            <label for="${category}">${category}</label>
        `;
        containerCategory?.appendChild(categoryBody);
    });
}

function renderProducts(products) {
    const container = document.querySelector('.catalog__items');
    container.innerHTML = '';

    const favoriteIds = (JSON.parse(localStorage.getItem('favorites')) || []).map(String);

    products?.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card-catalog';

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = `https://products-qn4pgbgk1-orlovwebdevgmailcoms-projects.vercel.app/${product.image}`;
        img.alt = 'product';
        img.className = 'card-catalog__content-img skeleton';

        img.onload = () => {
            img.classList.remove('skeleton');
        };

        img.onerror = () => {
            img.classList.remove('skeleton');
            img.src = './img/save-image.png';
        };

        const isFavorite = favoriteIds?.includes(String(product.id));

        card.innerHTML = `
        <button type="button" class="card-catalog-favorite ${isFavorite ? 'active' : ''}" data-id="${product.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33" fill="none">
                <path d="M9.625 4.125C5.82863 4.125 2.75 7.172 2.75 10.9312C2.75 13.9659 3.95312 21.1681 15.796 28.4488C16.0084 28.5771 16.2518 28.6449 16.5 28.6449C16.7482 28.6449 16.9916 28.5771 17.204 28.4488C29.0483 21.1681 30.25 13.9659 30.25 10.9312C30.25 7.172 27.1714 4.125 23.375 4.125C19.5786 4.125 16.5 8.25 16.5 8.25C16.5 8.25 13.4214 4.125 9.625 4.125Z" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        </button>
        <a href="#" class="card-catalog__content"></a>
        <div class="card-catalog__body">
            <p class="card-catalog__body-category">${product.category}</p>
            <a href="#" class="card-catalog__body-title">${product.title}</a>
            <p class="card-catalog__body-text">
                <span>${product.price}</span> Р
            </p>
        </div>
        `;

        card?.querySelector('.card-catalog__content').appendChild(img);
        container.appendChild(card);
    });

    const favoriteBtns = document.querySelectorAll('.card-catalog-favorite');
    favoriteBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.dataset.id;
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

            if (favorites?.includes(productId)) {
                favorites = favorites?.filter(id => id !== productId);
                btn.classList.remove('active');
            } else {
                favorites.push(productId);
                btn.classList.add('active');
            }

            localStorage.setItem('favorites', JSON.stringify(favorites));
        });
    });
}



const filterBtn = document.querySelector('.filter-button');

filterBtn.addEventListener('click', () => {
    applyFilters()
    closeFilterModal()
});
function applyFilters() {
    const inputs = document.querySelectorAll('.catalog-filter__price-input');
    const checkboxes = document.querySelectorAll('.checkboxes-body-item:checked');

    const min = Number(inputs[0].value) || 0;
    const max = Number(inputs[1].value) || Infinity;
    const selectedCategories = [...checkboxes].map(cb => cb.value);

    const filtered = allProducts?.filter(product => {
        return (
            product.price >= min &&
            product.price <= max &&
            (selectedCategories.length === 0 || selectedCategories.includes(product.category))
        );
    });

    renderProducts(filtered);
}
const resetBtn = document.querySelector('.reset-button');

resetBtn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.catalog-filter__price-input');
    inputs[0].value = '';
    inputs[1].value = '';

    const checkboxes = document.querySelectorAll('.checkboxes-body-item');
    checkboxes?.forEach(cb => cb.checked = false);
    renderProducts(allProducts);
});

const customSelect = document.querySelector('.custom-select');
const trigger = customSelect.querySelector('.custom-select__trigger');
const options = customSelect.querySelectorAll('.custom-option');

trigger?.addEventListener('click', () => {
    customSelect.classList.toggle('open');
});

options?.forEach(option => {
    option.addEventListener('click', () => {
        const value = option.dataset.value;
        trigger.textContent = option.textContent;
        customSelect.classList.remove('open');

        renderProducts(sortProducts(allProducts, value));
    });
});
function sortProducts(products, sortType) {
    const sorted = [...products];
    switch (sortType) {
        case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
        case 'title-asc': return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'title-desc': return sorted.sort((a, b) => b.title.localeCompare(a.title));
        default: return sorted;
    }
}

document.addEventListener('click', (e) => {
    if (!customSelect?.contains(e.target)) {
        customSelect?.classList.remove('open');
    }
});

function showSkeletons(count = 6) {
    skeletonContainer.innerHTML = '';
    skeletonContainerFilter.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        const skeletonFilter = document.createElement('div');
        skeleton?.classList.add('skeleton-product');
        skeleton?.classList.add('skeleton');
        skeletonFilter?.classList.add('checkboxes-body');
        skeletonFilter?.classList.add('skeleton');
        skeletonContainer?.appendChild(skeleton);
        skeletonContainerFilter?.appendChild(skeletonFilter);
    }
}

function hideSkeletons() {
    skeletonContainer.innerHTML = '';
    skeletonContainerFilter.innerHTML = '';
}
function openFilterModal() {
        catalogFilter?.classList.toggle('open');
        document.body.classList.add('lock');
}
function closeFilterModal() {
    catalogFilter?.classList.remove('open');
    document.body.classList.remove('lock');
}
btnFilterMobile?.addEventListener('click', () => {
    openFilterModal()
})
closeFilterMobile?.addEventListener('click', () => {
    closeFilterModal()
})
