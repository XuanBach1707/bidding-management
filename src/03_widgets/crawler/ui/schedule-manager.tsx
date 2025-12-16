"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Clock, Save, Trash2, Info, Plus, X, Pencil, RotateCcw, Loader2 } from "lucide-react"
import type { z } from "zod"

import { Button } from "@/shared/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { Checkbox } from "@/shared/ui/checkbox"
import { Label } from "@/shared/ui/label"
import { Badge } from "@/shared/ui/badge"
import { toast } from "@/shared/lib/hooks/use-toast"

import { scheduleSchema, type Schedule, scheduleApi } from "@/entities/crawler"

// Utils Helper: Dịch Cron sang tiếng Việt
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

// Type inferred từ Schema (có sourceUrl string)
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

  const createMutation = useMutation({
    mutationFn: scheduleApi.create,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["schedules"] })
        toast({ title: "Tạo lịch trình thành công" })
        resetForm()
    },
    onError: (err) => {
        console.error(err)
        toast({ title: "Lỗi khi tạo mới", variant: "destructive" })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number, data: Partial<Schedule> }) => scheduleApi.update(vars.id, vars.data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["schedules"] })
        toast({ title: "Cập nhật thành công" })
        setEditingId(null)
        resetForm()
    },
    onError: (err) => {
        console.error(err)
        toast({ title: "Lỗi khi cập nhật", variant: "destructive" })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: scheduleApi.delete,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["schedules"] })
        toast({ title: "Đã xóa lịch trình" })
        if (editingId) resetForm()
    },
    onError: (err) => {
        console.error(err)
        toast({ title: "Lỗi khi xóa", variant: "destructive" })
    }
  })

  const form = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      sourceUrl: "", // FIX: Đổi từ sourceId (0) sang string rỗng
      description: "",
      cronExpression: "0 8 * * *",
      isActive: true,
    },
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
        sourceUrl: item.sourceUrl, // FIX: Map sourceUrl
        description: item.description || "",
        cronExpression: item.cronExpression,
        isActive: item.isActive
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
    } catch(e) {
        console.error("Lỗi parse cron cũ", e)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    form.reset({
        sourceUrl: "", // FIX: Reset về string
        description: "",
        cronExpression: "0 8 * * *",
        isActive: true
    })
    setFrequency("daily")
    setMinute("00")
    setSelectedHours([8])
    setSelectedDays([1, 2, 3, 4, 5])
  }

  const onSubmit = (data: ScheduleFormValues) => {
    if (editingId) {
        updateMutation.mutate({ id: editingId, data: data as unknown as Partial<Schedule> })
    } else {
        createMutation.mutate(data as unknown as Omit<Schedule, "id">)
    }
  }

  const addHour = () => {
    const h = parseInt(tempHour)
    if (selectedHours.includes(h)) {
      toast({ title: "Giờ này đã có rồi!", variant: "destructive" })
      return
    }
    setSelectedHours([...selectedHours, h].sort((a, b) => a - b))
  }

  const removeHour = (h: number) => {
    if (selectedHours.length > 1) {
      setSelectedHours(selectedHours.filter((item) => item !== h))
    } else {
        toast({ title: "Cần ít nhất 1 khung giờ", variant: "destructive" })
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* --- PHẦN 1: FORM (Cột Trái - Chiếm 5/12) --- */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 bg-white rounded-lg border shadow-sm">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">
                        {editingId ? "Cập nhật" : "Tạo mới"}
                    </h2>
                    <p className="text-sm text-muted-foreground">Cấu hình lịch chạy Bot.</p>
                </div>
                {editingId && (
                    <Button variant="outline" size="sm" onClick={resetForm}>
                        <RotateCcw className="w-3 h-3 mr-2" /> Hủy
                    </Button>
                )}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="grid grid-cols-1 gap-4">
                    {/* FIELD: URL Nguồn (Đã sửa từ sourceId number -> sourceUrl text) */}
                    <FormField
                        control={form.control}
                        name="sourceUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL Nguồn dữ liệu</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="https://muasamcong.mpi.gov.vn..." 
                                    {...field} 
                                    value={field.value || ""} // Đảm bảo value không undefined
                                />
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
                            <FormLabel>Tên gợi nhớ</FormLabel>
                            <FormControl>
                                <Input placeholder="VD: Quét sáng..." {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-sm text-slate-700">Thời gian</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Tần suất</Label>
                            <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Hàng ngày</SelectItem>
                                    <SelectItem value="weekly">Hàng tuần</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Phút (0-59)</Label>
                            <Input 
                                className="h-8"
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
                        <Label className="text-xs">Giờ chạy</Label>
                        <div className="flex gap-2">
                            <Select value={tempHour} onValueChange={setTempHour}>
                                <SelectTrigger className="w-[100px] h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {Array.from({ length: 24 }, (_, i) => i).map(h => (
                                        <SelectItem key={h} value={h.toString()}>{h.toString().padStart(2, '0')}:00</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" variant="secondary" size="sm" onClick={addHour}>
                                <Plus className="w-3 h-3 mr-1" /> Thêm
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2 bg-white border rounded-md p-2 min-h-[40px]">
                            {selectedHours.map((h) => (
                                <Badge key={h} variant="secondary" className="px-1.5 py-0.5 text-xs flex gap-1 items-center">
                                    {h.toString().padStart(2, '0')}:{minute.padStart(2, '0')}
                                    <button type="button" onClick={() => removeHour(h)} className="hover:bg-red-200 rounded-full p-0.5">
                                        <X className="w-3 h-3 text-red-500" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {frequency === "weekly" && (
                        <div className="space-y-2 pt-2 border-t">
                            <Label className="text-xs">Ngày trong tuần</Label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS_OF_WEEK.map((day) => (
                                    <div key={day.value} className="flex items-center space-x-1.5">
                                        <Checkbox 
                                            id={`day-${day.value}`}
                                            checked={selectedDays.includes(day.value)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedDays([...selectedDays, day.value])
                                                else setSelectedDays(selectedDays.filter(d => d !== day.value))
                                            }}
                                        />
                                        <label htmlFor={`day-${day.value}`} className="text-xs cursor-pointer select-none">{day.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* --- PREVIEW KẾT QUẢ CRON (ĐÃ THÊM LẠI) --- */}
                <FormField
                    control={form.control}
                    name="cronExpression"
                    render={({ field }) => (
                        <FormItem className="bg-blue-50/50 p-3 rounded-md border border-blue-100">
                             <div className="flex justify-between items-center mb-1">
                                <FormLabel className="text-xs text-blue-600 font-semibold">Kết quả lịch trình:</FormLabel>
                                <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border text-slate-500">{field.value}</code>
                             </div>
                             <div className="flex gap-2 items-start text-sm text-blue-700">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span className="leading-tight">{parseCronToText(field.value)}</span>
                             </div>
                             <FormControl>
                                <Input type="hidden" {...field} value={field.value || ""} />
                             </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <FormLabel className="text-sm font-normal">Kích hoạt lịch trình này</FormLabel>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {editingId ? "Lưu thay đổi" : "Tạo lịch trình"}
                </Button>
                </form>
            </Form>
        </div>
      </div>

      {/* --- PHẦN 2: LIST (Cột Phải - Chiếm 7/12) --- */}
      <div className="lg:col-span-7">
         <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-semibold">Danh sách lịch trình</h3>
                <Badge variant="outline" className="bg-white">{schedules?.length || 0} items</Badge>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-10">
                                <Loader2 className="animate-spin w-6 h-6 mx-auto text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    ) : schedules?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                Chưa có dữ liệu.
                            </TableCell>
                        </TableRow>
                    ) : (
                        schedules?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{item.description || "(Trống)"}</span>
                                        {/* HIỂN THỊ SOURCE URL TRUNCATE */}
                                        <span 
                                            className="text-xs text-muted-foreground max-w-[200px] truncate block" 
                                            title={item.sourceUrl}
                                        >
                                            Src: {item.sourceUrl}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {parseCronToText(item.cronExpression)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.isActive ? "default" : "secondary"} className="text-[10px] px-1.5 h-5">
                                        {item.isActive ? "Active" : "Paused"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                                        <Pencil className="w-3.5 h-3.5 text-blue-500" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                                        onClick={() => item.id && deleteMutation.mutate(item.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
      </div>
    </div>
  )
}