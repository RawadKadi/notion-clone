
## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd notion-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```bash
   VITE_CONVEX_URL=your_convex_deployment_url
   CONVEX_SITE_URL=http://localhost:5173
   ```

4. **Set up Convex Auth**
   - Run `npx convex dev` to start local development
   - Set `JWT_PRIVATE_KEY` in your Convex dashboard environment variables
   - Configure auth providers in `convex/auth.config.ts`

5. **Start development servers**
   ```bash
   npm run dev
   ```

This will start:
- Frontend: http://localhost:5173
- Convex backend: http://127.0.0.1:3210
- Convex dashboard: http://127.0.0.1:6790

## 🔧 Key Components

### Document Management (`convex/documents.ts`)
- `createDocument` - Create new documents with title and visibility
- `updateDocument` - Update document title and visibility
- `deleteDocument` - Remove documents with ownership validation
- `getDocument` - Fetch single document with access control
- `listDocuments` - Get user's documents plus public ones
- `searchDocuments` - Full-text search across documents

### Real-time Collaboration
- **ProseMirrorEditor** - Rich text editor with collaborative editing
- **Presence** - Shows active users in current document
- **WebSocket connections** - Managed by Convex for real-time updates

### Authentication Flow
- Password and anonymous authentication providers
- Protected routes and document access control
- User session management

## 🎨 UI/UX Features

- **Clean Sidebar** - Document list with search and creation
- **Rich Editor** - ProseMirror-based editing with toolbar
- **Real-time Presence** - Avatar bubbles showing active collaborators
- **Share Functionality** - Copy shareable URLs or use Web Share API
- **Responsive Design** - Works on desktop and mobile devices

## 🔒 Security Features

- **Authentication Required** - Users must sign in to access documents
- **Document Ownership** - Users can only edit/delete their own documents
- **Access Control** - Private documents are only visible to owners
- **Public Sharing** - Public documents can be viewed by anyone with the link

## 🚀 Deployment

### Production Deployment
1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Deploy to Convex**
   ```bash
   npx convex deploy
   ```

3. **Set production environment variables**
   - Update `VITE_CONVEX_URL` to your production deployment URL
   - Set `CONVEX_SITE_URL` to your production domain

### Hosting Options
- **Vercel** - For frontend hosting
- **Netlify** - Alternative frontend hosting
- **Convex Cloud** - Backend hosting (included)

## 📈 Performance

- **Fast Initial Load** - Vite's optimized build system
- **Real-time Updates** - WebSocket connections for instant collaboration
- **Efficient Queries** - Convex indexing for fast document searches
- **Optimized Bundles** - Tree-shaking and code splitting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure `JWT_PRIVATE_KEY` is set in Convex environment variables
   - Check auth provider configuration in `convex/auth.config.ts`

2. **Real-time Not Working**
   - Verify WebSocket connections are not blocked
   - Check presence configuration

3. **Build Errors**
   - Ensure all dependencies are installed
   - Check TypeScript compiler options

### Getting Help

- Check the [Convex Documentation](https://docs.convex.dev/)
- Join the [Convex Community](https://convex.dev/community)
- Open an issue in this repository

## 🎯 Future Enhancements

- [ ] File uploads and attachments
- [ ] Document templates
- [ ] Advanced formatting options
- [ ] Comments and annotations
- [ ] Version history
- [ ] Mobile app
- [ ] Export to PDF/Markdown
- [ ] Integration with other tools

---

Built with ❤️ using modern web technologies and real-time collaboration features.
