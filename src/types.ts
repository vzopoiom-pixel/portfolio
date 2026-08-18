/**
 * ============================================================================
 * ТИПЫ ДАННЫХ ДЛЯ БАЗЫ ПРОДУКТОВ И СЫРЬЯ (VaporCore Inventory Engine)
 * ============================================================================
 * Этот файл описывает структуру (TypeScript Interfaces), чтобы все элементы
 * в приложении имели четкий формат и TypeScript страховал от ошибок и опечаток.
 */

/**
 * Структура готового товара (ProductItem):
 * - id: уникальный идентификатор записи (например, prod-101)
 * - name: полное коммерческое название
 * - sku: артикул для склада и кассы (например, SKU-SB-03-60-ICED)
 * - flavors: массив вкусов (для мульти-поиска: Клубника, Ментол и т.д.)
 * - mg: крепость никотина в миллиграммах (0, 3, 6, 12, 18)
 * - bottleSize: объем флакона (30ml, 60ml, 100ml, 120ml)
 * - isIced: флаг наличия холодка/кулера (true = с холодком, false = классика)
 * - stockQty: текущий остаток на складе (в штуках)
 * - minThreshold: минимальный порог, ниже которого загорается предупреждение
 * - unitPrice: розничная цена в долларах
 * - category: категория вкусовой линейки (Фрукты, Десерты, Табак и т.д.)
 * - notes: опциональные заметки (особенности замеса, партии, сезонность)
 * - updatedAt: дата последнего изменения записи
 */
export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  flavors: string[];
  mg: number;
  bottleSize: string;
  isIced: boolean;
  stockQty: number;
  minThreshold: number;
  unitPrice: number;
  category: string;
  notes?: string;
  updatedAt: string;
}

/**
 * Структура сырья и ингредиентов (IngredientItem):
 * - brandSupplier: поставщик/производитель ароматизатора или основы (TFA, Capella и др.)
 * - flavorProfile: профиль аромата (Сладкий, Мята, Манго)
 * - category: тип сырья (Ароматизатор, Основа PG/VG, Никотин, Добавка)
 * - size: фасовка сырья (Галлон, Пробник 10мл, Бочка 55 галлонов)
 * - currentStock: количество в наличии
 * - costPerUnit: себестоимость за единицу
 * - batchLotNumber: номер производственной партии (LOT #) для отслеживания качества
 */
export interface IngredientItem {
  id: string;
  name: string;
  brandSupplier: string;
  flavorProfile: string[];
  category: 'Flavoring' | 'Base (PG/VG)' | 'Nicotine / Salt' | 'Cooling / Additive' | 'Packaging';
  size: '10ml Sample' | '60ml Bottle' | '250ml Jug' | '1 Gallon' | '5 Gallon Drum' | '55 Gallon Drum';
  currentStock: number;
  unit: string;
  costPerUnit: number;
  reorderLevel: number;
  batchLotNumber: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
}

/** Вкладки приложения: товары, сырье или аналитика */
export type ActiveTab = 'products' | 'ingredients' | 'analytics' | 'quick-pos';

/**
 * Состояние фильтрации готовых товаров:
 * Хранит активные параметры фильтра (выбранные вкусы, крепость, объем, охлаждение).
 */
export interface FilterState {
  searchQuery: string;
  flavors: string[];
  mg: number | 'all';
  bottleSize: string | 'all';
  icedOnly: boolean | null; // true = только с холодком, false = только без, null = любые
  category: string | 'all';
  stockStatus: 'all' | 'in_stock' | 'low_stock';
}

/** Состояние фильтрации для сырья и компонентов */
export interface IngredientFilterState {
  searchQuery: string;
  brand: string | 'all';
  category: string | 'all';
  size: string | 'all';
  status: 'all' | 'In Stock' | 'Low Stock' | 'Out of Stock';
}
