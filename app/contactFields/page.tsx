"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CORE_FIELDS, CUSTOM_FIELDS, FIELD_LABELS, FIELD_TYPES } from "@/lib/firebase-service";

interface CustomField {
  id: string;
  name: string;
  label: string;
  type: string;
  isCore: boolean;
  isRequired: boolean;
}

export default function ContactFieldsPage() {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadCustomFields();
  }, []);

  const loadCustomFields = () => {
    // Load core fields
    const coreFields: CustomField[] = CORE_FIELDS.map(field => ({
      id: field,
      name: field,
      label: FIELD_LABELS[field as keyof typeof FIELD_LABELS] || field,
      type: FIELD_TYPES[field as keyof typeof FIELD_TYPES] || "text",
      isCore: true,
      isRequired: true
    }));

    // Load custom fields
    const customFieldsData: CustomField[] = CUSTOM_FIELDS.map(field => ({
      id: field,
      name: field,
      label: FIELD_LABELS[field as keyof typeof FIELD_LABELS] || field,
      type: FIELD_TYPES[field as keyof typeof FIELD_TYPES] || "text",
      isCore: false,
      isRequired: false
    }));

    setCustomFields([...coreFields, ...customFieldsData]);
  };

  const handleAddField = () => {
    if (!newFieldName.trim() || !newFieldLabel.trim()) return;

    const newField: CustomField = {
      id: newFieldName.toLowerCase().replace(/\s+/g, '_'),
      name: newFieldName.toLowerCase().replace(/\s+/g, '_'),
      label: newFieldLabel,
      type: newFieldType,
      isCore: false,
      isRequired: false
    };

    setCustomFields(prev => [...prev, newField]);
    setNewFieldName("");
    setNewFieldLabel("");
    setNewFieldType("text");
    setShowAddForm(false);
  };

  const handleEditField = (fieldId: string, updates: Partial<CustomField>) => {
    setCustomFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    setCustomFields(prev => prev.filter(field => field.id !== fieldId));
  };

  const getFieldTypeOptions = () => [
    { value: "text", label: "Text" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "number", label: "Number" },
    { value: "datetime", label: "Date/Time" },
    { value: "textarea", label: "Long Text" }
  ];

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
    
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-[#0E4259] text-[32px] font-semibold mb-2">Contact Fields</h1>
            <p className="text-[#68818C] text-[17px]">
              Manage custom fields for your contacts
            </p>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link 
              href="/"
              className="bg-[#0E4259] text-white px-6 py-3 rounded-[12px] hover:opacity-90 cursor-pointer transition-all duration-200 flex items-center gap-2 font-medium"
            >
             
              Back to Home
            </Link>
            
            <Link 
              href="/contacts"
              className="bg-[#0E4259] text-white px-6 py-3 rounded-[12px] hover:opacity-90 cursor-pointertransition-all duration-200 flex items-center gap-2 font-medium"
            >
            
              View Contacts
            </Link>
          </div>
        </div>

        {/* Add New Field Form */}
        {showAddForm && (
          <div className="bg-[#FDFDFD] border border-[#EEEEEE] rounded-[16px] p-6 mb-6">
            <h3 className="text-[#0E4259] text-[20px] font-semibold mb-4">Add New Field</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#596A72] text-[14px] font-medium mb-2">
                  Field Name
                </label>
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="e.g., company_name"
                  className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[12px] text-[#0E4259] placeholder-[#68818C] focus:outline-none focus:ring-2 focus:ring-[#1970F3]/20 focus:border-[#1970F3]"
                />
              </div>
              
              <div>
                <label className="block text-[#596A72] text-[14px] font-medium mb-2">
                  Display Label
                </label>
                <input
                  type="text"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="e.g., Company Name"
                  className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[12px] text-[#0E4259] placeholder-[#68818C] focus:outline-none focus:ring-2 focus:ring-[#1970F3]/20 focus:border-[#1970F3]"
                />
              </div>
              
              <div>
                <label className="block text-[#596A72] text-[14px] font-medium mb-2">
                  Field Type
                </label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[12px] text-[#0E4259] focus:outline-none focus:ring-2 focus:ring-[#1970F3]/20 focus:border-[#1970F3]"
                >
                  {getFieldTypeOptions().map(option => (
                    <option key={option.value} value={option.value} className="text-[#0E4259]">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddField}
                className="bg-[#1970F3] text-white px-6 py-3 rounded-[12px] hover:bg-[#1970F3]/80 transition-colors flex items-center gap-2 font-medium"
              >
                <Image
                  src="/icons/check.png"
                  alt="add"
                  width={16}
                  height={16}
                />
                Add Field
              </button>
              
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-[#F4F5F6] text-[#596A72] px-6 py-3 rounded-[12px] hover:bg-[#E8F4FD] transition-colors flex items-center gap-2 font-medium"
              >
                <Image
                  src="/icons/close.png"
                  alt="cancel"
                  width={16}
                  height={16}
                />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Field Button */}
        {!showAddForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-[#0E4259] text-white px-6 py-3 rounded-[12px] hover:opacity-90 cursor-pointer transition-colors flex items-center gap-2 font-medium"
            >
             
          
              Add Custom Field
            </button>
          </div>
        )}

        {/* Fields List */}
        <div className="space-y-4">
          {customFields.map((field) => (
            <div key={field.id} className="bg-[#FDFDFD] border border-[#EEEEEE] rounded-[16px] p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-[#0E4259] text-[18px] font-semibold">
                      {field.label}
                    </h3>
                    
                    {field.isCore && (
                      <span className="px-3 py-1 bg-[#E8FFE6] text-[#008D0E] border border-[#B0F0C2] rounded-[8px] text-[12px] font-medium">
                        Core Field
                      </span>
                    )}
                    
                    {!field.isCore && (
                      <span className="px-3 py-1 bg-[#E7F5FB] text-[#1970F3] border border-[#AACCFF] rounded-[8px] text-[12px] font-medium">
                        Custom Field
                      </span>
                    )}
                    
                    {field.isRequired && (
                      <span className="px-3 py-1 bg-[#FFF3CD] text-[#856404] border border-[#FFEAA7] rounded-[8px] text-[12px] font-medium">
                        Required
                      </span>
                    )}
                  </div>
                  
                  <div className="text-[#596A72] text-[14px] flex items-center gap-4">
                    <span><span className="font-medium">Field Name:</span> {field.name}</span>
                    <span>•</span>
                    <span><span className="font-medium">Type:</span> {field.type}</span>
                    <span>•</span>
                    <span><span className="font-medium">Required:</span> {field.isRequired ? "Yes" : "No"}</span>
                  </div>
                </div>
                
                {!field.isCore && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingField(field.id)}
                      className="p-2 text-[#596A72] hover:text-[#1970F3] hover:bg-[#E8F4FD] rounded-[8px] transition-colors"
                    >
                      <Image
                        src="/icons/edit.png"
                        alt="edit"
                        width={16}
                        height={16}
                      />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="p-2 text-[#FF6B35] hover:text-[#E55A2B] hover:bg-[#FFF3F0] rounded-[8px] transition-colors"
                    >
                      <Image
                        src="/icons/close.png"
                        alt="delete"
                        width={16}
                        height={16}
                      />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Edit Form */}
              {editingField === field.id && (
                <div className="mt-4 pt-4 border-t border-[#EEEEEE]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[#596A72] text-[14px] font-medium mb-2">
                        Display Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleEditField(field.id, { label: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[12px] text-[#0E4259] placeholder-[#68818C] focus:outline-none focus:ring-2 focus:ring-[#1970F3]/20 focus:border-[#1970F3]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[#596A72] text-[14px] font-medium mb-2">
                        Field Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) => handleEditField(field.id, { type: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[12px] text-[#0E4259] focus:outline-none focus:ring-2 focus:ring-[#1970F3]/20 focus:border-[#1970F3]"
                      >
                        {getFieldTypeOptions().map(option => (
                          <option key={option.value} value={option.value} className="text-[#0E4259]">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={() => setEditingField(null)}
                        className="w-full bg-[#1970F3] text-white px-4 py-3 rounded-[12px] hover:bg-[#1970F3]/80 transition-colors font-medium"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {customFields.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[#68818C] text-[16px]">
              No fields available. Add some custom fields to get started.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
