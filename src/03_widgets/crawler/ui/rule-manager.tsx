"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import * as z from "zod";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/shared/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/ui/select"; // <-- NHỚ IMPORT CÁI NÀY
import { useToast } from "@/shared/lib/hooks/use-toast";
import { Badge } from "@/shared/ui/badge"; // Thêm Badge cho đẹp

import { ruleApi, ruleSchema, type Rule } from "@/entities/crawler";

// --- HELPERS ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' } as const).format(value);
};

const readMoneyToText = (number: number) => {
  if (!number) return "";
  const config = { style: 'currency', currency: 'VND' } as const; 
  return new Intl.NumberFormat('vi-VN', config).format(number); 
};

// --- CONSTANT PRIORITY ---
const PRIORITY_OPTIONS = [
  { value: 1, label: "1 - Cao nhất" },
  { value: 2, label: "2 - Cao" },
  { value: 3, label: "3 - Trung bình" },
  { value: 4, label: "4 - Thấp" },
  { value: 5, label: "5 - Thấp nhất" },
];

const getPriorityLabel = (val: number) => {
  return PRIORITY_OPTIONS.find(p => p.value === val)?.label || `${val} - Không xác định`;
}

// --- ARRAY INPUT ---
interface ArrayInputProps {
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

const ArrayInput = ({ value = [], onChange, placeholder }: ArrayInputProps) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (Array.isArray(value)) {
      setInputValue(value.join(", "));
    }
  }, [value]);

  const handleBlur = () => {
    if (!inputValue.trim()) {
      onChange([]);
      return;
    }
    const arr = inputValue.split(",").map((s) => s.trim()).filter((s) => s !== "");
    onChange(arr);
    setInputValue(arr.join(", "));
  };

  return (
    <Textarea
      placeholder={placeholder}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      className="min-h-[80px]"
    />
  );
};

// Type onSubmit
type CrawlerRuleFormValues = z.infer<typeof ruleSchema>;

export const CrawlerRuleManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: rules, isLoading } = useQuery({
    queryKey: ["crawler-rules"],
    queryFn: ruleApi.getAll,
  });

  const form = useForm({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      ruleName: "",
      businessField: "",
      keywordsInclude: [],
      keywordsExclude: [],
      minBudget: 0,
      maxBudget: 0,
      locations: [],
      priority: 3, // Mặc định là Trung bình (3) cho an toàn
    },
  });

  const createMutation = useMutation({
    mutationFn: ruleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler-rules"] });
      setIsOpen(false);
      form.reset();
      toast({ title: "Thành công", description: "Đã tạo luật mới" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; data: Partial<Rule> }) =>
      ruleApi.update(vars.id, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler-rules"] });
      setIsOpen(false);
      setEditingId(null);
      form.reset();
      toast({ title: "Thành công", description: "Đã cập nhật luật" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ruleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler-rules"] });
      toast({ title: "Đã xóa", description: "Luật đã bị xóa" });
    },
  });

  const onSubmit = (values: CrawlerRuleFormValues) => {
    const payload = values as unknown as Rule; 

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
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
      priority: 3, // Reset về 3
    });
    setIsOpen(true);
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Danh sách Luật Crawl</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> Thêm luật</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Cập nhật luật" : "Tạo luật mới"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
                
                {/* Rule Name */}
                <FormField
                  control={form.control}
                  name="ruleName"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Tên luật</FormLabel>
                      <FormControl><Input {...field} value={field.value as string} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessField"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Lĩnh vực</FormLabel>
                      <FormControl><Input {...field} placeholder="VD: Công nghệ thông tin" value={field.value as string} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Keywords Include */}
                <FormField
                  control={form.control}
                  name="keywordsInclude"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Từ khóa bao gồm</FormLabel>
                      <FormControl>
                        <ArrayInput 
                            value={field.value as string[]} 
                            onChange={field.onChange} 
                            placeholder="VD: laptop, máy tính" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 {/* Keywords Exclude */}
                 <FormField
                  control={form.control}
                  name="keywordsExclude"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Từ khóa loại trừ</FormLabel>
                      <FormControl>
                        <ArrayInput 
                            value={field.value as string[]} 
                            onChange={field.onChange} 
                            placeholder="VD: cũ, hỏng" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Min Budget */}
                <FormField
                  control={form.control}
                  name="minBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngân sách tối thiểu</FormLabel>
                      <FormControl>
                        <Input 
                            type="number" 
                            {...field} 
                            value={field.value as number} 
                            onChange={e => field.onChange(e.target.valueAsNumber)} 
                        />
                      </FormControl>
                      {(field.value as number) > 0 && (
                          <FormDescription className="text-blue-600 font-medium">
                            {readMoneyToText(field.value as number)}
                          </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 
                {/* Max Budget */}
                 <FormField
                  control={form.control}
                  name="maxBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngân sách tối đa</FormLabel>
                      <FormControl>
                        <Input 
                            type="number" 
                            {...field} 
                            value={field.value as number} 
                            onChange={e => field.onChange(e.target.valueAsNumber)} 
                        />
                      </FormControl>
                       {(field.value as number) > 0 && (
                          <FormDescription className="text-blue-600 font-medium">
                            {readMoneyToText(field.value as number)}
                          </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Locations */}
                <FormField
                  control={form.control}
                  name="locations"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Địa điểm</FormLabel>
                      <FormControl>
                          <ArrayInput 
                            value={field.value as string[]} 
                            onChange={field.onChange} 
                            placeholder="Hà Nội, Hồ Chí Minh" 
                          />
                      </FormControl>
                      <FormDescription>Nhập các địa điểm cách nhau bởi dấu phẩy</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* --- PRIORITY: SELECT DROPDOWN --- */}
                 <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Độ ưu tiên</FormLabel>
                      <Select 
                        // Select của Shadcn nhận value là String
                        value={field.value?.toString()} 
                        // Khi change thì ép kiểu về Number
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn độ ưu tiên" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="col-span-2 mt-4" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Lưu thay đổi" : "Tạo mới"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên luật</TableHead>
              <TableHead>Lĩnh vực</TableHead>
              <TableHead>Từ khóa (Include)</TableHead>
              <TableHead>Ngân sách</TableHead>
              <TableHead>Độ ưu tiên</TableHead> {/* Thêm cột Priority */}
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.ruleName}</TableCell>
                <TableCell>{item.businessField}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                   {item.keywordsInclude?.join(", ")}
                </TableCell>
                <TableCell>
                    {formatCurrency(item.minBudget)} - {formatCurrency(item.maxBudget)}
                </TableCell>
                {/* Hiển thị Priority dạng Badge cho đẹp */}
                <TableCell>
                   <Badge variant={item.priority === 1 ? "destructive" : item.priority === 2 ? "default" : "secondary"}>
                      {getPriorityLabel(item.priority)}
                   </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteMutation.mutate(item.id!)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};