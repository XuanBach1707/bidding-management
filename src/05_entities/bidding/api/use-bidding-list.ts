'use client';

import { useState, useEffect, useCallback } from 'react';
import { http } from '@/shared/api';
import { 
  BiddingPackageListResponse, 
  BiddingPackagePaginatedSchema,
  BiddingPackage
} from '../model/types';

interface UseBiddingListReturn {
  items: BiddingPackage[];
  loading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  refresh: () => void;
  changePage: (page: number) => void;
  changeSize: (size: number) => void;
  handleSearch: (query: string) => void;
  handleChangeFilter: (key: string, value: string) => void;
}

// Params khởi tạo vẫn dùng page/size cho thân thiện với UI
interface InitialParams {
  page?: number;
  size?: number;
  search?: string;
}

export const useBiddingList = (
  initialParams: InitialParams = { page: 1, size: 9, search: '' }
): UseBiddingListReturn => {
  // State quản lý
  const [items, setItems] = useState<BiddingPackage[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: initialParams.page || 1,
    size: initialParams.size || 9,
    pages: 0,
  });
  const [searchQuery, setSearchQuery] = useState(initialParams.search || '');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- LOGIC GỌI API ---
  const fetchData = useCallback(async (page: number, size: number, search: string, currentFilters: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      // 1. TÍNH TOÁN SKIP & LIMIT
      const limit = size; 
      const skip = (page - 1) * size; 

      // 2. GỌI API với param limit/skip
      const body = await http.get<any, BiddingPackageListResponse>('/bidding-packages', {
        params: {
          limit, // Gửi limit = 9
          skip,  // Gửi skip = 0, 9, 18...
          search: search || undefined,
          ...currentFilters, 
        }
      });

      if (!body.success) {
        throw new Error(body.message || "Không thể tải dữ liệu.");
      }

      const parseResult = BiddingPackagePaginatedSchema.safeParse(body.data);

      if (parseResult.success) {
        const { items, total, pages } = parseResult.data;
        setItems(items);
        setMeta({ total, pages, page, size });
      } else {
        console.error("Zod Error:", parseResult.error);
        setItems([]);
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message || "Lỗi kết nối.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- EFFECTS & ACTIONS ---

  useEffect(() => {
    fetchData(meta.page, meta.size, searchQuery, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= (meta.pages || 1)) {
      fetchData(newPage, meta.size, searchQuery, filters);
    }
  };

  const changeSize = (newSize: number) => {
    // Reset về trang 1 khi đổi size
    fetchData(1, newSize, searchQuery, filters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset về trang 1 (skip = 0) khi search
    fetchData(1, meta.size, query, filters);
  };

  const handleChangeFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchData(1, meta.size, searchQuery, newFilters);
  };

  const refresh = () => {
    fetchData(meta.page, meta.size, searchQuery, filters);
  };

  return {
    items, loading, error, meta, refresh, changePage, changeSize, handleSearch, handleChangeFilter
  };
};