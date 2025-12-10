import { LoginForm } from "@/04_features/auth"; // Import Feature vào

export const LoginPage = () => {
  return (
    // 1. PAGE chịu trách nhiệm về Layout (Full màn hình, căn giữa, màu nền)
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      
      {/* 2. PAGE chịu trách nhiệm về Context (Logo, Tiêu đề trang) */}
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter text-primary">
            PMS Construction
          </h1>
          <p className="text-muted-foreground">
            Hệ thống quản lý đấu thầu tập trung
          </p>
        </div>

        {/* 3. Gọi Feature ra dùng */}
        <LoginForm />
        
        {/* Footer của trang (nếu có) */}
        <div className="text-center text-sm text-slate-500">
          &copy; 2025 PMS Corp. All rights reserved.
        </div>
      </div>
    </div>
  );
};