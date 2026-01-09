"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Clock, Save, Trash2, Info, Plus, X, Pencil, RotateCcw, Loader2, CalendarClock, Globe } from "lucide-react"
import type { z } from "zod"

import { Button } from "@/shared/ui/button"
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/ui/table"
import { Checkbox } from "@/shared/ui/checkbox"
import { Label } from "@/shared/ui/label"
import { Badge } from "@/shared/ui/badge"
import { toast } from "@/shared/lib/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card"

import { scheduleSchema, type Schedule, scheduleApi } from "@/entities/crawler"

// --- UTILS ---
const DAYS_OF_WEEK = [
    { label: "CN", value: 0 }, { label: "T2", value: 1 }, { label: "T3", value: 2 },
    { label: "T4", value: 3 }, { label: "T5", value: 4 }, { label: "T6", value: 5 }, { label: "T7", value: 6 },
]

function parseCronToText(cron: string) {
    if (!cron) return "Chưa thiết lập"
    try {
        const parts = cron.split(" ")
        if (parts.length < 5) return cron
        const [min, hour, , , days] = parts
        
        const minStr = min.padStart(2, '0')
        const hoursList = hour.split(",").map(h => `${h.padStart(2, '0')}:${minStr}`).join(", ")
        
        if (days === "*" || days === "?") {
            return `Hàng ngày lúc ${hoursList}`
        } else {
            const dayNames = days.split(",").map(d => DAYS_OF_WEEK.find(i => i.value === Number(d))?.label).join(", ")
            return `${dayNames} lúc ${hoursList}`
        }
    } catch (e) {
        return cron
    }
}

type ScheduleFormValues = z.infer<typeof scheduleSchema>

export function ScheduleManager() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)

  // State UI Builder
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily")
  const [minute, setMinute] = useState<string>("00")
  const [selectedHours, setSelectedHours] = useState<number[]>([8])
  const [tempHour, setTempHour] = useState<string>("8")
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: scheduleApi.getAll
  })

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: scheduleApi.create,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["schedules"] })
        toast({ title: "Thành công", description: "Đã thêm lịch trình mới.", className: "bg-[#009d98] text-white border-none" })
        resetForm()
    },
    onError: () => toast({ title: "Lỗi", description: "Không thể tạo lịch trình.", variant: "destructive" })
  })

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number, data: Partial<Schedule> }) => scheduleApi.update(vars.id, vars.data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["schedules"] })
        toast({ title: "Cập nhật thành công", className: "bg-[#009d98] text-white border-none" })
        setEditingId(null)
        resetForm()
    },
    onError: () => toast({ title: "Lỗi", description: "Không thể cập nhật.", variant: "destructive" })
  })

  const deleteMutation = useMutation({
    mutationFn: scheduleApi.delete,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["schedules"] })
        toast({ title: "Đã xóa", description: "Lịch trình đã được gỡ bỏ." })
        if (editingId) resetForm()
    },
  })

  const form = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { sourceUrl: "", description: "", cronExpression: "0 8 * * *", isActive: true },
  })

  // Sync UI Builder -> Form
  useEffect(() => {
    const minInt = parseInt(minute) || 0
    const sortedHours = [...selectedHours].sort((a, b) => a - b)
    const hourString = sortedHours.length > 0 ? sortedHours.join(",") : "*"
    let dayString = "*"
    if (frequency === "weekly") {
      dayString = selectedDays.length > 0 ? selectedDays.join(",") : "*"
    }
    const cron = `${minInt} ${hourString} * * ${dayString}`
    
    if (form.getValues("cronExpression") !== cron) {
         form.setValue("cronExpression", cron)
    }
  }, [frequency, minute, selectedHours, selectedDays, form])

  const handleEdit = (item: Schedule) => {
    if (!item.id) return;
    setEditingId(item.id)
    form.reset({
        sourceUrl: item.sourceUrl, description: item.description || "", cronExpression: item.cronExpression, isActive: item.isActive
    })

    try {
        const [m, h, , , d] = item.cronExpression.split(" ")
        setMinute(m)
        setSelectedHours(h.split(",").map(Number))
        
        if (d === "*" || d === "?") {
            setFrequency("daily")
            setSelectedDays([1, 2, 3, 4, 5])
        } else {
            setFrequency("weekly")
            setSelectedDays(d.split(",").map(Number))
        }
    } catch(e) { console.error(e) }
  }

  const resetForm = () => {
    setEditingId(null)
    form.reset({ sourceUrl: "", description: "", cronExpression: "0 8 * * *", isActive: true })
    setFrequency("daily")
    setMinute("00")
    setSelectedHours([8])
    setSelectedDays([1, 2, 3, 4, 5])
  }

  const onSubmit = (data: ScheduleFormValues) => {
    editingId ? updateMutation.mutate({ id: editingId, data: data as any }) : createMutation.mutate(data as any)
  }

  const addHour = () => {
    const h = parseInt(tempHour)
    if (selectedHours.includes(h)) return
    setSelectedHours([...selectedHours, h].sort((a, b) => a - b))
  }

  const removeHour = (h: number) => {
    if (selectedHours.length > 1) setSelectedHours(selectedHours.filter((item) => item !== h))
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="grid gap-8 lg:grid-cols-12 items-start animate-in fade-in duration-500">
      
      {/* --- FORM CONFIG (Cột Trái - 5/12) --- */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-800">{editingId ? "Chỉnh sửa Lịch trình" : "Thêm Lịch trình Mới"}</CardTitle>
                        <CardDescription>Thiết lập thời gian để Bot tự động chạy.</CardDescription>
                    </div>
                    {editingId && (
                        <Button variant="ghost" size="sm" onClick={resetForm} className="text-slate-500 hover:text-slate-700">
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Hủy
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    
                    {/* 1. NGUỒN & MÔ TẢ */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="sourceUrl"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-bold flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5" /> URL Nguồn dữ liệu
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="https://muasamcong.mpi.gov.vn..." {...field} value={field.value || ""} className="bg-white font-mono text-sm" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-bold">Tên gợi nhớ</FormLabel>
                                <FormControl>
                                    <Input placeholder="VD: Quét gói thầu sáng thứ 2" {...field} value={field.value || ""} className="bg-white" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>

                    {/* 2. BỘ CHỌN THỜI GIAN (VISUAL BUILDER) */}
                    <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-200 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
                            <Clock className="w-4 h-4 text-[#009d98]" />
                            <span className="font-bold text-sm text-slate-700 uppercase tracking-wide">Cấu hình thời gian</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500">Tần suất</Label>
                                <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                                    <SelectTrigger className="h-9 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Hàng ngày</SelectItem>
                                        <SelectItem value="weekly">Hàng tuần</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500">Phút (0-59)</Label>
                                <Input 
                                    className="h-9 bg-white text-center font-mono"
                                    type="number" min={0} max={59} value={minute}
                                    onChange={(e) => {
                                        let val = e.target.value
                                        if(Number(val) > 59) val = "59"
                                        if(Number(val) < 0) val = "0"
                                        setMinute(val)
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-500">Khung giờ chạy (Giờ)</Label>
                            <div className="flex gap-2">
                                <Select value={tempHour} onValueChange={setTempHour}>
                                    <SelectTrigger className="w-[110px] h-9 bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {Array.from({ length: 24 }, (_, i) => i).map(h => (
                                            <SelectItem key={h} value={h.toString()}>{h.toString().padStart(2, '0')}:00</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" variant="outline" size="sm" onClick={addHour} className="h-9 text-[#009d98] border-[#009d98]/30 hover:bg-[#009d98]/5">
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Thêm
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2 min-h-[36px]">
                                {selectedHours.map((h) => (
                                    <Badge key={h} variant="secondary" className="pl-2 pr-1 py-1 text-xs bg-white border border-slate-200 text-slate-700 shadow-sm flex items-center gap-1">
                                        {h.toString().padStart(2, '0')}:{minute.padStart(2, '0')}
                                        <button type="button" onClick={() => removeHour(h)} className="hover:bg-red-100 rounded-full p-0.5 transition-colors ml-1">
                                            <X className="w-3 h-3 text-red-500" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {frequency === "weekly" && (
                            <div className="space-y-2 pt-2 border-t border-slate-200 border-dashed">
                                <Label className="text-xs font-semibold text-slate-500">Ngày trong tuần</Label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map((day) => (
                                        <div key={day.value} className="flex items-center space-x-1.5 bg-white px-2 py-1 rounded border border-slate-100">
                                            <Checkbox 
                                                id={`day-${day.value}`}
                                                checked={selectedDays.includes(day.value)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setSelectedDays([...selectedDays, day.value])
                                                    else setSelectedDays(selectedDays.filter(d => d !== day.value))
                                                }}
                                                className="w-3.5 h-3.5 data-[state=checked]:bg-[#009d98] data-[state=checked]:border-[#009d98]"
                                            />
                                            <label htmlFor={`day-${day.value}`} className="text-xs cursor-pointer select-none font-medium text-slate-600">{day.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* CRON PREVIEW */}
                    <div className="bg-[#009d98]/5 p-3 rounded-lg border border-[#009d98]/20 flex items-start gap-3">
                        <Info className="w-5 h-5 text-[#009d98] mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-[#009d98] uppercase tracking-wider mb-1">Kết quả lập lịch</p>
                            <p className="text-sm font-medium text-slate-700">{parseCronToText(form.watch("cronExpression"))}</p>
                            <code className="text-[10px] text-slate-400 mt-1 block font-mono">{form.watch("cronExpression")}</code>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <FormLabel className="text-sm font-medium cursor-pointer">Kích hoạt ngay sau khi lưu</FormLabel>
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" className="w-full bg-[#009d98] hover:bg-[#008580] text-white h-10 font-bold shadow-sm" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {editingId ? "Lưu thay đổi" : "Tạo Lịch Trình"}
                    </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>

      {/* --- DANH SÁCH LỊCH TRÌNH (Cột Phải - 7/12) --- */}
      <div className="lg:col-span-7">
         <Card className="border-slate-200 shadow-sm h-full bg-white">
            <CardHeader className="pb-4 border-b border-slate-50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-slate-500" />
                        <CardTitle className="text-lg font-bold text-slate-800">Danh sách Lịch trình</CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-mono">{schedules?.length || 0}</Badge>
                </div>
            </CardHeader>
            <div className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow className="hover:bg-slate-50 border-slate-100">
                            <TableHead className="font-bold text-slate-700 w-[40%]">Mô tả & Nguồn</TableHead>
                            <TableHead className="font-bold text-slate-700">Thời gian chạy</TableHead>
                            <TableHead className="font-bold text-slate-700 w-[100px]">Trạng thái</TableHead>
                            <TableHead className="text-right font-bold text-slate-700 w-[80px]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center">
                                    <Loader2 className="animate-spin w-6 h-6 mx-auto text-[#009d98]" />
                                </TableCell>
                            </TableRow>
                        ) : schedules?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center text-slate-400 italic">
                                    Chưa có lịch trình nào được tạo.
                                </TableCell>
                            </TableRow>
                        ) : (
                            schedules?.map((item) => (
                                <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                                    <TableCell className="align-top py-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-slate-800 text-sm">{item.description || "Chưa đặt tên"}</span>
                                            <div className="flex items-center gap-1 text-xs text-slate-500 max-w-[220px]" title={item.sourceUrl}>
                                                <Globe className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{item.sourceUrl}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top py-3">
                                        <div className="text-sm text-slate-700 font-medium">
                                            {parseCronToText(item.cronExpression)}
                                        </div>
                                        <code className="text-[10px] text-slate-400 font-mono mt-0.5 block">{item.cronExpression}</code>
                                    </TableCell>
                                    <TableCell className="align-top py-3">
                                        <Badge 
                                            className={`${item.isActive ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"} border shadow-none font-semibold px-2`}
                                        >
                                            {item.isActive ? "Đang chạy" : "Tạm dừng"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right align-top py-3">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#009d98] hover:bg-[#009d98]/10" onClick={() => handleEdit(item)}>
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => item.id && deleteMutation.mutate(item.id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
         </Card>
      </div>
    </div>
  )
}