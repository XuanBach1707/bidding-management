"use client";
import React, { useState } from 'react';
import { AbacPolicy } from '@/entities/abac';

// Import các Widgets
import { PolicyListTable } from '@/widgets/abac/policy-list';
import { PolicyEditor } from '@/widgets/abac/policy-editor';
import { PolicySimulator } from '@/widgets/abac/policy-simulator';
import { AttributeDictionary } from '@/widgets/abac/attribute-dictionary'; // Widget mới tách

export const AbacConfigPage = () => {
  const [activeTab, setActiveTab] = useState<'policies' | 'simulator' | 'attributes'>('policies');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AbacPolicy | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateNew = () => {
    setEditingPolicy(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (policy: AbacPolicy) => {
    setEditingPolicy(policy);
    setIsDrawerOpen(true);
  };

  const handleSaveSuccess = () => {
    setIsDrawerOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cấu hình Phân quyền (ABAC)</h1>
          <p className="text-sm text-gray-500">Quản lý chính sách truy cập và từ điển thuộc tính hệ thống</p>
        </div>
        
        {activeTab === 'policies' && (
          <button 
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-all font-bold"
          >
            <span className="text-xl">+</span> Tạo Chính Sách
          </button>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-1 mb-6 border-b border-gray-300">
        {[
          { id: 'policies', label: 'Danh sách Chính sách', color: 'text-blue-600' },
          { id: 'simulator', label: 'Giả lập (Simulator)', color: 'text-indigo-600' },
          { id: 'attributes', label: 'Từ điển Attributes', color: 'text-green-600' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-bold rounded-t-lg transition-all ${
              activeTab === tab.id 
                ? `bg-white ${tab.color} border border-b-0 border-gray-300 shadow-sm translate-y-[1px]` 
                : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'policies' && <PolicyListTable key={refreshKey} onEdit={handleEdit} />}
        {activeTab === 'simulator' && <PolicySimulator />}
        {activeTab === 'attributes' && <AttributeDictionary />}
      </div>

      {/* EDITOR DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)} />
      )}

      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-5xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {isDrawerOpen && (
          <PolicyEditor 
            initialPolicy={editingPolicy}
            onSuccess={handleSaveSuccess}
            onCancel={() => setIsDrawerOpen(false)}
          />
        )}
      </div>
    </div>
  );
};