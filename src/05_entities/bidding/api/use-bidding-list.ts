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
}

export const useBiddingList = (
  initialParams: InitialParams = { page: 1, size: 9, search: '' }
): UseBiddingListReturn => {
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

  const fetchData = useCallback(async (page: number, size: number, search: string, currentFilters: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const limit = size; 
      const skip = (page - 1) * size; 
      const statusParam = currentFilters['status'];

      // [LOGIC MỚI]: Xử lý gọi nhiều API nếu status có dấu phẩy
      let responseData: { items: BiddingPackage[], total: number } = { items: [], total: 0 };

      if (statusParam && statusParam.includes(',')) {
        // 1. Tách các status: "NEW,INTERESTED" -> ["NEW", "INTERESTED"]
        const statuses = statusParam.split(',').map(s => s.trim());
        
        // 2. Gọi song song (Parallel Requests)
        const promises = statuses.map(status => {
           // Tạo bản sao filter nhưng ghi đè status đơn lẻ
           const singleFilter = { ...currentFilters, status };
           return http.get<any, BiddingPackageListResponse>('/bidding-packages', {
              params: { limit, skip, search: search || undefined, ...singleFilter }
           });
        });

        const responses = await Promise.all(promises);

        // 3. Gộp kết quả
        // Lưu ý: Việc gộp này có thể khiến số lượng item hiển thị > size (VD: 9 + 9 = 18 item)
        // Nhưng với nghiệp vụ cần xem hết thì chấp nhận được.
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
        
        // (Tùy chọn) Sort lại theo ngày tạo nếu cần thiết để danh sách merged trông hợp lý
        // combinedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        responseData = { items: combinedItems, total: combinedTotal };

      } else {
        // [LOGIC CŨ]: Gọi 1 API bình thường
        const body = await http.get<any, BiddingPackageListResponse>('/bidding-packages', {
          params: { limit, skip, search: search || undefined, ...currentFilters }
        });

        if (!body.success) throw new Error(body.message || "Không thể tải dữ liệu.");
        
        const parseResult = BiddingPackagePaginatedSchema.safeParse(body.data);
        if (parseResult.success) {
           responseData = parseResult.data;
        }
      }

      // Cập nhật State
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

  useEffect(() => {
    fetchData(meta.page, meta.size, searchQuery, filters);
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