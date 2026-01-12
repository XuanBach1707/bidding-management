"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Loader2, Search, AlertCircle, Tags, X, ChevronDown } from "lucide-react";
import * as z from "zod";

// --- UI IMPORTS (Giữ nguyên) ---
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from "@/shared/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/shared/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/ui/select";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { Badge } from "@/shared/ui/badge";

import { ruleApi, ruleSchema, type Rule } from "@/entities/crawler";

// ==========================================
// 1. ZOD SCHEMAS & TYPES
// ==========================================

export const scheduleSchema = z.object({
  id: z.number().optional(),
  sourceUrl: z.string().url("URL nguồn không hợp lệ").min(1, "URL nguồn là bắt buộc"),
  cronExpression: z.string().min(1, "Cron expression là bắt buộc"),
  description: z.string().optional().default(""),
  isActive: z.boolean().default(true),
});

export type Schedule = z.infer<typeof scheduleSchema>;

export const ruleSchema = z.object({
  id: z.number().optional(),
  ruleName: z.string().min(1, "Tên luật không được để trống"),
  businessField: z.string().min(1, "Lĩnh vực kinh doanh là bắt buộc"),
  
  keywordsInclude: z.array(z.string()).default([]),
  keywordsExclude: z.array(z.string()).default([]),
  
  minBudget: z.coerce.number().min(0).default(0),
  maxBudget: z.coerce.number().min(0).default(0),
  
  locations: z.array(z.string()).default([]), 
  priority: z.coerce.number().int().min(1).default(1),
});

export type CrawlerRuleFormValues = z.infer<typeof ruleSchema>;

// ==========================================
// 2. HELPER COMPONENTS & FUNCTIONS
// ==========================================

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const readMoneyToText = (number: number) => {
  if (!number) return "";
  const config = { style: 'currency', currency: 'VND' } as const;
  return new Intl.NumberFormat('vi-VN', config).format(number);
};

const BudgetDisplay = ({ min, max }: { min: any, max: any }) => {
  const minNum = Number(min) || 0;
  const maxNum = Number(max) || 0;

  if (minNum === 0 && maxNum === 0) {
    return <span className="text-slate-400 text-xs italic">Không giới hạn</span>;
  }
  
  return (
    <div className="flex flex-col text-sm tabular-nums">
      <div className="flex justify-between gap-2">
         <span className="text-slate-500 text-[10px] uppercase w-8">Min:</span>
         <span className="font-medium text-slate-700">{formatCurrency(minNum)}</span>
      </div>
      <div className="flex justify-between gap-2">
         <span className="text-slate-500 text-[10px] uppercase w-8">Max:</span>
         <span className="font-medium text-slate-700">{maxNum === 0 ? "∞" : formatCurrency(maxNum)}</span>
      </div>
    </div>
  );
};

const PRIORITY_OPTIONS = [
  { value: 1, label: "1 - Rất Cao (Ưu tiên nhất)", color: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200" },
  { value: 2, label: "2 - Cao", color: "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200" },
  { value: 3, label: "3 - Trung bình", color: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" },
  { value: 4, label: "4 - Thấp", color: "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200" },
  { value: 5, label: "5 - Rất Thấp", color: "bg-slate-50 text-slate-500 hover:bg-slate-50 border-slate-200" },
];

const PriorityBadge = ({ value }: { value: number }) => {
  const option = PRIORITY_OPTIONS.find(p => p.value === value) || PRIORITY_OPTIONS[2];
  return (
    <Badge className={`border px-2 py-0.5 font-semibold ${option.color}`}>
      {option.label.split(" - ")[1]} 
    </Badge>
  );
};

const ArrayInput = ({ value = [], onChange, placeholder }: { value?: string[]; onChange: (val: string[]) => void; placeholder?: string }) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (Array.isArray(value)) setInputValue(value.join(", "));
  }, [value]);

  const handleBlur = () => {
    if (!inputValue.trim()) { onChange([]); return; }
    const arr = inputValue.split(",").map((s) => s.trim()).filter((s) => s !== "");
    onChange(arr);
    setInputValue(arr.join(", "));
  };

  return (
    <div className="space-y-2">
      <Textarea
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        className="min-h-[60px] resize-none focus-visible:ring-[#009d98]"
      />
      <div className="flex flex-wrap gap-1.5 min-h-[24px]">
        {value.length > 0 && value.map((item, idx) => (
            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
               {item}
            </span>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENT PROVINCE MULTI-SELECT ---
interface Province {
  name: string;
  code: number;
}

const ProvinceMultiSelect = ({ value = [], onChange }: { value?: string[]; onChange: (val: string[]) => void }) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
        const data = await res.json();
        setProvinces(data);
      } catch (error) {
        console.error("Failed to fetch provinces", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (provinceName: string) => {
    if (!value.includes(provinceName)) {
      onChange([...value, provinceName]);
    }
    setSearch(""); 
    inputRef.current?.focus(); 
  };

  const handleRemove = (provinceName: string) => {
    onChange(value.filter((item) => item !== provinceName));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && search === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const filteredProvinces = useMemo(() => {
    return provinces.filter(
      (p) => 
        !value.includes(p.name) && 
        p.name.toLowerCase().includes(search.toLowerCase()) 
    );
  }, [provinces, value, search]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="flex flex-wrap items-center gap-1.5 p-2 min-h-[42px] w-full rounded-md border border-slate-200 bg-white ring-offset-white focus-within:ring-2 focus-within:ring-[#009d98] focus-within:ring-offset-2 transition-all cursor-text"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {value.map((item, idx) => (
          <Badge 
            key={idx} 
            variant="secondary" 
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 pl-2 pr-1 py-0.5 flex items-center gap-1 h-7"
          >
            {item}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); 
                handleRemove(item);
              }}
              className="rounded-full p-0.5 hover:bg-slate-300 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </Badge>
        ))}

        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
          placeholder={value.length === 0 ? "Chọn tỉnh thành..." : ""}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        
        <div className="mr-1">
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400 opacity-50"/>}
        </div>
      </div>

      {open && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full rounded-md border border-slate-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="max-h-[250px] overflow-y-auto p-1">
            {filteredProvinces.length > 0 ? (
              filteredProvinces.map((p) => (
                <div
                  key={p.code}
                  className="flex items-center w-full px-2 py-2 text-sm text-slate-700 rounded-sm cursor-pointer hover:bg-slate-100 hover:text-[#009d98] transition-colors"
                  onClick={() => handleSelect(p.name)}
                >
                  {p.name}
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-slate-500">
                {search ? "Không tìm thấy tỉnh nào" : "Đã chọn tất cả"}
              </div>
            )}
          </div>
        </div>
      )}
      
      {value.length === 0 && <p className="text-[10px] text-slate-400 mt-1 italic pl-1">Để trống trường này nếu muốn tìm toàn quốc</p>}
    </div>
  );
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export const CrawlerRuleManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: rules, isLoading } = useQuery({
    queryKey: ["crawler-rules"],
    queryFn: ruleApi.getAll,
  });

  const form = useForm<CrawlerRuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      ruleName: "", 
      businessField: "", 
      keywordsInclude: [], 
      keywordsExclude: [],
      minBudget: 0, 
      maxBudget: 0, 
      locations: [], 
      priority: 3, 
    },
  });

  // --- LOGIC KIỂM TRA PRIORITY ĐÃ DÙNG ---
  const usedPriorities = useMemo(() => {
    if (!rules || !Array.isArray(rules)) return [];
    // Nếu đang Edit, bỏ qua priority của chính rule đang edit
    return rules
      .filter((r) => r.id !== editingId)
      .map((r) => r.priority);
  }, [rules, editingId]);

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: ruleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler-rules"] });
      setIsOpen(false);
      form.reset();
      toast({ title: "Thành công", description: "Luật Crawler mới đã được kích hoạt.", className: "bg-[#009d98] text-white border-none" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; data: Partial<Rule> }) => ruleApi.update(vars.id, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler-rules"] });
      setIsOpen(false);
      setEditingId(null);
      form.reset();
      toast({ title: "Cập nhật thành công", description: "Các thay đổi đã được lưu.", className: "bg-[#009d98] text-white border-none" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ruleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler-rules"] });
      toast({ title: "Đã xóa", description: "Luật đã bị loại bỏ khỏi hệ thống." });
    },
  });

  const onSubmit = (values: CrawlerRuleFormValues) => {
    const payload = values as unknown as Rule; 
    editingId ? updateMutation.mutate({ id: editingId, data: payload }) : createMutation.mutate(payload);
  };

  const handleEdit = (item: Rule) => {
    setEditingId(item.id!);
    form.reset({
      ruleName: item.ruleName, 
      businessField: item.businessField,
      keywordsInclude: item.keywordsInclude || [], 
      keywordsExclude: item.keywordsExclude || [],
      minBudget: item.minBudget, 
      maxBudget: item.maxBudget,
      locations: item.locations || [], 
      priority: item.priority
    });
    setIsOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    form.reset({
      ruleName: "", 
      businessField: "", 
      keywordsInclude: [], 
      keywordsExclude: [],
      minBudget: 0, 
      maxBudget: 0, 
      locations: [], 
      // Tìm priority trống đầu tiên để làm default (UX tốt hơn)
      priority: (() => {
         const used = rules?.map(r => r.priority) || [];
         const available = [3, 2, 4, 1, 5].find(p => !used.includes(p));
         return available || 3;
      })(),
    });
    setIsOpen(true);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
        <Loader2 className="h-8 w-8 text-[#009d98] animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Đang tải danh sách luật...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* --- HEADER CONTROL --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <div className="relative max-w-sm">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <Input placeholder="Tìm kiếm luật..." className="pl-9 bg-white w-[300px]" />
           </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="bg-[#009d98] hover:bg-[#008580] text-white shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Thêm luật mới
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 {editingId ? <Pencil className="w-5 h-5 text-[#009d98]" /> : <Plus className="w-5 h-5 text-[#009d98]" />}
                 {editingId ? "Cập nhật cấu hình luật" : "Thêm luật Crawler mới"}
              </DialogTitle>
              <DialogDescription>
                 Thiết lập các tham số để bot tự động quét gói thầu phù hợp.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                
                {/* 1. THÔNG TIN CHUNG */}
                <div className="grid grid-cols-2 gap-5 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <FormField
                      control={form.control}
                      name="ruleName"
                      render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel className="text-slate-700 font-bold">Tên luật <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input {...field} placeholder="VD: Gói thầu IT Miền Bắc" className="bg-white" value={field.value as string} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="businessField"
                      render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel className="text-slate-700 font-bold">Lĩnh vực <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Chọn lĩnh vực" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Xây lắp">Xây lắp</SelectItem>
                              <SelectItem value="Hàng hóa">Hàng hóa</SelectItem>
                              <SelectItem value="Hỗn hợp">Hỗn hợp</SelectItem>
                              <SelectItem value="Phi tư vấn">Phi tư vấn</SelectItem>
                              <SelectItem value="Tư vấn">Tư vấn</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-slate-700 font-bold">Độ ưu tiên (Duy nhất)</FormLabel>
                          <Select value={field.value?.toString()} onValueChange={(val) => field.onChange(Number(val))}>
                            <FormControl>
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Chọn độ ưu tiên" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PRIORITY_OPTIONS.map((opt) => {
                                const isDisabled = usedPriorities.includes(opt.value);
                                return (
                                  <SelectItem key={opt.value} value={opt.value.toString()} disabled={isDisabled} className={isDisabled ? "opacity-50" : ""}>
                                     <div className="flex items-center justify-between w-full min-w-[200px]">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${opt.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                                            {opt.label}
                                        </div>
                                        {isDisabled && <span className="text-[10px] text-red-400 font-medium ml-2">(Đã dùng)</span>}
                                     </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          {/* Hiển thị lỗi nếu user cố tình chọn (dù UI đã chặn) hoặc khi edit bị conflict */}
                          {usedPriorities.includes(field.value) && editingId === null && (
                             <FormMessage className="text-red-500">Độ ưu tiên này đã được sử dụng bởi luật khác.</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                </div>

                {/* 2. TỪ KHÓA & ĐỊA ĐIỂM */}
                <div className="grid grid-cols-2 gap-5">
                     <FormField
                      control={form.control}
                      name="keywordsInclude"
                      render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel className="text-slate-700 font-bold flex items-center gap-1">
                             <Tags size={14} /> Từ khóa bao gồm
                          </FormLabel>
                          <FormControl>
                            <ArrayInput value={field.value as string[]} onChange={field.onChange} placeholder="VD: laptop, server, phần mềm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="keywordsExclude"
                      render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel className="text-slate-700 font-bold flex items-center gap-1">
                             <AlertCircle size={14} /> Từ khóa loại trừ
                          </FormLabel>
                          <FormControl>
                            <ArrayInput value={field.value as string[]} onChange={field.onChange} placeholder="VD: sửa chữa, thanh lý" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="locations"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-slate-700 font-bold">Địa điểm / Tỉnh thành</FormLabel>
                          <FormControl>
                             <ProvinceMultiSelect value={field.value as string[]} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                {/* 3. NGÂN SÁCH */}
                <div className="p-4 rounded-lg border border-dashed border-slate-300 grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-bold text-xs uppercase">Ngân sách tối thiểu (VND)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} className="font-mono" />
                          </FormControl>
                          {(field.value as number) > 0 && <FormDescription className="text-[#009d98] text-xs font-medium">{readMoneyToText(field.value as number)}</FormDescription>}
                        </FormItem>
                      )}
                    />
                      <FormField
                      control={form.control}
                      name="maxBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-bold text-xs uppercase">Ngân sách tối đa (VND)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} className="font-mono" />
                          </FormControl>
                          {(field.value as number) > 0 && <FormDescription className="text-[#009d98] text-xs font-medium">{readMoneyToText(field.value as number)}</FormDescription>}
                        </FormItem>
                      )}
                    />
                </div>

                <DialogFooter>
                   <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Hủy bỏ</Button>
                   <Button type="submit" className="bg-[#009d98] hover:bg-[#008580] text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                      {createMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                      {editingId ? "Lưu thay đổi" : "Tạo mới"}
                   </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- TABLE LIST (GIỮ NGUYÊN) --- */}
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-slate-50 border-slate-200">
              <TableHead className="w-[50px] font-bold text-slate-700">#</TableHead>
              <TableHead className="font-bold text-slate-700">Tên luật & Lĩnh vực</TableHead>
              <TableHead className="font-bold text-slate-700">Từ khóa (Tags)</TableHead>
              <TableHead className="font-bold text-slate-700 min-w-[150px]">Ngân sách</TableHead>
              <TableHead className="font-bold text-slate-700">Độ ưu tiên</TableHead> 
              <TableHead className="text-right font-bold text-slate-700">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!rules || rules.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={6} className="h-40 text-center text-slate-500">
                      Chưa có luật nào được thiết lập. Hãy thêm luật mới để bắt đầu.
                   </TableCell>
                </TableRow>
            ) : (
                rules.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                    <TableCell className="text-slate-500 text-xs font-mono">{index + 1}</TableCell>
                    <TableCell>
                       <div className="font-bold text-slate-800 text-sm">{item.ruleName}</div>
                       <div className="text-xs text-slate-500 mt-0.5">{item.businessField || "—"}</div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-wrap gap-1 max-w-[250px]">
                          {item.keywordsInclude?.slice(0, 3).map((k, i) => (
                             <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {k}
                             </span>
                          ))}
                          {(item.keywordsInclude?.length || 0) > 3 && (
                             <span className="text-[10px] text-slate-400 pl-1">+{ (item.keywordsInclude?.length || 0) - 3 }</span>
                          )}
                       </div>
                    </TableCell>
                    <TableCell>
                        <BudgetDisplay min={item.minBudget} max={item.maxBudget} />
                    </TableCell>
                    <TableCell>
                        <PriorityBadge value={item.priority} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 text-slate-500 hover:text-[#009d98] hover:bg-[#009d98]/10"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id!)} className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};