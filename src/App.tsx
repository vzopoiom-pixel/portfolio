/**
 * ============================================================================
 * ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ (App.tsx)
 * ============================================================================
 * Здесь сосредоточена основная бизнес-логика:
 * 1. Загрузка и сохранение состояния базы в LocalStorage браузера.
 * 2. Многоуровневая фильтрация (текстовый поиск + вкусы + объем + крепость + кулер).
 * 3. Обработка операций CRUD (Создание, Чтение, Редактирование, Удаление).
 * 4. Экспорт данных в файл JSON.
 */

import React, { useState, useEffect } from 'react';
import { ProductItem, IngredientItem, ActiveTab, FilterState } from './types';
import { INITIAL_PRODUCTS, INITIAL_INGREDIENTS } from './data/mockData';
import { Header } from './components/Header';
import { ProductFilters } from './components/ProductFilters';
import { ProductList } from './components/ProductList';
import { IngredientsView } from './components/IngredientsView';
import { StockOverview } from './components/StockOverview';
import { ProductModal } from './components/ProductModal';
import { IngredientModal } from './components/IngredientModal';

// Ключи для сохранения данных в памяти браузера (LocalStorage)
const STORAGE_KEY_PRODUCTS = 'vaporcore_products_v1';
const STORAGE_KEY_INGREDIENTS = 'vaporcore_ingredients_v1';

export default function App() {
  // Активная вкладка на экране (products | ingredients | analytics)
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');

  /**
   * 1. СОСТОЯНИЕ СПИСКА ПРОДУКТОВ
   * При старте приложение проверяет LocalStorage: если пользователь уже что-то вводил,
   * берутся сохраненные данные. Если база пуста — загружается начальный демо-каталог.
   */
  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  /**
   * 2. СОСТОЯНИЕ СПИСКА ИНГРЕДИЕНТОВ И СЫРЬЯ
   */
  const [ingredients, setIngredients] = useState<IngredientItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INGREDIENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_INGREDIENTS;
      }
    }
    return INITIAL_INGREDIENTS;
  });

  /**
   * Автоматическое сохранение в LocalStorage при любом изменении товаров или сырья.
   */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INGREDIENTS, JSON.stringify(ingredients));
  }, [ingredients]);

  /**
   * Состояние панели фильтров для поиска товаров
   */
  const initialProductFilters: FilterState = {
    searchQuery: '',
    flavors: [],
    mg: 'all',
    bottleSize: 'all',
    icedOnly: null,
    category: 'all',
    stockStatus: 'all'
  };

  const [productFilters, setProductFilters] = useState<FilterState>(initialProductFilters);

  // Состояние модальных окон (открыто/закрыто, редактируемый элемент)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<IngredientItem | null>(null);

  // Всплывающее уведомление (Toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /**
   * 3. МНОГОУРОВНЕВАЯ ЛОГИКА ФИЛЬТРАЦИИ И ПОИСКА (MULTI-LEVEL SEARCH)
   * Это ключевая фича, которую требовал заказчик:
   * Найти товары, у которых есть ("Клубника" И "Ментол") + объем ("60ml") + крепость ("3mg").
   */
  const filteredProducts = products.filter(product => {
    // 1. Текстовый поиск (по названию, SKU, категории, заметкам)
    if (productFilters.searchQuery.trim()) {
      const q = productFilters.searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchSku = product.sku.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchNotes = (product.notes || '').toLowerCase().includes(q);
      const matchFlavors = product.flavors.some(f => f.toLowerCase().includes(q));

      if (!matchName && !matchSku && !matchCategory && !matchNotes && !matchFlavors) {
        return false;
      }
    }

    // 2. Мульти-выбор вкусов: товар должен содержать ВСЕ выбранные вкусы
    if (productFilters.flavors.length > 0) {
      const hasAllFlavors = productFilters.flavors.every(filterFlavor =>
        product.flavors.some(prodFlavor => prodFlavor.toLowerCase() === filterFlavor.toLowerCase())
      );
      if (!hasAllFlavors) return false;
    }

    // 3. Фильтр по крепости никотина (MG)
    if (productFilters.mg !== 'all' && product.mg !== productFilters.mg) {
      return false;
    }

    // 4. Фильтр по объему флакона (Bottle Size)
    if (productFilters.bottleSize !== 'all' && product.bottleSize !== productFilters.bottleSize) {
      return false;
    }

    // 5. Фильтр по наличию кулера / холодка (ICED Status)
    if (productFilters.icedOnly !== null && product.isIced !== productFilters.icedOnly) {
      return false;
    }

    // 6. Фильтр по категории
    if (productFilters.category !== 'all' && product.category !== productFilters.category) {
      return false;
    }

    // 7. Фильтр по остаткам (мало на складе / в наличии)
    if (productFilters.stockStatus === 'low_stock' && product.stockQty > product.minThreshold) {
      return false;
    }
    if (productFilters.stockStatus === 'in_stock' && product.stockQty <= 0) {
      return false;
    }

    return true;
  });

  /**
   * ОБРАБОТЧИКИ ДЕЙСТВИЙ С ТОВАРАМИ (Добавление / Редактирование / Удаление / Быстрый склад)
   */
  const handleSaveProduct = (product: ProductItem) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => (p.id === product.id ? product : p)));
      showToast(`Товар обновлен: ${product.name}`);
    } else {
      setProducts(prev => [product, ...prev]);
      showToast(`Добавлен новый товар: ${product.name}`);
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (window.confirm(`Вы уверены, что хотите удалить товар "${target?.name || 'товар'}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Товар удален из базы данных');
    }
  };

  const handleUpdateProductStock = (id: string, delta: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextStock = Math.max(0, p.stockQty + delta);
          return { ...p, stockQty: nextStock, updatedAt: new Date().toISOString().split('T')[0] };
        }
        return p;
      })
    );
  };

  /**
   * ОБРАБОТЧИКИ ДЕЙСТВИЙ С СЫРЬЕМ И ИНГРЕДИЕНТАМИ
   */
  const handleSaveIngredient = (item: IngredientItem) => {
    if (editingIngredient) {
      setIngredients(prev => prev.map(i => (i.id === item.id ? item : i)));
      showToast(`Ингредиент обновлен: ${item.name}`);
    } else {
      setIngredients(prev => [item, ...prev]);
      showToast(`Добавлен сырьевой компонент: ${item.name}`);
    }
    setEditingIngredient(null);
  };

  const handleDeleteIngredient = (id: string) => {
    const target = ingredients.find(i => i.id === id);
    if (window.confirm(`Удалить ингредиент "${target?.name || 'компонент'}"?`)) {
      setIngredients(prev => prev.filter(i => i.id !== id));
      showToast('Ингредиент удален');
    }
  };

  const handleUpdateIngredientStock = (id: string, delta: number) => {
    setIngredients(prev =>
      prev.map(i => {
        if (i.id === id) {
          const nextStock = Math.max(0, Number((i.currentStock + delta).toFixed(2)));
          let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
          if (nextStock <= 0) status = 'Out of Stock';
          else if (nextStock <= i.reorderLevel) status = 'Low Stock';

          return { ...i, currentStock: nextStock, status, lastRestocked: new Date().toISOString().split('T')[0] };
        }
        return i;
      })
    );
  };

  // Сброс к исходному демонстрационному каталогу
  const handleResetData = () => {
    if (window.confirm('Сбросить базу данных к начальному демонстрационному каталогу?')) {
      setProducts(INITIAL_PRODUCTS);
      setIngredients(INITIAL_INGREDIENTS);
      localStorage.removeItem(STORAGE_KEY_PRODUCTS);
      localStorage.removeItem(STORAGE_KEY_INGREDIENTS);
      showToast('Демо-база успешно восстановлена');
    }
  };

  // Экспорт всей базы в файл JSON для бэкапа
  const handleExportData = () => {
    const exportBundle = {
      exportedAt: new Date().toISOString(),
      productsCount: products.length,
      ingredientsCount: ingredients.length,
      products,
      ingredients
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `inventory_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('База данных экспортирована в JSON');
  };

  // Подсчет товаров с низким остатком для бейджика в шапке
  const lowStockCount =
    products.filter(p => p.stockQty <= p.minThreshold).length +
    ingredients.filter(i => i.currentStock <= i.reorderLevel).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. Верхняя навигация и шапка с переключателем вкладок */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        productCount={products.length}
        ingredientCount={ingredients.length}
        lowStockCount={lowStockCount}
        onAddNew={() => {
          if (activeTab === 'ingredients') {
            setEditingIngredient(null);
            setIsIngredientModalOpen(true);
          } else {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }
        }}
        onResetData={handleResetData}
        onExportData={handleExportData}
      />

      {/* 2. Основная рабочая область (переключается в зависимости от активной вкладки) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ВКЛАДКА 1: База готовых продуктов с фильтрами */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <ProductFilters
              filters={productFilters}
              setFilters={setProductFilters}
              totalResults={filteredProducts.length}
              totalProducts={products.length}
              onReset={() => setProductFilters(initialProductFilters)}
            />

            <ProductList
              products={filteredProducts}
              onEdit={p => {
                setEditingProduct(p);
                setIsProductModalOpen(true);
              }}
              onDelete={handleDeleteProduct}
              onUpdateStock={handleUpdateProductStock}
            />
          </div>
        )}

        {/* ВКЛАДКА 2: База сырья и ингредиентов */}
        {activeTab === 'ingredients' && (
          <IngredientsView
            ingredients={ingredients}
            onAddIngredient={() => {
              setEditingIngredient(null);
              setIsIngredientModalOpen(true);
            }}
            onEditIngredient={item => {
              setEditingIngredient(item);
              setIsIngredientModalOpen(true);
            }}
            onDeleteIngredient={handleDeleteIngredient}
            onUpdateStock={handleUpdateIngredientStock}
          />
        )}

        {/* ВКЛАДКА 3: Аналитика остатков и предупреждения о дефиците */}
        {activeTab === 'analytics' && (
          <StockOverview
            products={products}
            ingredients={ingredients}
            onSelectProductTab={() => setActiveTab('products')}
            onSelectIngredientTab={() => setActiveTab('ingredients')}
          />
        )}
      </main>

      {/* Модальное окно добавления/редактирования товара */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />

      {/* Модальное окно добавления/редактирования сырья */}
      <IngredientModal
        isOpen={isIngredientModalOpen}
        onClose={() => {
          setIsIngredientModalOpen(false);
          setEditingIngredient(null);
        }}
        onSave={handleSaveIngredient}
        editingIngredient={editingIngredient}
      />

      {/* Всплывающее уведомление (Toast) об успешных действиях */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm animate-bounce">
          <span>✓</span> {toastMessage}
        </div>
      )}
    </div>
  );
}
