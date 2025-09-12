# Smart Contact Importer

## Project Overview
This is a web application for importing and managing contacts from Excel/CSV files, featuring AI-powered field mapping and intelligent data processing.

## Key Features
- **4-Step Import Process**: Detect fields, map to CRM fields, validate data, and import
- **AI-Powered Field Mapping**: Automatically detects and maps contact fields
- **Real-time Loading States**: Visual feedback during all operations
- **Database Integration**: Firebase integration for contact storage
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Custom Field Management**: Add and manage custom contact fields
- **Data Validation**: Duplicate detection and error checking
- **Step-by-Step Progress**: Visual indicators for import progress

## Tech Stack
- **Next.js 15**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Firebase Firestore**
- **XLSX Parser**
- **AI Integration**

## Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Firebase project setup

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smart-contact-importer.git
cd smart-contact-importer
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root and add:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open http://localhost:3000 in your browser.

## Design Choices and Considerations

### Import Process
- **Step 1**: AI-powered field detection from uploaded files
- **Step 2**: Manual field mapping with AI suggestions
- **Step 3**: Data validation and duplicate checking
- **Step 4**: Final confirmation and database import

### Loading States
- Implemented comprehensive loading spinners for all async operations
- Visual feedback during processing, checking, and importing
- Disabled states prevent multiple simultaneous operations

### Data Management
- Firebase Firestore for scalable contact storage
- Custom field support for flexible data structures
- Real-time validation and error handling

## Current Features
- ✅ Complete 4-step import workflow
- ✅ AI field mapping and suggestions
- ✅ Loading states and user feedback
- ✅ Firebase database integration
- ✅ Responsive design
- ✅ Custom field management
- ✅ Data validation and error checking

## Future Improvements
- **Batch Processing**: Handle larger files with pagination
- **Advanced Filtering**: More sophisticated search and filter options
- **Export Functionality**: Export contacts to various formats
- **Bulk Operations**: Select and manage multiple contacts
- **Analytics Dashboard**: Import statistics and insights
- **User Authentication**: Multi-user support with role-based access

## Deployment
The application is ready for deployment on Vercel, Netlify, or any Next.js-compatible platform.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
This project is licensed under the MIT License.