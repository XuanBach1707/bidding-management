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

interface InitialParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

export const useBiddingList = (
  initialParams: InitialParams = { page: 1, size: 9, search: '', status: '' }
): UseBiddingListReturn => {
  const [items, setItems] = useState<BiddingPackage[]>([]);
  
  const [meta, setMeta] = useState({
    total: 0,
    page: initialParams.page || 1,
    size: initialParams.size || 9,
    pages: 0,
  });

  const [searchQuery, setSearchQuery] = useState(initialParams.search || '');

  /**
   * FIX: Khởi tạo filters từ initialParams.status ngay lập tức.
   * Dùng Type Assertion 'as' để tránh lỗi Record<string, string> của TS.
   */
  const [filters, setFilters] = useState<Record<string, string>>(
    (initialParams.status ? { status: initialParams.status } : {}) as Record<string, string>
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (page: number, size: number, search: string, currentFilters: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const limit = size; 
      const skip = (page - 1) * size; 
      const statusParam = currentFilters['status'];

      let responseData: { items: BiddingPackage[], total: number } = { items: [], total: 0 };

      // [LOGIC XỬ LÝ NHIỀU STATUS SONG SONG]
      if (statusParam && statusParam.includes(',')) {
        const statuses = statusParam.split(',').map(s => s.trim());
        
        const promises = statuses.map(status => {
           const singleFilter = { ...currentFilters, status };
           return http.get<any, BiddingPackageListResponse>('/bidding-packages', {
              params: { limit, skip, search: search || undefined, ...singleFilter }
           });
        });

        const responses = await Promise.all(promises);

        let combinedItems: BiddingPackage[] = [];
        let combinedTotal = 0;

        for (const res of responses) {
           if (res.success && res.data) {
              const parsed = BiddingPackagePaginatedSchema.safeParse(res.data);
              if (parsed.success) {
                  combinedItems = [...combinedItems, ...parsed.data.items];
                  combinedTotal += parsed.data.total;
              }
           }
        }
        
        responseData = { items: combinedItems, total: combinedTotal };

      } else {
        // [LOGIC GỌI 1 API BÌNH THƯỜNG]
        const body = await http.get<any, BiddingPackageListResponse>('/bidding-packages', {
          params: { limit, skip, search: search || undefined, ...currentFilters }
        });

        if (!body.success) throw new Error(body.message || "Không thể tải dữ liệu.");
        
        const parseResult = BiddingPackagePaginatedSchema.safeParse(body.data);
        if (parseResult.success) {
            responseData = parseResult.data;
        }
      }

      setItems(responseData.items);
      setMeta({ 
        total: responseData.total, 
        pages: Math.ceil(responseData.total / size), 
        page, 
        size 
      });

    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message || "Lỗi kết nối.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * FIX: Dòng 131 - Dùng Type Assertion để TS không bắt bẻ object rỗng.
   */
  useEffect(() => {
    const initialFilters = (initialParams.status 
      ? { status: initialParams.status } 
      : {}) as Record<string, string>;

    fetchData(
      meta.page, 
      meta.size, 
      searchQuery, 
      initialFilters
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const changePage = (newPage: number) => {
    if (newPage > 0) fetchData(newPage, meta.size, searchQuery, filters);
  };

  const changeSize = (newSize: number) => {
    fetchData(1, newSize, searchQuery, filters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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