"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// [FIX] Import thêm type Resolver để ép kiểu cho zodResolver
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus, Pencil, Trash2, Loader2, Search, AlertCircle, Tags, MoreHorizontal, 
  X, ChevronDown, Building2, MapPin, Home 
} from "lucide-react";

// --- UI IMPORTS ---
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

// [QUAN TRỌNG] Import từ Entity chuẩn
import { 
  ruleApi, 
  ruleSchema, 
  type Rule, 
  type ProvinceV2, 
  type WardV2 
} from "@/entities/crawler"; 

// ==========================================
// 1. API & HOOKS
// ==========================================

// Hook lấy danh sách Tỉnh (API V2)
const useProvincesList = () => {
  return useQuery({
    queryKey: ["provinces-list"],
    queryFn: async () => {
      const res = await fetch(`https://provinces.open-api.vn/api/v2/p/?depth=2`);
      if (!res.ok) throw new Error("Failed to fetch provinces");
      return (await res.json()) as { code: number; name: string }[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// Hook lấy chi tiết xã/phường từ danh sách tỉnh đã chọn
const useCommunesFromProvinces = (selectedProvinceNames: string[]) => {
  const { data: allProvinces } = useProvincesList();

  // Map tên tỉnh sang code
  const selectedCodes = useMemo(() => {
    if (!allProvinces || selectedProvinceNames.length === 0) return [];
    return allProvinces
      .filter((p) => selectedProvinceNames.includes(p.name))
      .map((p) => p.code);
  }, [allProvinces, selectedProvinceNames]);

  return useQuery({
    queryKey: ["provinces-v2-wards", selectedCodes],
    queryFn: async () => {
      if (selectedCodes.length === 0) return [];
      
      const requests = selectedCodes.map(code => 
        fetch(`https://provinces.open-api.vn/api/v2/p/${code}?depth=2`).then(res => res.json())
      );
      
      const results = await Promise.all(requests) as ProvinceV2[];
      
      const flatCommunes: { name: string; provinceName: string; filterText: string }[] = [];
      results.forEach(province => {
        if (province.wards && Array.isArray(province.wards)) {
          province.wards.forEach((ward: WardV2) => {
             flatCommunes.push({
               name: ward.name,
               provinceName: province.name,
               filterText: `${ward.name} ${province.name}`.toLowerCase()
             });
          });
        }
      });
      return flatCommunes;
    },
    enabled: selectedCodes.length > 0,
    staleTime: 1000 * 60 * 30, // 30 mins
  });
};

// ==========================================
// 2. UI COMPONENTS (Helpers)
// ==========================================

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const readMoneyToText = (number: number) => !number ? "" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);

const BudgetDisplay = ({ min, max }: { min: any, max: any }) => {
  const minNum = Number(min) || 0;
  const maxNum = Number(max) || 0;
  if (minNum === 0 && maxNum === 0) return <span className="text-slate-400 text-xs italic">Không giới hạn</span>;
  return (
    <div className="flex flex-col text-sm tabular-nums">
      <div className="flex justify-between gap-2"><span className="text-slate-500 text-[10px] uppercase w-8">Min:</span><span className="font-medium text-slate-700">{formatCurrency(minNum)}</span></div>
      <div className="flex justify-between gap-2"><span className="text-slate-500 text-[10px] uppercase w-8">Max:</span><span className="font-medium text-slate-700">{maxNum === 0 ? "∞" : formatCurrency(maxNum)}</span></div>
    </div>
  );
};

const PRIORITY_OPTIONS = [
  { value: 1, label: "1 - Rất Cao", color: "bg-red-100 text-red-700 border-red-200" },
  { value: 2, label: "2 - Cao", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: 3, label: "3 - Trung bình", color: "bg-blue-100 text-blue-700 border-blue-200" }, 
  { value: 4, label: "4 - Thấp", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: 5, label: "5 - Rất Thấp", color: "bg-slate-50 text-slate-500 border-slate-200" },
];

const PriorityBadge = ({ value }: { value: number }) => {
  const option = PRIORITY_OPTIONS.find(p => p.value === value) || PRIORITY_OPTIONS[2];
  // Hiển thị text ngắn gọn nhưng giữ style
  const label = option.label.includes(" - ") ? option.label.split(" - ")[1] : option.label;
  return <Badge className={`border px-2 py-0.5 font-semibold whitespace-nowrap ${option.color}`}>{label}</Badge>;
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
        {value.map((item, idx) => <span key={idx} className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{item}</span>)}
      </div>
    </div>
  );
};

const ProvinceMultiSelect = ({ value = [], onChange }: { value?: string[]; onChange: (val: string[]) => void }) => {
  const { data: provinces = [], isLoading } = useProvincesList();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (name: string) => { if (!value.includes(name)) onChange([...value, name]); setSearch(""); inputRef.current?.focus(); };
  const handleRemove = (name: string) => onChange(value.filter((i) => i !== name));
  const filtered = useMemo(() => provinces.filter(p => !value.includes(p.name) && p.name.toLowerCase().includes(search.toLowerCase())), [provinces, value, search]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex flex-wrap items-center gap-1.5 p-2 min-h-[42px] w-full rounded-md border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-[#009d98] cursor-text" onClick={() => { setOpen(true); inputRef.current?.focus(); }}>
        {value.map((item, idx) => (
          <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-700 border-slate-300 pl-2 pr-1 h-7 flex gap-1">
            {item}<button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(item); }} className="hover:text-red-500"><X size={14} /></button>
          </Badge>
        ))}
        <input ref={inputRef} className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-slate-400" placeholder={value.length === 0 ? "Chọn tỉnh thành..." : ""} value={search} onChange={(e) => { setSearch(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={(e) => { if (e.key === "Backspace" && !search && value.length > 0) onChange(value.slice(0, -1)); }} />
        <div className="mr-1">{isLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400"/> : <ChevronDown className="h-4 w-4 text-slate-400 opacity-50"/>}</div>
      </div>
      {open && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full rounded-md border border-slate-200 bg-white shadow-lg max-h-[250px] overflow-y-auto p-1">
          {filtered.length > 0 ? filtered.map(p => <div key={p.code} className="px-2 py-2 text-sm hover:bg-slate-100 cursor-pointer rounded-sm" onClick={() => handleSelect(p.name)}>{p.name}</div>) : <div className="py-4 text-center text-sm text-slate-500">Không tìm thấy</div>}
        </div>
      )}
    </div>
  );
};

const CommuneMultiSelect = ({ value = [], onChange, provinceNames = [] }: { value?: string[]; onChange: (val: string[]) => void; provinceNames: string[] }) => {
  const { data: communes = [], isLoading } = useCommunesFromProvinces(provinceNames);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (name: string) => { if (!value.includes(name)) onChange([...value, name]); setSearch(""); inputRef.current?.focus(); };
  const handleRemove = (name: string) => onChange(value.filter((i) => i !== name));
  
  const [filtered, totalResults] = useMemo(() => {
    let result = communes.filter(c => !value.includes(c.name));
    if (search) {
        const lowerSearch = search.toLowerCase();
        result = result.filter(c => c.filterText.includes(lowerSearch));
    }
    return [result.slice(0, 100), result.length];
  }, [communes, value, search]);

  const isDisabled = provinceNames.length === 0;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className={`flex flex-wrap items-center gap-1.5 p-2 min-h-[42px] w-full rounded-md border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-[#009d98] cursor-text ${isDisabled ? 'bg-slate-50 cursor-not-allowed' : ''}`} onClick={() => { if(!isDisabled) { setOpen(true); inputRef.current?.focus(); } }}>
        {value.map((item, idx) => (
          <Badge key={idx} variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 pl-2 pr-1 h-7 flex gap-1">
            {item}<button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(item); }} className="hover:text-red-500"><X size={14} /></button>
          </Badge>
        ))}
        <input ref={inputRef} disabled={isDisabled} className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-slate-400 disabled:cursor-not-allowed" placeholder={isDisabled ? "Vui lòng chọn Tỉnh/Thành trước" : (value.length === 0 ? "Chọn xã/phường..." : "")} value={search} onChange={(e) => { setSearch(e.target.value); setOpen(true); }} onFocus={() => !isDisabled && setOpen(true)} onKeyDown={(e) => { if (e.key === "Backspace" && !search && value.length > 0) onChange(value.slice(0, -1)); }} />
        <div className="mr-1">{isLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400"/> : <ChevronDown className="h-4 w-4 text-slate-400 opacity-50"/>}</div>
      </div>
      
      {open && !isDisabled && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full rounded-md border border-slate-200 bg-white shadow-lg max-h-[300px] overflow-y-auto p-1">
          {filtered.length > 0 ? (
            <>
                {filtered.map((c, idx) => (
                    <div key={idx} className="px-2 py-2 text-sm hover:bg-slate-100 cursor-pointer rounded-sm border-b border-slate-50 last:border-0 flex justify-between items-center group" onClick={() => handleSelect(c.name)}>
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-500">{c.provinceName}</span>
                    </div>
                ))}
                {totalResults > 100 && (
                    <div className="py-2 text-center text-xs text-slate-400 italic bg-slate-50">
                        Còn {totalResults - 100} kết quả khác. Hãy nhập để tìm kiếm chi tiết.
                    </div>
                )}
            </>
          ) : (
            <div className="py-4 text-center text-sm text-slate-500">{search ? "Không tìm thấy" : "Nhập để tìm kiếm..."}</div>
          )}
        </div>
      )}
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

  const { data: rules, isLoading } = useQuery({ queryKey: ["crawler-rules"], queryFn: ruleApi.getAll });

  // [FIX] Truyền Type Rule vào useForm để TS hiểu chính xác cấu trúc Form
  const form = useForm<Rule>({
    // [FIX] Thêm 'as Resolver<Rule>' để ép kiểu, bỏ qua lỗi mismatch của Zod
    resolver: zodResolver(ruleSchema) as Resolver<Rule>, 
    defaultValues: {
      ruleName: "", 
      businessField: "", 
      keywordsInclude: [], 
      keywordsExclude: [],
      minBudget: 0, 
      maxBudget: 0, 
      locations: [], 
      investor: [], 
      commune: [],
      priority: 3, 
    },
  });

  const selectedLocations = useWatch({ control: form.control, name: "locations" });
  
  // Logic kiểm tra độ ưu tiên trùng
  const usedPriorities = useMemo(() => {
    if (!rules || !Array.isArray(rules)) return [];
    return rules.filter((r) => r.id !== editingId).map((r) => r.priority);
  }, [rules, editingId]);

  const createMutation = useMutation({
    mutationFn: ruleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler-rules"] });
      setIsOpen(false); form.reset();
      toast({ title: "Thành công", description: "Luật Crawler mới đã được kích hoạt.", className: "bg-[#009d98] text-white border-none" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; data: Partial<Rule> }) => ruleApi.update(vars.id, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler-rules"] });
      setIsOpen(false); setEditingId(null); form.reset();
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

  const onSubmit = (values: Rule) => {
    editingId ? updateMutation.mutate({ id: editingId, data: values }) : createMutation.mutate(values);
  };

  const handleEdit = (item: Rule) => {
    setEditingId(item.id!);
    form.reset({
      ruleName: item.ruleName, businessField: item.businessField,
      keywordsInclude: item.keywordsInclude || [], keywordsExclude: item.keywordsExclude || [],
      minBudget: item.minBudget, maxBudget: item.maxBudget,
      locations: item.locations || [], investor: item.investor || [], commune: item.commune || [],   
      priority: item.priority
    });
    setIsOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    form.reset({
      ruleName: "", businessField: "", 
      keywordsInclude: [], keywordsExclude: [],
      minBudget: 0, maxBudget: 0, 
      locations: [], investor: [], commune: [],
      priority: (() => {
         const used = rules?.map(r => r.priority) || [];
         const available = [3, 2, 4, 1, 5].find(p => !used.includes(p));
         return available || 3;
      })(),
    });
    setIsOpen(true);
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200"><Loader2 className="h-8 w-8 text-[#009d98] animate-spin mb-4" /><p className="text-slate-500 text-sm">Đang tải danh sách luật...</p></div>;

  return (
    <div className="space-y-6">
      {/* HEADER CONTROL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto">
           <div className="relative w-full md:w-[350px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <Input placeholder="Tìm kiếm luật..." className="pl-9 bg-white w-full" />
           </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="w-full md:w-auto bg-[#009d98] hover:bg-[#008580] text-white shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Thêm luật mới
            </Button>
          </DialogTrigger>
          
          {/* [MOBILE FIX] Form Dialog Responsive */}
          <DialogContent className="w-[95%] max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 {editingId ? <Pencil className="w-5 h-5 text-[#009d98]" /> : <Plus className="w-5 h-5 text-[#009d98]" />}
                 {editingId ? "Cập nhật cấu hình" : "Thêm luật mới"}
              </DialogTitle>
              <DialogDescription>
                 Thiết lập tham số tìm kiếm tự động.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                
                {/* 1. THÔNG TIN CHUNG - Grid 1 cột trên Mobile, 2 cột trên PC */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <FormField<Rule> control={form.control} name="ruleName" render={({ field }) => <FormItem className="col-span-2 md:col-span-1"><FormLabel className="text-slate-700 font-bold">Tên luật <span className="text-red-500">*</span></FormLabel><FormControl><Input {...field} placeholder="VD: Gói thầu IT" className="bg-white" value={field.value as string} /></FormControl><FormMessage /></FormItem>} />
                    <FormField<Rule> control={form.control} name="businessField" render={({ field }) => <FormItem className="col-span-2 md:col-span-1"><FormLabel className="text-slate-700 font-bold">Lĩnh vực <span className="text-red-500">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value as string}><FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Chọn lĩnh vực" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Xây lắp">Xây lắp</SelectItem><SelectItem value="Hàng hóa">Hàng hóa</SelectItem><SelectItem value="Hỗn hợp">Hỗn hợp</SelectItem><SelectItem value="Phi tư vấn">Phi tư vấn</SelectItem><SelectItem value="Tư vấn">Tư vấn</SelectItem></SelectContent></Select><FormMessage /></FormItem>} />
                    <FormField<Rule> 
                      control={form.control} 
                      name="priority" 
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-slate-700 font-bold">Độ ưu tiên (Duy nhất)</FormLabel>
                          <Select 
                            value={field.value?.toString()} 
                            onValueChange={(val) => field.onChange(Number(val))}
                          >
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
                          
                          {/* [FIX] Thêm 'as number' để báo cho TS biết đây chắc chắn là số */}
                          {usedPriorities.includes(field.value as number) && editingId === null && (
                            <FormMessage className="text-red-500">Độ ưu tiên này đã được sử dụng bởi luật khác.</FormMessage>
                          )}
                        </FormItem>
                      )} 
                    />
                </div>

                {/* 2. TỪ KHÓA & ĐỊA ĐIỂM (New Fields from Master) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField<Rule> control={form.control} name="keywordsInclude" render={({ field }) => <FormItem className="col-span-2 md:col-span-1"><FormLabel className="text-slate-700 font-bold flex items-center gap-1"><Tags size={14} /> Từ khóa bao gồm</FormLabel><FormControl><ArrayInput value={field.value as string[]} onChange={field.onChange} placeholder="VD: laptop, server" /></FormControl><FormMessage /></FormItem>} />
                      <FormField<Rule> control={form.control} name="keywordsExclude" render={({ field }) => <FormItem className="col-span-2 md:col-span-1"><FormLabel className="text-slate-700 font-bold flex items-center gap-1"><AlertCircle size={14} /> Từ khóa loại trừ</FormLabel><FormControl><ArrayInput value={field.value as string[]} onChange={field.onChange} placeholder="VD: cũ, hỏng" /></FormControl><FormMessage /></FormItem>} />
                      <FormField<Rule> control={form.control} name="locations" render={({ field }) => <FormItem className="col-span-2 md:col-span-1"><FormLabel className="text-slate-700 font-bold flex items-center gap-1"><MapPin size={14} /> Tỉnh / Thành phố</FormLabel><FormControl><ProvinceMultiSelect value={field.value as string[]} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>} />
                      <FormField<Rule> control={form.control} name="commune" render={({ field }) => <FormItem className="col-span-2 md:col-span-1"><FormLabel className="text-slate-700 font-bold flex items-center gap-1"><Home size={14} /> Phường / Xã (Theo tỉnh)</FormLabel><FormControl><CommuneMultiSelect value={field.value as string[]} onChange={field.onChange} provinceNames={selectedLocations || []} /></FormControl><FormMessage /></FormItem>} />
                      <FormField<Rule> control={form.control} name="investor" render={({ field }) => <FormItem className="col-span-2"><FormLabel className="text-slate-700 font-bold flex items-center gap-1"><Building2 size={14} /> Chủ đầu tư</FormLabel><FormControl><ArrayInput value={field.value as string[]} onChange={field.onChange} placeholder="VD: Ban quản lý dự án, EVN..." /></FormControl><FormMessage /></FormItem>} />
                </div>

                {/* 3. NGÂN SÁCH - Mobile vẫn giữ 2 cột vì số ngắn */}
                <div className="p-4 rounded-lg border border-dashed border-slate-300 grid grid-cols-2 gap-4">
                    <FormField<Rule> control={form.control} name="minBudget" render={({ field }) => <FormItem><FormLabel className="text-slate-700 font-bold text-xs uppercase">Min (VND)</FormLabel><FormControl><Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} className="font-mono" /></FormControl>{(field.value as number) > 0 && <FormDescription className="text-[#009d98] text-[10px] md:text-xs font-medium truncate">{readMoneyToText(field.value as number)}</FormDescription>}</FormItem>} />
                    <FormField<Rule> control={form.control} name="maxBudget" render={({ field }) => <FormItem><FormLabel className="text-slate-700 font-bold text-xs uppercase">Max (VND)</FormLabel><FormControl><Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} className="font-mono" /></FormControl>{(field.value as number) > 0 && <FormDescription className="text-[#009d98] text-[10px] md:text-xs font-medium truncate">{readMoneyToText(field.value as number)}</FormDescription>}</FormItem>} />
                </div>

                <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                   <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">Hủy bỏ</Button>
                   <Button type="submit" className="w-full sm:w-auto bg-[#009d98] hover:bg-[#008580] text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                      {createMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                      {editingId ? "Lưu thay đổi" : "Tạo mới"}
                   </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- CONTENT DISPLAY --- */}
      
      {/* 1. MOBILE VIEW (CARDS) - Chỉ hiện trên màn hình nhỏ */}
      <div className="block md:hidden space-y-4">
         {!rules || rules.length === 0 ? (
             <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500 text-sm">
                Chưa có luật nào.
             </div>
         ) : (
            rules.map((item) => (
               <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="font-bold text-slate-800 text-base">{item.ruleName}</h4>
                        <p className="text-xs text-slate-500">{item.businessField || "Chưa phân loại"}</p>
                     </div>
                     <PriorityBadge value={item.priority} />
                  </div>
                  
                  {/* Card Info (Location/Investor from Master) */}
                  <div className="flex flex-col gap-1.5 mt-1">
                      {item.locations?.length ? (<div className="flex items-center gap-1.5 text-xs text-slate-700"><MapPin size={12} className="text-slate-400"/> {item.locations.slice(0, 3).join(", ")}{item.locations.length > 3 ? "..." : ""}</div>) : null}
                      {item.investor?.length ? (<div className="flex items-center gap-1.5 text-xs text-slate-600"><Building2 size={12} className="text-slate-400"/> {item.investor.slice(0, 2).join(", ")}{item.investor.length > 2 ? "..." : ""}</div>) : null}
                  </div>

                  {/* Card Footer: Budget + Action */}
                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <BudgetDisplay min={item.minBudget} max={item.maxBudget} />
                      
                      {/* Action Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Pencil className="mr-2 h-4 w-4" /> Sửa
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => deleteMutation.mutate(item.id!)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Xóa
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
               </div>
            ))
         )}
      </div>

      {/* 2. DESKTOP VIEW (TABLE) - Chỉ hiện trên màn hình MD trở lên */}
      <div className="hidden md:block rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-slate-50 border-slate-200">
              <TableHead className="w-[50px] font-bold text-slate-700">#</TableHead>
              <TableHead className="font-bold text-slate-700">Tên luật & Lĩnh vực</TableHead>
              <TableHead className="font-bold text-slate-700">Địa điểm & Chủ đầu tư</TableHead>
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
                  <TableRow key={item.id || index} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                    <TableCell className="text-slate-500 text-xs font-mono">{index + 1}</TableCell>
                    <TableCell>
                        <div className="font-bold text-slate-800 text-sm">{item.ruleName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.businessField || "—"}</div>
                    </TableCell>
                    <TableCell>
                        <div className="text-xs space-y-1">
                          {item.locations?.length ? (<div className="flex items-center gap-1 text-slate-700"><MapPin size={10}/> {item.locations.slice(0, 2).join(", ")}{item.locations.length > 2 ? "..." : ""}</div>) : null}
                          {item.investor?.length ? (<div className="flex items-center gap-1 text-slate-600"><Building2 size={10}/> {item.investor.slice(0, 1).join(", ")}{item.investor.length > 1 ? "..." : ""}</div>) : null}
                          {!item.locations?.length && !item.investor?.length && <span className="text-slate-400">—</span>}
                        </div>
                    </TableCell>
                    <TableCell>
                        <BudgetDisplay min={item.minBudget ?? 0} max={item.maxBudget ?? 0} />
                    </TableCell>
                    <TableCell>
                        <PriorityBadge value={item.priority ?? 3} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 text-slate-500 hover:text-[#009d98] hover:bg-[#009d98]/10"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => item.id && deleteMutation.mutate(item.id)} className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
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