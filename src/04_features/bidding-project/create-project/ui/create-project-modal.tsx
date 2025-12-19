"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  createBiddingProjectSchema, 
  CreateBiddingProjectDto, 
  biddingProjectApi 
} from "@/entities/bidding-project";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/shared/ui/dialog";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  hsmtId: number;
  defaultName: string; 
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  hsmtId, 
  defaultName 
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // GIẢI PHÁP: Không truyền Generic cho useForm để nó tự suy luận từ Schema
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createBiddingProjectSchema),
    defaultValues: {
      name: defaultName,
      status: "New",
      sourcePackageId: hsmtId 
    }
  });

  // Sử dụng FieldValues cho tham số đầu vào để khớp với handleSubmit mặc định
  const onSubmit = async (values: FieldValues) => {
    try {
      setSubmitting(true);
      
      // Ép kiểu về DTO chuẩn trước khi gửi API
      const payload = values as CreateBiddingProjectDto;
      
      const response = await biddingProjectApi.create(payload);
      
      toast({
        title: "Thành công",
        description: `Dự án "${payload.name}" đã được khởi tạo.`,
      });

      onClose();
      router.push(`/bidding-projects/${response.id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi hệ thống",
        description: error?.message || "Không thể tạo dự án lúc này."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Khởi tạo Dự án</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Dự án này sẽ được tạo dựa trên Hồ sơ mời thầu hiện tại.
          </DialogDescription>
        </DialogHeader>
        
        {/* Lỗi Argument of type... sẽ biến mất vì onSubmit bây giờ dùng FieldValues */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Tên dự án đấu thầu <span className="text-red-500">*</span>
            </label>
            <input 
              {...register("name")}
              autoFocus
              className={`w-full border-b-2 p-2 text-base font-medium outline-none transition-all ${
                errors.name 
                  ? 'border-red-500 focus:border-red-600' 
                  : 'border-gray-200 focus:border-blue-500 bg-transparent'
              }`}
              placeholder="Nhập tên dễ nhớ cho dự án..."
            />
            {errors.name && (
              <p className="text-red-500 text-[10px] font-semibold">
                {String(errors.name.message)}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Để sau
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-8 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : "Bắt đầu dự án"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};