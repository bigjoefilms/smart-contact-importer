"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Contact, CORE_FIELDS, CUSTOM_FIELDS, FIELD_LABELS } from "@/lib/firebase-service";

interface User {
  uid: string;
  name: string;
  email: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<"all" | "phone" | "email" | "agent">("all");
  const [sortField, setSortField] = useState<keyof Contact>("createdOn");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchContacts();
    fetchUsers();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts?limit=100');
      const data = await response.json();
      if (data.contacts) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getAgentName = (agentUid?: string) => {
    if (!agentUid) return "Unassigned";
    const user = users.find(u => u.uid === agentUid);
    return user ? user.name : "Unknown User";
  };

  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    switch (filterField) {
      case "phone":
        return contact.phone?.toLowerCase().includes(searchLower);
      case "email":
        return contact.email?.toLowerCase().includes(searchLower);
      case "agent":
        return getAgentName(contact.agentUid).toLowerCase().includes(searchLower);
      default:
        return (
          contact.firstName?.toLowerCase().includes(searchLower) ||
          contact.lastName?.toLowerCase().includes(searchLower) ||
          contact.phone?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          getAgentName(contact.agentUid).toLowerCase().includes(searchLower)
        );
    }
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const allFields = [...CORE_FIELDS, ...CUSTOM_FIELDS];

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
     
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">Loading contacts...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      // style={{
      //   backgroundImage: "url('/assets/background.png')",
      //   backgroundSize: "cover",
      //   backgroundPosition: "center center",
      //   backgroundAttachment: "fixed"
      // }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-[#0E4259] text-[32px] font-semibold mb-2">Contacts</h1>
            <p className="text-[#68818C] text-[17px]">
              Manage and view all your contacts ({filteredContacts.length} total)
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
              href="/contactFields"
              className="bg-[#0E4259] text-white px-6 py-3 rounded-[12px] hover:opacity-90 cursor-pointer transition-all duration-200 flex items-center gap-2 font-medium"
            >
             
              Manage Fields
            </Link>
          </div>
        </div>

        {/* Google Sheets-like Toolbar */}
        <div className="bg-white border border-[#DADCE0] rounded-t-[8px] p-4 mb-0">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/grid.png"
                  alt="spreadsheet"
                  width={20}
                  height={20}
                />
                <span className="text-[#3C4043] font-medium text-[14px]">Contacts</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-px h-6 bg-[#DADCE0]"></div>
                <span className="text-[#5F6368] text-[13px]">{sortedContacts.length} rows</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/search.png"
                  alt="search"
                  width={16}
                  height={16}
                  className="opacity-60"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 bg-[#F8F9FA] border border-[#DADCE0] rounded-[4px] text-[#3C4043] text-[13px] placeholder-[#5F6368] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8] w-48"
                />
              </div>
              
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value as "all" | "phone" | "email" | "agent")}
                className="px-3 py-1.5 bg-[#F8F9FA] border border-[#DADCE0] rounded-[4px] text-[#3C4043] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8] min-w-[120px]"
              >
                <option value="all" className="text-[#3C4043]">All Fields</option>
                <option value="phone" className="text-[#3C4043]">Phone</option>
                <option value="email" className="text-[#3C4043]">Email</option>
                <option value="agent" className="text-[#3C4043]">Agent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Google Sheets-like Table */}
        <div className="bg-white border border-[#DADCE0] border-t-0 rounded-b-[8px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#DADCE0]">
                  {/* Row number column header */}
                  <th className="border-r border-[#DADCE0] px-2 py-2 text-center text-[#3C4043] font-medium text-[13px] w-12 bg-[#F1F3F4] sticky left-0 z-10">
                    #
                  </th>
                  {allFields.map((field) => (
                    <th
                      key={field}
                      className="border-r border-[#DADCE0] px-3 py-2 text-left text-[#3C4043] font-medium text-[13px] cursor-pointer hover:bg-[#E8F0FE] transition-colors min-w-[120px] relative group"
                      onClick={() => handleSort(field as keyof Contact)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">
                          {FIELD_LABELS[field as keyof typeof FIELD_LABELS] || field}
                        </span>
                        {sortField === field && (
                          <Image
                            src={sortDirection === "asc" ? "/icons/arrow.png" : "/icons/down-arrow.png"}
                            alt="sort"
                            width={12}
                            height={12}
                            className="ml-1 flex-shrink-0"
                          />
                        )}
                      </div>
                      {/* Column resize handle */}
                      <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#1A73E8] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedContacts.map((contact, index) => (
                  <tr key={contact.id} className="hover:bg-[#F8F9FA] transition-colors group">
                    {/* Row number */}
                    <td className="border-r border-b border-[#DADCE0] px-2 py-2 text-center text-[#3C4043] text-[13px] w-12 bg-[#F1F3F4] font-medium sticky left-0 z-10">
                      {index + 1}
                    </td>
                    {allFields.map((field) => {
                      let value = contact[field];
                      
                      if (field === "agentUid") {
                        value = getAgentName(contact.agentUid);
                      } else if (field === "createdOn") {
                        value = formatDate(contact.createdOn);
                      }
                      
                      return (
                        <td key={field} className="border-r border-b border-[#DADCE0] px-3 py-2 text-[#3C4043] text-[13px] min-w-[120px] relative group">
                          <div className="flex items-center h-6">
                            {value ? (
                              <span className="truncate w-full">
                                {String(value)}
                              </span>
                            ) : (
                              <span className="text-[#9AA0A6] italic text-[12px]">N/A</span>
                            )}
                          </div>
                          {/* Cell selection indicator - Google Sheets style */}
                          <div className="absolute inset-0 border-2 border-[#1A73E8] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-sm"></div>
                          {/* Cell corner handle */}
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#1A73E8] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {sortedContacts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-[#68818C] text-[16px] mb-4">
                {searchTerm ? "No contacts found matching your search." : "No contacts available."}
              </div>
              {!searchTerm && (
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 bg-[#1970F3] text-white px-6 py-3 rounded-[12px] hover:bg-[#1970F3]/80 transition-colors font-medium"
                >
                  <Image
                    src="/icons/arrow.png"
                    alt="import"
                    width={16}
                    height={16}
                  />
                  Import Contacts
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Contact Count and Stats */}
        {sortedContacts.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 text-[#596A72] text-[14px]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#1970F3] rounded-full"></span>
                Total: {sortedContacts.length} contacts
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#008D0E] rounded-full"></span>
                Assigned: {sortedContacts.filter(c => c.agentUid).length}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FF6B35] rounded-full"></span>
                Unassigned: {sortedContacts.filter(c => !c.agentUid).length}
              </span>
            </div>
            
            <div className="text-[#596A72] text-[12px]">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
