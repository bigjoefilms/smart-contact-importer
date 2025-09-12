"use client";

import Image from "next/image";
import { useState } from "react";
import CustomerImportModal from "./components/customer/customer-import-modal";

export default function Home() {


  return (
    <main 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/assets/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed"
      }}
    >
     

      {/* Modal */}
      <CustomerImportModal 
   
      />
    </main>
  );
}

